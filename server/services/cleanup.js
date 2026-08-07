const fs = require('fs');
const path = require('path');

function removeOlderThan(dir, minutes) {
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - minutes * 60 * 1000;
  fs.readdirSync(dir).forEach(file => {
    try {
      const fp = path.join(dir, file);
      const stat = fs.statSync(fp);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(fp);
      }
    } catch (e) {
      // ignore
    }
  });
}

function startCleanup({ uploadsDir, tempDir, outputsDir, intervalMinutes = 10, ttlMinutes = 30 }) {
  // run immediately and then on interval
  removeOlderThan(uploadsDir, ttlMinutes);
  removeOlderThan(tempDir, ttlMinutes);
  removeOlderThan(outputsDir, ttlMinutes);

  setInterval(() => {
    removeOlderThan(uploadsDir, ttlMinutes);
    removeOlderThan(tempDir, ttlMinutes);
    removeOlderThan(outputsDir, ttlMinutes);
  }, intervalMinutes * 60 * 1000);
}

module.exports = { startCleanup };
