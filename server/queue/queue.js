// Optional: BullMQ queue wrapper (requires Redis)
const { Queue } = require('bullmq');

function createConvertQueue(connectionOptions) {
  const queue = new Queue('convert', { connection: connectionOptions });
  return queue;
}

module.exports = { createConvertQueue };
