const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { convertToOgg, splitAndConvertToOgg, getDuration } = require('../services/ffmpeg');
const { downloadAudio, getYoutubeMetadata } = require('../services/youtube');
const { zipFiles } = require('../services/zip');
const {
  canConvertNow,
  secondsUntilNextConversion,
  recordConversion,
  getUserPlan,
  isFreePlan,
  FREE_PLAN_MAX_DURATION_SECONDS,
  setRobloxConfig,
  clearRobloxConfig,
  getRobloxConfig
} = require('../services/userStats');

const { uploadAudio, checkOperationStatus, getAssetDetails } = require('../services/roblox');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const outputsDir = path.join(__dirname, '..', 'outputs');
const tempDir = path.join(__dirname, '..', 'temp');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

module.exports = function (io) {
  const router = express.Router();

  // Roblox Configuration Routes
  router.post('/roblox-config', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    
    let { apiKey, targetId, targetType } = req.body;
    if (!targetId || !targetType) {
      return res.status(400).json({ success: false, error: 'Target ID dan Tipe Pemilik wajib diisi.' });
    }

    // Mask check: if they sent '••••••••', do not overwrite their existing saved API key
    const currentConfig = getRobloxConfig(req.user.id);
    if (apiKey === '••••••••' || !apiKey) {
      if (currentConfig && currentConfig.apiKey) {
        apiKey = currentConfig.apiKey; // Keep existing
      } else {
        return res.status(400).json({ success: false, error: 'Roblox API Key wajib diisi untuk koneksi awal.' });
      }
    }

    setRobloxConfig(req.user.id, { apiKey, targetId, targetType });
    res.json({ success: true, message: 'Konfigurasi Roblox berhasil disimpan.' });
  });

  router.post('/roblox-disconnect', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    clearRobloxConfig(req.user.id);
    res.json({ success: true, message: 'Koneksi akun Roblox berhasil diputus.' });
  });

  async function handleRobloxUpload(job, downloads, apiKey, targetId, targetType) {
    for (const dl of downloads) {
      const partNumber = dl.partNumber;
      const totalParts = dl.totalParts;
      const filePath = path.join(outputsDir, dl.fileName);
      
      let baseTitle = job.title || 'V Studio Audio';
      // Strip file extension if any
      baseTitle = baseTitle.replace(/\.[^/.]+$/, "");

      // 1. Build the speed prefix (e.g. "0.40-")
      let prefix = "";
      if (job.playerSpeed) {
        prefix = `${Number(job.playerSpeed).toFixed(2)}-`;
      } else if (job.speed && job.speed !== 1.0) {
        prefix = `${Number(job.speed).toFixed(2)}-`;
      }

      // 2. If split into parts, prepend part number at the very beginning (e.g. "1-0.40-")
      if (totalParts > 1) {
        prefix = `${partNumber}-${prefix}`;
      }

      // 3. Assemble and safely truncate to keep under Roblox's 64-char limit
      let displayName = `${prefix}${baseTitle}`;
      if (displayName.length > 60) {
        const allowedLength = 60 - prefix.length;
        displayName = `${prefix}${baseTitle.substring(0, allowedLength)}`;
      }

      try {
        console.log(`Starting background Roblox upload for job ${job.id}, part ${partNumber}`);
        emitProgress(job.socketId, {
          jobId: job.id,
          partNumber,
          type: 'roblox-status',
          status: 'uploading',
          message: `Mengunggah ke Roblox (Bagian ${partNumber}/${totalParts})...`
        });

        const uploadResult = await uploadAudio(filePath, displayName, targetId, targetType, apiKey);
        if (!uploadResult.success) {
          emitProgress(job.socketId, {
            jobId: job.id,
            partNumber,
            type: 'roblox-status',
            status: 'error',
            message: `Roblox Upload Gagal: ${uploadResult.error}`
          });
          continue; // Move to next part
        }

        const operationPath = uploadResult.operationPath;
        emitProgress(job.socketId, {
          jobId: job.id,
          partNumber,
          type: 'roblox-status',
          status: 'pending',
          message: `Menunggu moderasi Roblox (Bagian ${partNumber}/${totalParts})...`
        });

        // Block and poll until this part is fully completed (Approved/Blocked/Error)
        await new Promise((resolve) => {
          let attempts = 0;
          const maxAttempts = 60; // 4 minutes total (15s average review, up to 4 minutes)
          let pollingAsset = false;
          let assetId = null;

          const intervalId = setInterval(async () => {
            attempts += 1;
            if (attempts > maxAttempts) {
              clearInterval(intervalId);
              emitProgress(job.socketId, {
                jobId: job.id,
                partNumber,
                type: 'roblox-status',
                status: 'error',
                message: `Waktu peninjauan moderasi habis.`
              });
              resolve(); // Let the loop continue to the next part
              return;
            }

            if (!pollingAsset) {
              // 1. Polling the Operation API
              const statusResult = await checkOperationStatus(operationPath, apiKey);
              if (!statusResult.success) {
                clearInterval(intervalId);
                emitProgress(job.socketId, {
                  jobId: job.id,
                  partNumber,
                  type: 'roblox-status',
                  status: 'error',
                  message: `Gagal memeriksa status: ${statusResult.error}`
                });
                resolve();
                return;
              }

              if (statusResult.done) {
                const responseData = statusResult.response;
                if (responseData) {
                  assetId = responseData.assetId;
                  
                  const modState = responseData.moderationResult 
                    ? responseData.moderationResult.moderationState 
                    : 'Reviewing';

                  if (modState === 'Approved') {
                    clearInterval(intervalId);
                    emitProgress(job.socketId, {
                      jobId: job.id,
                      partNumber,
                      type: 'roblox-status',
                      status: 'approved',
                      assetId,
                      message: `Roblox: Lolos (Asset ID: rbxassetid://${assetId})`
                    });
                    resolve();
                  } else if (modState === 'Blocked') {
                    clearInterval(intervalId);
                    emitProgress(job.socketId, {
                      jobId: job.id,
                      partNumber,
                      type: 'roblox-status',
                      status: 'blocked',
                      message: `Roblox: Diblokir (Copyright / Hak Cipta)`
                    });
                    resolve();
                  } else {
                    // Moderation state is Reviewing/Pending: Switch to polling Asset Details API!
                    pollingAsset = true;
                    emitProgress(job.socketId, {
                      jobId: job.id,
                      partNumber,
                      type: 'roblox-status',
                      status: 'pending',
                      message: `Roblox Moderasi: Reviewing`
                    });
                  }
                } else {
                  // If operation is done but response is missing
                  clearInterval(intervalId);
                  emitProgress(job.socketId, {
                    jobId: job.id,
                    partNumber,
                    type: 'roblox-status',
                    status: 'error',
                    message: `Gagal mendapatkan hasil unggah dari Roblox.`
                  });
                  resolve();
                }
              }
            } else {
              // 2. Polling the Asset Details API directly
              const detailResult = await getAssetDetails(assetId, apiKey);
              if (!detailResult.success) {
                clearInterval(intervalId);
                emitProgress(job.socketId, {
                  jobId: job.id,
                  partNumber,
                  type: 'roblox-status',
                  status: 'error',
                  message: `Gagal memeriksa status moderasi: ${detailResult.error}`
                });
                resolve();
                return;
              }

              const asset = detailResult.asset;
              const modState = asset && asset.moderationResult 
                ? asset.moderationResult.moderationState 
                : 'Reviewing';

              if (modState === 'Approved') {
                clearInterval(intervalId);
                emitProgress(job.socketId, {
                  jobId: job.id,
                  partNumber,
                  type: 'roblox-status',
                  status: 'approved',
                  assetId,
                  message: `Roblox: Lolos (Asset ID: rbxassetid://${assetId})`
                });
                resolve();
              } else if (modState === 'Blocked') {
                clearInterval(intervalId);
                emitProgress(job.socketId, {
                  jobId: job.id,
                  partNumber,
                  type: 'roblox-status',
                  status: 'blocked',
                  message: `Roblox: Diblokir (Copyright / Hak Cipta)`
                });
                resolve();
              } else {
                // Still reviewing/pending, keep polling
                emitProgress(job.socketId, {
                  jobId: job.id,
                  partNumber,
                  type: 'roblox-status',
                  status: 'pending',
                  message: `Roblox Moderasi: Reviewing`
                });
              }
            }
          }, 4000); // Poll every 4 seconds
        });

      } catch (err) {
        console.error(`Error in Roblox upload pipeline for job ${job.id}:`, err);
        emitProgress(job.socketId, {
          jobId: job.id,
          partNumber,
          type: 'roblox-status',
          status: 'error',
          message: `Terjadi kesalahan sistem saat mengunggah.`
        });
      }
    }
  }

  // Map to store auto-delete timers
  const autoDeleteTimers = new Map();

  function emitProgress(socketId, payload) {
    if (!socketId || !io) return;
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('progress', payload);
    }
  }

  // Queue state and processing helpers
  const conversionQueue = [];
  let isProcessing = false;

  async function processQueue() {
    if (isProcessing || conversionQueue.length === 0) return;
    isProcessing = true;

    const job = conversionQueue[0];
    try {
      console.log(`Starting queued job: ${job.id}`);
      emitProgress(job.socketId, { jobId: job.id, type: 'info', message: 'Memulai pemrosesan...', percent: 0 });

      let fileToConvert = job.file;

      if (job.url) {
        emitProgress(job.socketId, { jobId: job.id, type: 'info', message: 'Mengunduh audio YouTube...', percent: 0 });
        await downloadAudio(job.url, job.tempMp3);
        fileToConvert = job.tempMp3;

        // Perform free plan duration validation on downloaded file if needed
        if (isFreePlan(job.userId)) {
          const downloadedDuration = await getDuration(fileToConvert);
          if (!downloadedDuration || downloadedDuration > FREE_PLAN_MAX_DURATION_SECONDS) {
            throw new Error('Free plan hanya dapat mengonversi video berdurasi kurang dari 8 menit.');
          }
        }
      }

      emitProgress(job.socketId, { jobId: job.id, type: 'info', message: 'Memulai konversi audio...', percent: 0 });

      const result = await processAudio(
        fileToConvert,
        job.maxDuration,
        job.speed,
        job.amplify,
        job.playerSpeed,
        (progress) => {
          emitProgress(job.socketId, { ...progress, jobId: job.id });
        }
      );

      recordConversion(job.userId);
      const recommendedPlayerSpeed = job.playerSpeed || (job.speed ? Number((1 / job.speed).toFixed(2)) : null);

      emitProgress(job.socketId, {
        jobId: job.id,
        type: 'completed',
        result: {
          success: true,
          downloads: result.downloads,
          type: result.type,
          recommendedPlayerSpeed,
          restoreOriginal: job.restoreOriginal,
          title: job.title || null,
          thumbnail: job.thumbnail || null
        }
      });

      // Start Roblox background upload if selected
      if (job.uploadToRoblox) {
        const robloxConfig = getRobloxConfig(job.userId);
        if (robloxConfig && robloxConfig.apiKey && robloxConfig.targetId) {
          handleRobloxUpload(job, result.downloads, robloxConfig.apiKey, robloxConfig.targetId, robloxConfig.targetType)
            .catch(err => console.error('Error starting roblox background upload:', err));
        } else {
          emitProgress(job.socketId, {
            jobId: job.id,
            type: 'roblox-status',
            status: 'error',
            message: 'Upload ke Roblox batal: API Key / Target ID belum terhubung.'
          });
        }
      }
    } catch (err) {
      console.error(`Error in queued job ${job.id}:`, err);
      // Clean up temp file on failure if it exists
      if (job.tempMp3) {
        await deleteFile(job.tempMp3);
      }
      if (job.file) {
        await deleteFile(job.file);
      }
      emitProgress(job.socketId, { jobId: job.id, type: 'error', message: 'Konversi gagal: ' + err.message });
    } finally {
      // Remove completed job
      conversionQueue.shift();
      isProcessing = false;

      // Update positions for the rest of the queue
      updateQueuePositions();

      // Process next job
      processQueue();
    }
  }

  function updateQueuePositions() {
    conversionQueue.forEach((job, index) => {
      if (index > 0) {
        emitProgress(job.socketId, {
          jobId: job.id,
          type: 'info',
          message: `Mengantri... (Posisi antrean: ${index})`,
          percent: null,
          queuePosition: index
        });
      }
    });
  }

  function addJobToQueue(job) {
    conversionQueue.push(job);
    const position = conversionQueue.length - 1;

    if (position === 0) {
      processQueue();
    } else {
      emitProgress(job.socketId, {
        jobId: job.id,
        type: 'info',
        message: `Mengantri... (Posisi antrean: ${position})`,
        percent: null,
        queuePosition: position
      });
    }
  }

  function deleteFile(filePath) {
    return new Promise((resolve) => {
      if (fs.existsSync(filePath)) {
        fs.rm(filePath, { recursive: true, force: true }, (err) => {
          if (err) console.error('Error deleting file:', filePath, err);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  function setAutoDeleteTimer(fileName, outputPath) {
    if (autoDeleteTimers.has(fileName)) {
      clearTimeout(autoDeleteTimers.get(fileName));
    }

    const timer = setTimeout(async () => {
      try {
        const baseName = fileName.includes('-part-') ? fileName.split('-part-')[0] : fileName.split('.')[0];
        await deleteFile(outputPath);
        const files = fs.readdirSync(outputsDir);
        for (const file of files) {
          if (file.startsWith(`${baseName}-part-`)) {
            await deleteFile(path.join(outputsDir, file));
          }
        }
        console.log(`Auto-deleted files for: ${fileName}`);
        autoDeleteTimers.delete(fileName);
      } catch (err) {
        console.error('Error in auto-delete timer:', err);
      }
    }, 10 * 60 * 1000);

    autoDeleteTimers.set(fileName, timer);
  }

  function generateRandomBaseName(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let name = '';
    for (let i = 0; i < length; i += 1) {
      name += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return name;
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const totalSeconds = Math.round(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (value) => String(value).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  }

  async function processAudio(inputFile, maxDuration, speed, amplify, playerSpeed, progressCallback) {
    const baseName = generateRandomBaseName(6);
    const outputPattern = path.join(outputsDir, `${baseName}-part-%d.ogg`);
    const result = await splitAndConvertToOgg(inputFile, outputPattern, speed, amplify, maxDuration, playerSpeed, progressCallback);
    const parts = result.parts || [];
    const compensationMethod = result.compensationMethod || null;

    const downloads = parts.map((part, index) => ({
      fileName: path.basename(part.output),
      url: `/download/${path.basename(part.output)}`,
      partNumber: index + 1,
      totalParts: parts.length,
      durationSeconds: part.durationSeconds,
      formattedDuration: formatDuration(part.durationSeconds)
    }));

    parts.forEach((part) => {
      const fileName = path.basename(part.output);
      setAutoDeleteTimer(fileName, part.output);
    });

    return {
      type: 'ogg',
      downloads,
      files: parts.map((part) => part.output),
      compensationMethod
    };
  }

  async function getSocketId(req) {
    return req.headers['x-socket-id'] || req.body.socketId || null;
  }

  router.get('/youtube/metadata', async (req, res) => {
    try {
      const url = req.query.url;
      if (!url) return res.status(400).json({ success: false, error: 'URL is required' });
      const metadata = await getYoutubeMetadata(url);
      res.json({ success: true, data: metadata });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/upload', upload.single('file'), async (req, res) => {
    const socketId = await getSocketId(req);
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Authentication required for conversions.' });
      }

      if (!canConvertNow(req.user.id)) {
        const secondsLeft = secondsUntilNextConversion(req.user.id);
        const hours = Math.ceil(secondsLeft / 3600);
        return res.status(403).json({ success: false, error: `Free plan hanya boleh 1 konversi dalam 24 jam. Silakan coba lagi dalam ${hours} jam.` });
      }

      if (!req.file || !req.file.path) {
        return res.status(400).json({ success: false, error: 'File upload is required.' });
      }

      const file = req.file.path;
      if (isFreePlan(req.user.id)) {
        const fileDuration = await getDuration(file);
        if (!fileDuration || fileDuration > FREE_PLAN_MAX_DURATION_SECONDS) {
          await deleteFile(file);
          return res.status(400).json({ success: false, error: 'Free plan hanya dapat mengonversi file audio berdurasi kurang dari 8 menit.' });
        }
      }

      const speed = Number(req.body.speed) || 1;
      const amplify = Number(req.body.amplify) || 0;
      const requestedMax = Number(req.body.maxDuration);
      const maxDuration = (Number.isFinite(requestedMax) && requestedMax > 0) ? Math.min(requestedMax, 400) : 400;
      const restoreOriginal = req.body.restoreOriginal === 'true' || req.body.restoreOriginal === true;
      const compensate = restoreOriginal || req.body.compensate === 'true' || req.body.compensate === true;
      let playerSpeed = null;
      if (restoreOriginal && speed && speed > 0) {
        playerSpeed = Number((1 / speed).toFixed(2));
      } else if (compensate) {
        playerSpeed = Number(req.body.playerSpeed) || null;
      }

      const uploadToRoblox = req.body.uploadToRoblox === 'true' || req.body.uploadToRoblox === true;

      // Generate jobId and add to queue
      const jobId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      addJobToQueue({
        id: jobId,
        userId: req.user.id,
        socketId,
        file,
        title: req.file.originalname,
        maxDuration,
        speed,
        amplify,
        playerSpeed,
        restoreOriginal,
        uploadToRoblox
      });

      res.json({ success: true, jobId });
    } catch (err) {
      console.error(err);
      if (socketId) emitProgress(socketId, { type: 'error', message: 'Conversion failed: ' + err.message });
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/youtube', async (req, res) => {
    const socketId = await getSocketId(req);
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Authentication required for conversions.' });
      }

      if (!canConvertNow(req.user.id)) {
        const secondsLeft = secondsUntilNextConversion(req.user.id);
        const hours = Math.ceil(secondsLeft / 3600);
        return res.status(403).json({ success: false, error: `Free plan hanya boleh 1 konversi dalam 24 jam. Silakan coba lagi dalam ${hours} jam.` });
      }

      const url = req.body.url;
      if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
      }

      const metadata = await getYoutubeMetadata(url);
      const isFree = isFreePlan(req.user.id);
      if (isFree && metadata.duration && metadata.duration > FREE_PLAN_MAX_DURATION_SECONDS) {
        return res.status(400).json({ success: false, error: 'Free plan hanya dapat mengonversi video berdurasi kurang dari 8 menit.' });
      }

      const tempMp3 = path.join(tempDir, `${Date.now()}.mp3`);
      const speed = Number(req.body.speed) || 1;
      const amplify = Number(req.body.amplify) || 0;
      const requestedMax = Number(req.body.maxDuration);
      const maxDuration = (Number.isFinite(requestedMax) && requestedMax > 0) ? Math.min(requestedMax, 400) : 400;
      const restoreOriginal = req.body.restoreOriginal === 'true' || req.body.restoreOriginal === true;
      const compensate = restoreOriginal || req.body.compensate === 'true' || req.body.compensate === true;
      let playerSpeed = null;
      if (restoreOriginal && speed && speed > 0) {
        playerSpeed = Number((1 / speed).toFixed(2));
      } else if (compensate) {
        playerSpeed = Number(req.body.playerSpeed) || null;
      }

      const uploadToRoblox = req.body.uploadToRoblox === 'true' || req.body.uploadToRoblox === true;

      // Generate jobId and add to queue
      const jobId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      addJobToQueue({
        id: jobId,
        userId: req.user.id,
        socketId,
        url,
        tempMp3,
        maxDuration,
        speed,
        amplify,
        playerSpeed,
        restoreOriginal,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        uploadToRoblox
      });

      res.json({ success: true, jobId });
    } catch (err) {
      console.error(err);
      if (socketId) emitProgress(socketId, { type: 'error', message: 'Conversion failed: ' + err.message });
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/delete', async (req, res) => {
    try {
      const { downloads, downloadUrl } = req.body;
      if (!downloadUrl && (!downloads || downloads.length === 0)) {
        return res.status(400).json({ success: false, error: 'No download URL provided' });
      }

      const baseName = downloadUrl ? downloadUrl.split('/').pop().split('.')[0] : null;
      if (baseName) {
        const basePrefix = baseName.includes('-part-') ? baseName.split('-part-')[0] : baseName;
        const files = fs.readdirSync(outputsDir);
        for (const file of files) {
          if (file.startsWith(`${basePrefix}-part-`)) {
            await deleteFile(path.join(outputsDir, file));
            if (autoDeleteTimers.has(file)) {
              clearTimeout(autoDeleteTimers.get(file));
              autoDeleteTimers.delete(file);
            }
          }
        }
      }

      if (downloads && Array.isArray(downloads)) {
        for (const download of downloads) {
          const fileName = download.fileName || download.url?.split('/').pop();
          if (fileName) {
            const filePath = path.join(outputsDir, fileName);
            await deleteFile(filePath);
            if (autoDeleteTimers.has(fileName)) {
              clearTimeout(autoDeleteTimers.get(fileName));
              autoDeleteTimers.delete(fileName);
            }
          }
        }
      }

      try {
        const tempFiles = fs.readdirSync(tempDir);
        const now = Date.now();
        const thirtyMinutesAgo = now - (30 * 60 * 1000);
        for (const file of tempFiles) {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < thirtyMinutesAgo) {
            await deleteFile(filePath);
          }
        }
      } catch (err) {
        console.error('Error cleaning temp files:', err);
      }

      console.log(`Manual delete completed`);
      res.json({ success: true, message: 'Files deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
