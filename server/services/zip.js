const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function zipFiles(files, outputZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve(outputZip));
    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);

    files.forEach((file) => {
      if (fs.existsSync(file)) {
        archive.file(file, { name: path.basename(file) });
      }
    });

    archive.finalize();
  });
}

module.exports = { zipFiles };