// Production-Ready Worker Pool Configuration
// File: server/worker/worker-pool.js

const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { convertToOgg } = require('../services/ffmpeg');
const { uploadFile, deleteFile } = require('../services/storage');
const { recordConversion } = require('../services/userStats');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Get configuration from environment
const NUM_WORKERS = parseInt(process.env.NUM_WORKERS || '4');
const MAX_JOBS_PER_WORKER = parseInt(process.env.MAX_JOBS_PER_WORKER || '1');
const JOB_TIMEOUT_MS = parseInt(process.env.JOB_TIMEOUT_MS || '600000'); // 10 minutes

// Redis connection for workers
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  maxRetriesPerRequest: null,
};

// Monitoring metrics
const metrics = {
  processed: 0,
  failed: 0,
  totalDuration: 0,
  activeJobs: 0,
};

console.log(`🚀 Starting ${NUM_WORKERS} FFmpeg workers with ${MAX_JOBS_PER_WORKER} job(s) per worker`);
console.log(`⏱️  Job timeout: ${JOB_TIMEOUT_MS / 1000}s`);
console.log(`🔗 Redis: ${redisConnection.host}:${redisConnection.port}`);

// Start workers
const workers = [];

for (let i = 0; i < NUM_WORKERS; i++) {
  const worker = new Worker('convert', workerProcessor, {
    connection: redisConnection,
    concurrency: MAX_JOBS_PER_WORKER,
    settings: {
      lockDuration: JOB_TIMEOUT_MS,
      lockRenewTime: JOB_TIMEOUT_MS / 2,
    },
  });

  // Event handlers
  worker.on('completed', (job, result) => {
    metrics.processed++;
    metrics.totalDuration += result.duration || 0;
    console.log(
      `✅ [Worker ${i}] Job ${job.id} completed in ${(result.duration / 1000).toFixed(2)}s`
    );
  });

  worker.on('failed', (job, err) => {
    metrics.failed++;
    console.error(`❌ [Worker ${i}] Job ${job.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error(`⚠️  [Worker ${i}] Worker error:`, err);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`⏸️  [Worker ${i}] Job ${jobId} stalled - may be processing slowly`);
  });

  workers.push(worker);
}

console.log(`✅ All ${NUM_WORKERS} workers started successfully`);

/**
 * Main worker processor function
 * Handles the actual conversion work
 */
async function workerProcessor(job) {
  const startTime = Date.now();
  const jobId = job.id;
  const workerId = (Math.random() * NUM_WORKERS) | 0;

  try {
    console.log(`\n🔄 [${workerId}] Processing job: ${jobId}`);
    console.log(`📊 Job data:`, {
      userId: job.data.userId,
      inputFile: job.data.inputFile,
      outputFile: job.data.outputFile,
      speed: job.data.speed,
      amplify: job.data.amplify,
      maxDuration: job.data.maxDuration,
    });

    // Update job progress
    await job.updateProgress(10);

    // 1. Validate input file exists
    if (!fs.existsSync(job.data.inputFile)) {
      throw new Error(`Input file not found: ${job.data.inputFile}`);
    }

    console.log(`📁 Input file size: ${(fs.statSync(job.data.inputFile).size / 1024 / 1024).toFixed(2)}MB`);
    await job.updateProgress(15);

    // 2. Run FFmpeg conversion
    console.log(`🎵 Starting FFmpeg conversion...`);
    const conversionResult = await convertToOgg(
      job.data.inputFile,
      job.data.outputFile,
      job.data.speed,
      job.data.amplify,
      job.data.maxDuration
    );

    await job.updateProgress(60);

    // 3. Handle split files if needed
    let outputFiles = [job.data.outputFile];
    if (Array.isArray(conversionResult)) {
      outputFiles = conversionResult;
      console.log(`📦 Split into ${outputFiles.length} files`);
    }

    await job.updateProgress(70);

    // 4. Upload to cloud storage
    const uploadedUrls = [];
    for (let i = 0; i < outputFiles.length; i++) {
      const file = outputFiles[i];
      const key = `outputs/${job.data.userId}/${jobId}_${i}.ogg`;

      console.log(`☁️  Uploading file ${i + 1}/${outputFiles.length}: ${key}`);

      try {
        const url = await uploadFile(file, key);
        uploadedUrls.push(url);
        console.log(`✅ Uploaded: ${url}`);
      } catch (uploadErr) {
        console.error(`❌ Upload failed for ${file}:`, uploadErr.message);
        // Keep local file as fallback if cloud storage fails
        uploadedUrls.push(`local://${file}`);
      }
    }

    await job.updateProgress(85);

    // 5. Clean up local files
    console.log(`🧹 Cleaning up local files...`);
    for (const file of outputFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`🗑️  Deleted: ${file}`);
        }
      } catch (delErr) {
        console.warn(`⚠️  Could not delete ${file}:`, delErr.message);
      }
    }

    // Delete input file if it's from uploads
    try {
      if (job.data.inputFile.includes('uploads')) {
        fs.unlinkSync(job.data.inputFile);
        console.log(`🗑️  Deleted input: ${job.data.inputFile}`);
      }
    } catch (delErr) {
      console.warn(`⚠️  Could not delete input:`, delErr.message);
    }

    await job.updateProgress(90);

    // 6. Record conversion in database (if available)
    try {
      await recordConversion(job.data.userId, {
        inputFile: job.data.inputFile,
        outputCount: outputFiles.length,
        duration: (Date.now() - startTime) / 1000,
        status: 'completed',
      });
    } catch (dbErr) {
      console.warn(`⚠️  Could not record conversion in DB:`, dbErr.message);
    }

    await job.updateProgress(100);

    const duration = Date.now() - startTime;
    console.log(`\n✅ [${workerId}] Job ${jobId} completed successfully`);
    console.log(`⏱️  Total time: ${(duration / 1000).toFixed(2)}s`);

    return {
      success: true,
      jobId,
      outputCount: outputFiles.length,
      downloadUrls: uploadedUrls,
      duration,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ [${workerId}] Job ${jobId} failed after ${(duration / 1000).toFixed(2)}s`);
    console.error(`Error:`, error.message);
    console.error(`Stack:`, error.stack);

    // Record failure
    try {
      await recordConversion(job.data.userId, {
        status: 'failed',
        errorMessage: error.message,
        duration: duration / 1000,
      });
    } catch (dbErr) {
      console.warn(`⚠️  Could not record failure in DB:`, dbErr.message);
    }

    // Clean up any partial files
    try {
      if (fs.existsSync(job.data.outputFile)) {
        fs.unlinkSync(job.data.outputFile);
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  console.log(`\n📛 Received ${signal}, shutting down workers gracefully...`);

  try {
    // Wait for workers to finish current jobs
    await Promise.all(
      workers.map((w) =>
        w.close().catch((err) => console.warn(`⚠️  Worker close error:`, err))
      )
    );
    console.log(`✅ All workers shut down`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error during shutdown:`, err);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Health check function (export for external monitoring)
 */
function getMetrics() {
  const avgDuration = metrics.processed > 0 ? metrics.totalDuration / metrics.processed : 0;
  return {
    workersActive: workers.length,
    jobsProcessed: metrics.processed,
    jobsFailed: metrics.failed,
    averageDuration: (avgDuration / 1000).toFixed(2),
    timestamp: new Date().toISOString(),
  };
}

module.exports = { startWorkers: () => workers, getMetrics };

// Export for PM2
if (require.main === module) {
  console.log('Workers started. Press Ctrl+C to stop.');
}
