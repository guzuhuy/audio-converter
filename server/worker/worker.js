// Example worker that processes convert jobs from BullMQ and runs ffmpeg
const { Worker } = require('bullmq');
const { convertToOgg } = require('../services/ffmpeg');
const path = require('path');

function startWorker(connectionOptions) {
  const worker = new Worker('convert', async job => {
    const { input, output, speed, amplify, maxDuration } = job.data;
    await convertToOgg(input, output, speed, amplify, maxDuration);
    return { success: true, output };
  }, { connection: connectionOptions });

  worker.on('completed', (job) => console.log('Job completed', job.id));
  worker.on('failed', (job, err) => console.error('Job failed', job.id, err));

  return worker;
}

module.exports = { startWorker };
