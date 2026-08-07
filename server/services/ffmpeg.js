const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Resolve paths dynamically using env variables, system paths, or platform fallbacks
function resolveExecutable(envVar, defaultLocalName, windowsDefaultFallback, linuxDefaultFallback) {
  // 1. Try env variable if specified
  if (envVar) {
    const resolved = path.resolve(envVar);
    if (fs.existsSync(resolved)) {
      const stats = fs.statSync(resolved);
      if (stats.isFile()) return resolved;
      if (stats.isDirectory()) {
        const candidates = [
          path.join(resolved, defaultLocalName + (process.platform === 'win32' ? '.exe' : '')),
          path.join(resolved, 'bin', defaultLocalName + (process.platform === 'win32' ? '.exe' : '')),
          path.join(resolved, defaultLocalName)
        ];
        for (const c of candidates) {
          if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
        }
      }
    }
  }

  // 2. Try command line call / global execution (highly likely on VPS/production)
  try {
    const { spawnSync } = require('child_process');
    const result = spawnSync(defaultLocalName, [defaultLocalName === 'ffmpeg' ? '-version' : '-h'], { encoding: 'utf-8' });
    if (!result.error && result.status === 0) {
      return defaultLocalName;
    }
  } catch (err) {
    // ignore
  }

  // 3. Try windows fallback path if on windows
  if (process.platform === 'win32') {
    if (fs.existsSync(windowsDefaultFallback)) return windowsDefaultFallback;
  }

  // 4. Default linux system path
  if (fs.existsSync(linuxDefaultFallback)) return linuxDefaultFallback;

  return defaultLocalName; // fallback to name and hope it is in PATH
}

const ffmpegPath = resolveExecutable(
  process.env.FFMPEG_PATH,
  'ffmpeg',
  'C:\\ffmpeg-master-latest-win64-gpl-shared\\bin\\ffmpeg.exe',
  '/usr/bin/ffmpeg'
);

const ffprobePath = resolveExecutable(
  process.env.FFPROBE_PATH,
  'ffprobe',
  'C:\\ffmpeg-master-latest-win64-gpl-shared\\bin\\ffprobe.exe',
  '/usr/bin/ffprobe'
);

// Configure fluent-ffmpeg to use ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);
if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath);
}

const RUBBERBAND_AVAILABLE = checkRubberbandAvailable();

function checkRubberbandAvailable() {
  try {
    const output = execSync(`"${ffmpegPath}" -filters`, { encoding: 'utf-8' });
    return /\brubberband\b/i.test(output);
  } catch (err) {
    console.warn('Failed to probe ffmpeg filters for rubberband:', err.message);
    return false;
  }
}

function buildAtempoFilters(speed) {
  const filters = [];
  let value = Number(speed) || 1;
  if (value <= 0) value = 1;

  while (value > 2.0) {
    filters.push('atempo=2.0');
    value /= 2.0;
  }

  while (value < 0.5) {
    filters.push('atempo=0.5');
    value *= 2.0;
  }

  if (Math.abs(value - 1) > 0.0001) {
    filters.push(`atempo=${value.toFixed(8)}`);
  }

  return filters;
}

function getDuration(input) {
  return new Promise((resolve, reject) => {
    try {
      const cmd = `"${ffprobePath}" -v error -show_entries format=duration -of csv=p=0 "${input}"`;
      const output = execSync(cmd, { encoding: 'utf-8' }).trim();
      const duration = parseFloat(output);
      if (isNaN(duration)) {
        reject(new Error('Could not parse duration from ffprobe'));
      } else {
        resolve(duration);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function buildCompensationFilters(playerSpeed, input) {
  const filters = [];
  try {
    const p = Number(playerSpeed);
    if (!p || p <= 0) return { filters: [], method: null, fallbackFilters: [] };
    const F = p; // Use playerSpeed directly: if 0.40, we slow down to 0.4x so pitch stays normal at 2.5x player speed
    if (Math.abs(F - 1) < 0.0001) return { filters: [], method: null, fallbackFilters: [] };

    // We use a high sample rate of 96000 Hz for resampling to preserve high frequency vocal clarity (sibilance/presence).
    // When the audio is slowed down during playback (e.g. 0.40x), the effective sample rate remains high enough to cover the full audible spectrum.
    // E.g. 96000 * 0.40 = 38400 Hz (Nyquist 19200 Hz), ensuring vocals do not sound muffled or buried.
    const targetSampleRate = 96000;

    const asetrateFilter = (() => {
      try {
        const sampleCmd = `"${ffprobePath}" -v error -select_streams a:0 -show_entries stream=sample_rate -of csv=p=0 "${input}"`;
        const sampleOut = execSync(sampleCmd, { encoding: 'utf-8' }).trim();
        const sr = parseInt(sampleOut) || 44100;
        // F is playerSpeed, so asetrate should be divided by F to achieve slowdown with pitch compensation
        return `asetrate=${Math.floor(sr / F)},aresample=${targetSampleRate}`;
      } catch (e) {
        return `asetrate=${Math.floor(44100 / F)},aresample=${targetSampleRate}`;
      }
    })();

    // Always use asetrate for speed/pitch compensation since it has zero phase artifacts compared to rubberband.
    filters.push(asetrateFilter);
    return { filters, method: 'asetrate', fallbackFilters: [] };
  } catch (err) {
    return { filters: [], method: null, fallbackFilters: [] };
  }
}

function convertToOgg(
  input,
  output,
  speed,
  amplify,
  maxDuration,
  playerSpeed, // optional: if provided, pre-compensate audio so player speed restores original
  progressCallback = null,
  seekStart = 0,
  segmentDuration = null
) {
  return new Promise((resolve, reject) => {
    const filters = [];
    let compensationMethod = null;
    let fallbackFilters = [];

    // Compensation filters (should run first)
    if (playerSpeed) {
      const compObj = buildCompensationFilters(playerSpeed, input);
      if (compObj && compObj.filters && compObj.filters.length) {
        filters.push(...compObj.filters);
        compensationMethod = compObj.method || null;
        fallbackFilters = compObj.fallbackFilters || [];
      }
    }

    // Speed/tempo filters for final output
    if (!playerSpeed) {
      filters.push(...buildAtempoFilters(speed));
    }
    if (typeof amplify !== 'undefined' && amplify !== 0) {
      filters.push(`volume=${amplify}dB`);
    }

    const command = ffmpeg(input).audioCodec('libvorbis').audioQuality(8).format('ogg');

    if (seekStart && Number(seekStart) > 0) {
      command.seekInput(Number(seekStart));
    }

    if (filters.length > 0) {
      command.audioFilters(filters);
    }

    const durationToUse = segmentDuration || (maxDuration && Number(maxDuration) > 0 ? Number(maxDuration) : null);
    if (durationToUse) {
      command.duration(Number(durationToUse));
    }


    if (typeof progressCallback === 'function') {
      command.on('progress', (progress) => {
        if (progress && progress.percent) {
          progressCallback({ type: 'convert', message: 'Converting audio...', percent: Math.round(progress.percent) });
        }
      });
    }

    const finalize = async (finalOutput, finalCompensationMethod, finalFallbackFilters) => {
      try {
        const durationSeconds = await getDuration(finalOutput);
        resolve({ output: finalOutput, compensationMethod: finalCompensationMethod, fallbackFilters: finalFallbackFilters, durationSeconds });
      } catch (probeErr) {
        console.warn('Failed to probe duration for', finalOutput, probeErr.message);
        resolve({ output: finalOutput, compensationMethod: finalCompensationMethod, fallbackFilters: finalFallbackFilters, durationSeconds: null });
      }
    };

    command.save(output).on('end', () => finalize(output, compensationMethod, fallbackFilters)).on('error', async (err) => {
      // If rubberband failed and we have a fallback filter, retry with fallback.
      if (compensationMethod === 'rubberband' && fallbackFilters.length) {
        try {
          const retryCmd = ffmpeg(input).audioCodec('libvorbis').format('ogg');
          if (seekStart && Number(seekStart) > 0) {
            retryCmd.seekInput(Number(seekStart));
          }

          const retryFilters = [...fallbackFilters];
          if (!playerSpeed) {
            retryFilters.push(...buildAtempoFilters(speed));
          }
          if (typeof amplify !== 'undefined' && amplify !== 0) retryFilters.push(`volume=${amplify}dB`);
          if (retryFilters.length) retryCmd.audioFilters(retryFilters);

          if (durationToUse) {
            retryCmd.duration(Number(durationToUse));
          }

          retryCmd.save(output).on('end', () => finalize(output, 'asetrate', [])).on('error', (e) => reject(e));
          return;
        } catch (e) {
          return reject(err);
        }
      }
      return reject(err);
    });
  });
}

function splitAndConvertToOgg(input, outputPattern, speed, amplify, maxDuration, playerSpeed, progressCallback) {
  return new Promise(async (resolve, reject) => {
    try {
      const duration = await getDuration(input);
      let seg = Number(maxDuration);
      if (!Number.isFinite(seg) || seg <= 0) seg = 400;
      const speedFactor = Number(speed) || 1;
      const inputSegment = Math.max(1, seg * speedFactor);
      const segmentDuration = inputSegment;
      const numSegments = Math.ceil(duration / segmentDuration);

          if (numSegments <= 1) {
        const singleOutput = outputPattern.replace('%d', '1');
        const res = await convertToOgg(input, singleOutput, speed, amplify, null, playerSpeed, progressCallback, 0, seg);
        resolve({ parts: [{ output: res.output, durationSeconds: res.durationSeconds }], compensationMethod: res.compensationMethod });
        return;
      }

      const parts = [];
      let usedCompensationMethod = null;
      for (let i = 0; i < numSegments; i++) {
        const startTime = i * inputSegment;
        const partNumber = String(i + 1);
        const partOutput = outputPattern.replace('%d', partNumber);

        const res = await convertToOgg(
          input,
          partOutput,
          speed,
          amplify,
          null,
          playerSpeed,
          progressCallback,
          startTime,
          seg
        );

        parts.push({ output: res.output, durationSeconds: res.durationSeconds });
        if (res.compensationMethod) {
          usedCompensationMethod = res.compensationMethod;
        }
      }
      resolve({ parts, compensationMethod: usedCompensationMethod });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { convertToOgg, splitAndConvertToOgg, getDuration };
