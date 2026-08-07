const ytdlpExec = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');

const isAndroid = process.platform === 'android' || (process.env.PREFIX && process.env.PREFIX.includes('com.termux'));

let ytdlpBinary = undefined;
if (isAndroid) {
  ytdlpBinary = '/data/data/com.termux/files/usr/bin/yt-dlp';
  if (!fs.existsSync(ytdlpBinary)) {
    try {
      const { execSync } = require('child_process');
      const resolved = execSync('which yt-dlp', { encoding: 'utf-8' }).trim();
      if (resolved && fs.existsSync(resolved)) {
        ytdlpBinary = resolved;
      } else {
        ytdlpBinary = 'yt-dlp';
      }
    } catch (e) {
      ytdlpBinary = 'yt-dlp';
    }
  }
}

const ytdlp = ytdlpBinary ? ytdlpExec.create(ytdlpBinary) : ytdlpExec;

const defaultFfmpegPath = path.join('C:', 'ffmpeg-master-latest-win64-gpl-shared', 'bin', 'ffmpeg.exe');

function resolveFfmpegLocation(candidate) {
  if (!candidate) return null;
  const resolved = path.resolve(candidate);
  if (!fs.existsSync(resolved)) return null;

  const stats = fs.statSync(resolved);
  if (stats.isFile()) {
    return resolved;
  }
  if (stats.isDirectory()) {
    const candidates = [
      path.join(resolved, 'ffmpeg.exe'),
      path.join(resolved, 'bin', 'ffmpeg.exe'),
      path.join(resolved, 'ffmpeg')
    ];
    for (const candidatePath of candidates) {
      if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        return candidatePath;
      }
    }
  }
  return null;
}

function getFfmpegLocation() {
  const envPath = resolveFfmpegLocation(process.env.FFMPEG_PATH);
  if (envPath) return envPath;

  const defaultPath = resolveFfmpegLocation(defaultFfmpegPath);
  if (defaultPath) return defaultPath;

  try {
    const { spawnSync } = require('child_process');
    const result = spawnSync('ffmpeg', ['-version'], { encoding: 'utf-8' });
    if (!result.error && result.status === 0) {
      return 'ffmpeg';
    }
  } catch (err) {
    // ignore
  }

  return null;
}

function isFfmpegAvailable(location) {
  if (!location) return false;
  if (location.toLowerCase() === 'ffmpeg') {
    try {
      const { spawnSync } = require('child_process');
      const result = spawnSync('ffmpeg', ['-version'], { encoding: 'utf-8' });
      return !result.error && result.status === 0;
    } catch (err) {
      return false;
    }
  }
  return fs.existsSync(location) && fs.statSync(location).isFile();
}

async function downloadAudio(url, output) {
  const ffmpegLocation = getFfmpegLocation();
  if (!isFfmpegAvailable(ffmpegLocation)) {
    throw new Error(`FFmpeg not found. Configure FFMPEG_PATH to the ffmpeg executable or install ffmpeg in your PATH.`);
  }

  const ytdlpOptions = {
    extractAudio: true,
    audioFormat: 'mp3',
    output,
    jsRuntimes: 'node',
    noPlaylist: true
  };
  if (ffmpegLocation && ffmpegLocation !== 'ffmpeg') {
    ytdlpOptions.ffmpegLocation = ffmpegLocation;
  }

  await ytdlp(url, ytdlpOptions);

  return output;
}

async function getYoutubeMetadata(url) {
  const ffmpegLocation = getFfmpegLocation();
  const ytdlpOptions = {
    dumpSingleJson: true,
    skipDownload: true,
    noWarnings: true,
    quiet: true,
    noCallHome: true,
    preferFreeFormats: true,
    jsRuntimes: 'node',
    noPlaylist: true
  };
  if (ffmpegLocation && ffmpegLocation !== 'ffmpeg') {
    ytdlpOptions.ffmpegLocation = ffmpegLocation;
  }
  const raw = await ytdlp(url, ytdlpOptions);

  let metadata = raw;
  if (typeof raw === 'string') {
    metadata = JSON.parse(raw);
  }

  return {
    title: metadata.title || '',
    thumbnail: metadata.thumbnail || '',
    webpage_url: metadata.webpage_url || url,
    uploader: metadata.uploader || metadata.uploader_id || '',
    duration: metadata.duration || null,
    description: metadata.description || ''
  };
}

module.exports = { downloadAudio, getYoutubeMetadata };
