// Improved Convert Route with Queue Handling
// File: server/routes/convert-v2.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

let convertQueue;
let io;

// Initialize convert route with queue and socket.io
function initializeConvertRoute(queue, socketio) {
  convertQueue = queue;
  io = socketio;
}

// Configure multer for file uploads
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadsDir, req.user?.id || 'anonymous');
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '500') * 1024 * 1024),
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

/**
 * POST /convert/upload
 * Upload file dan add to conversion queue
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = uuidv4();
    const inputFile = req.file.path;
    const outputsDir = process.env.OUTPUTS_DIR || path.join(__dirname, '..', 'outputs');
    const outputFile = path.join(outputsDir, `${jobId}.ogg`);

    const jobData = {
      userId: req.user?.id || 'anonymous',
      jobId,
      inputFile,
      outputFile,
      speed: parseFloat(req.body.speed) || 1.0,
      amplify: parseFloat(req.body.amplify) || 0,
      maxDuration: parseInt(req.body.maxDuration) || 0,
      originalFileName: req.file.originalname,
      uploadedAt: new Date().toISOString(),
    };

    console.log(`📨 New conversion job received: ${jobId}`);
    console.log(`   User: ${jobData.userId}`);
    console.log(`   File: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`   Speed: ${jobData.speed}x, Amplify: ${jobData.amplify}dB`);

    // Add job to BullMQ queue
    const job = await convertQueue.add(jobId, jobData, {
      attempts: 3, // Retry 3 times
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
      },
      removeOnFail: false, // Keep failed jobs for debugging
    });

    console.log(`✅ Job ${jobId} added to queue (position: ${await convertQueue.count('pending')})`);

    // Emit socket event to notify client
    if (req.user?.id && io) {
      io.to(`user_${req.user.id}`).emit('job-queued', {
        jobId,
        position: await convertQueue.count('pending'),
        message: 'Conversion queued and waiting for processing',
      });
    }

    return res.status(202).json({
      success: true,
      jobId,
      status: 'queued',
      message: 'File received and queued for conversion',
      queuePosition: await convertQueue.count('pending'),
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Clean up uploaded file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      error: error.message,
      message: 'Failed to process upload',
    });
  }
});

/**
 * POST /convert/url
 * Download from URL and add to queue
 */
router.post('/url', express.json(), async (req, res) => {
  try {
    const { url, speed, amplify, maxDuration } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const jobId = uuidv4();
    const outputsDir = process.env.OUTPUTS_DIR || path.join(__dirname, '..', 'outputs');
    const outputFile = path.join(outputsDir, `${jobId}.ogg`);

    const jobData = {
      userId: req.user?.id || 'anonymous',
      jobId,
      sourceUrl: url,
      outputFile,
      speed: parseFloat(speed) || 1.0,
      amplify: parseFloat(amplify) || 0,
      maxDuration: parseInt(maxDuration) || 0,
      type: 'url',
      downloadedAt: new Date().toISOString(),
    };

    console.log(`🌐 New URL conversion job: ${jobId}`);
    console.log(`   User: ${jobData.userId}`);
    console.log(`   URL: ${url}`);

    const job = await convertQueue.add(jobId, jobData, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    });

    console.log(`✅ URL job ${jobId} queued`);

    res.status(202).json({
      success: true,
      jobId,
      status: 'queued',
      message: 'URL conversion queued',
    });
  } catch (error) {
    console.error('URL conversion error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * GET /convert/status/:jobId
 * Get conversion job status
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await convertQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        jobId,
      });
    }

    const state = await job.getState();
    const progress = job.progress();

    const status = {
      jobId,
      state,
      progress: progress || 0,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      createdAt: new Date(job.timestamp).toISOString(),
      finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    };

    // Determine HTTP status code based on job state
    let httpStatus = 200;
    if (state === 'failed') httpStatus = 400;
    if (state === 'active') httpStatus = 202;

    res.status(httpStatus).json(status);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /convert/jobs
 * Get all jobs for current user
 */
router.get('/jobs', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jobIds = await convertQueue.getJobIds(['completed', 'failed', 'active', 'pending']);
    const jobs = await Promise.all(
      jobIds.map((id) => convertQueue.getJob(id))
    );

    // Filter jobs for current user
    const userJobs = jobs
      .filter((job) => job && job.data.userId === req.user.id)
      .map((job) => ({
        jobId: job.id,
        state: job._progress,
        progress: job.progress(),
        createdAt: new Date(job.timestamp).toISOString(),
        finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
        data: job.data,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50); // Last 50 jobs

    res.json({
      total: userJobs.length,
      jobs: userJobs,
    });
  } catch (error) {
    console.error('Jobs list error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /convert/cancel/:jobId
 * Cancel a pending or active job
 */
router.post('/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await convertQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify job belongs to user
    if (job.data.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const state = await job.getState();

    if (state === 'completed' || state === 'failed') {
      return res.status(400).json({ error: `Cannot cancel ${state} job` });
    }

    await job.remove();

    console.log(`🔴 Job ${jobId} cancelled by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Job cancelled',
      jobId,
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /convert/download/:jobId
 * Download converted file
 */
router.get('/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await convertQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    if (state !== 'completed') {
      return res.status(400).json({
        error: 'Job not completed',
        state,
      });
    }

    const outputFile = job.data.outputFile;

    if (!fs.existsSync(outputFile)) {
      return res.status(404).json({ error: 'Output file not found' });
    }

    res.download(outputFile, `converted_${jobId}.ogg`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /convert/queue-stats
 * Queue statistics
 */
router.get('/queue-stats', async (req, res) => {
  try {
    const pending = await convertQueue.count('pending');
    const active = await convertQueue.count('active');
    const completed = await convertQueue.count('completed');
    const failed = await convertQueue.count('failed');
    const delayed = await convertQueue.count('delayed');

    res.json({
      queue: {
        pending,
        active,
        completed,
        failed,
        delayed,
        total: pending + active + completed + failed + delayed,
      },
      estimates: {
        avgProcessingTime: active > 0 ? '2-5 minutes' : 'N/A',
        estimatedWaitTime: pending > 0 ? `${Math.ceil(pending / 2)} minutes` : 'Immediate',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, initializeConvertRoute };
