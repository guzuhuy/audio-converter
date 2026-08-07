// Health Check & Monitoring Endpoints
// File: server/routes/health.js

const express = require('express');
const Redis = require('ioredis');
const { Pool } = require('pg');
const router = express.Router();

// Initialize connections (these should come from your app initialization)
let redis, db, convertQueue;

function initializeHealthChecks(redisClient, pgPool, queue) {
  redis = redisClient;
  db = pgPool;
  convertQueue = queue;
}

/**
 * GET /health
 * Simple health check for load balancers
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/ready
 * Readiness check - returns 200 only if all services are ready
 */
router.get('/health/ready', async (req, res) => {
  try {
    const checks = await runReadinessChecks();

    if (checks.all_ready) {
      return res.status(200).json(checks);
    } else {
      return res.status(503).json(checks);
    }
  } catch (error) {
    return res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live
 * Liveness check - returns 200 if process is alive
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    uptime_seconds: process.uptime(),
  });
});

/**
 * GET /health/metrics
 * Detailed metrics for monitoring
 */
router.get('/health/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: getProcessMetrics(),
      redis: await getRedisMetrics(),
      database: await getDatabaseMetrics(),
      queue: await getQueueMetrics(),
    };

    res.status(200).json(metrics);
  } catch (error) {
    res.status(503).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/status
 * Comprehensive status report
 */
router.get('/health/status', async (req, res) => {
  try {
    const readiness = await runReadinessChecks();

    const status = {
      overall: readiness.all_ready ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        redis: readiness.redis ? 'connected' : 'disconnected',
        database: readiness.database ? 'connected' : 'disconnected',
        queue: readiness.queue ? 'active' : 'inactive',
      },
      metrics: {
        memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime_seconds: process.uptime(),
      },
    };

    if (readiness.all_ready) {
      res.status(200).json(status);
    } else {
      res.status(503).json(status);
    }
  } catch (error) {
    res.status(503).json({
      overall: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Helper functions
 */

async function runReadinessChecks() {
  const checks = {
    all_ready: true,
    redis: false,
    database: false,
    queue: false,
  };

  // Check Redis
  if (redis) {
    try {
      await redis.ping();
      checks.redis = true;
    } catch (e) {
      checks.redis = false;
      checks.all_ready = false;
    }
  }

  // Check Database
  if (db) {
    try {
      const result = await db.query('SELECT 1');
      checks.database = result.rows.length > 0;
    } catch (e) {
      checks.database = false;
      checks.all_ready = false;
    }
  }

  // Check Queue
  if (convertQueue) {
    try {
      const count = await convertQueue.count();
      checks.queue = true;
    } catch (e) {
      checks.queue = false;
      checks.all_ready = false;
    }
  }

  return checks;
}

function getProcessMetrics() {
  const mem = process.memoryUsage();
  return {
    uptime_seconds: process.uptime(),
    memory: {
      heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
      rss_mb: Math.round(mem.rss / 1024 / 1024),
      external_mb: Math.round(mem.external / 1024 / 1024),
    },
    cpu: process.cpuUsage(),
    node_version: process.version,
  };
}

async function getRedisMetrics() {
  if (!redis) return { status: 'not_configured' };

  try {
    const info = await redis.info('stats');
    const [keyCount] = await redis.scan('0', 'COUNT', '1');

    return {
      status: 'connected',
      info: info,
      key_count: keyCount,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

async function getDatabaseMetrics() {
  if (!db) return { status: 'not_configured' };

  try {
    const result = await db.query(`
      SELECT 
        (SELECT count(*) FROM conversions) as total_conversions,
        (SELECT count(*) FROM conversions WHERE status = 'completed') as completed,
        (SELECT count(*) FROM conversions WHERE status = 'failed') as failed,
        (SELECT count(*) FROM users) as total_users
    `);

    return {
      status: 'connected',
      stats: result.rows[0],
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

async function getQueueMetrics() {
  if (!convertQueue) return { status: 'not_configured' };

  try {
    const pending = await convertQueue.count('pending');
    const active = await convertQueue.count('active');
    const completed = await convertQueue.count('completed');
    const failed = await convertQueue.count('failed');

    return {
      status: 'active',
      pending,
      active,
      completed,
      failed,
      total: pending + active + completed + failed,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

module.exports = { router, initializeHealthChecks };
