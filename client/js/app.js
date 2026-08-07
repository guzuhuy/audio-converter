const presets = {
  slow: { labelKey: 'presetSlow', label: 'Slow 2.1x', speed: 2.1, amplify: -4, maxDuration: 400 },
  default: { labelKey: 'presetDefault', label: 'Default 2.3x', speed: 2.3, amplify: -4, maxDuration: 400 },
  fast: { labelKey: 'presetFast', label: 'Fast 2.5x', speed: 2.5, amplify: -6, maxDuration: 400 },
  faster: { labelKey: 'presetFaster', label: 'Faster 2.7x', speed: 2.7, amplify: -8, maxDuration: 400 },
  ultra: { labelKey: 'presetUltra', label: 'Ultra 2.9x', speed: 2.9, amplify: -10, maxDuration: 400 }
};

const translations = {
  id: {
    urlLabel: 'URL YouTube atau SoundCloud',
    urlPlaceholder: 'Tempel URL YouTube atau SoundCloud...',
    divider: 'ATAU',
    uploadLabel: 'Unggah File MP3',
    dropHint: 'Tarik & lepas file MP3 Anda di sini',
    browseButton: 'Telusuri',
    maxHint: 'Maks 15MB',
    noFile: 'Belum ada file',
    title: 'Konverter Audio — V STUDIO',
    advancedTitle: 'Pengaturan Lanjutan',
    speedLabel: 'Kecepatan',
    amplifyLabel: 'Amplify (dB)',
    maxLabel: 'Max',
    compensateLabel: 'Kompensasi kecepatan pemutar',
    playerSpeedLabel: 'Kecepatan Pemutar',
    playerSpeedHint: 'mis. {value}',
    restoreLabel: 'Pulihkan suara asli untuk preset speed',
    restoreNote: 'Wajib aktif: otomatis menyesuaikan player speed sesuai preset agar suara tetap natural.',
    convertButton: 'Konversi Audio',
    historyTitle: 'RIWAYAT KONVERSI',
    historySubtitle: 'Lacak semua konversi audio Anda',
    subtitle: 'Sistem converter sama persis seperti index lama. Hanya tampilan, warna, teks, dan efek yang diperbarui.',
    backButton: 'Kembali',
    footerText: '© 2025 V STUDIO Pak_Huang. Semua hak dilindungi.',
    noHistory: 'Belum ada konversi',
    uploadError: 'Silakan unggah file MP3.',
    provideUrlOrFile: 'Silakan masukkan URL atau unggah file MP3.',
    processing: 'Memproses...',
    checkingPreview: 'Memeriksa URL dan memuat pratinjau...',
    conversionComplete: 'Konversi selesai! Tautan unduhan tersedia di Riwayat Konversi.',
    downloadLinksHistory: 'Tautan unduhan sekarang ada di Riwayat Konversi.',
    previewTitleDefault: 'Audio YouTube',
    statusCompleted: 'Selesai',
    statusUpload: 'Mengunggah file...',
    conversionFailed: 'Konversi gagal.',
    downloadPart: 'Unduh bagian',
    downloadOgg: 'Unduh OGG',
    deleteButton: 'Hapus',
    recommendedSpeedPrefix: 'Atur kecepatan pemutar ke',
    historyDetailRestore: 'Pulihkan suara asli',
    historyDetailPlayerSpeed: 'Setel kecepatan pemutar ke',
    presetSlow: 'Lambat 2.1x',
    presetDefault: 'Standar 2.3x',
    presetFast: 'Cepat 2.5x',
    presetFaster: 'Lebih Cepat 2.7x',
    presetUltra: 'Ultra 2.9x',
    restoreSummary: 'Pulihkan suara asli: {value}',
    compensateSummary: 'Kompensasi: {value}',
    discordLoginButton: 'Masuk dengan Discord',
    logoutButton: 'Keluar',
    profileTooltip: 'Masuk dengan Discord',
    previewLoading: 'Memuat pratinjau...',
    autoDeleteInfo: 'Akan dihapus dalam {minutes} menit',
    autoDeleteWarning: '⚠️ Akan dihapus segera!'
  },
  en: {
    urlLabel: 'YouTube or SoundCloud URL',
    urlPlaceholder: 'Paste YouTube or SoundCloud URL...',
    divider: 'OR',
    uploadLabel: 'Upload MP3 File',
    dropHint: 'Drag & drop your MP3 file here',
    browseButton: 'Browse',
    maxHint: 'Max 15MB',
    noFile: 'No file selected',
    title: 'Audio Converter — V STUDIO',
    advancedTitle: 'Advanced Settings',
    speedLabel: 'Speed',
    amplifyLabel: 'Amplify (dB)',
    maxLabel: 'Max',
    compensateLabel: 'Compensate for player speed',
    playerSpeedLabel: 'Player Speed',
    playerSpeedHint: 'e.g. {value}',
    restoreLabel: 'Restore original sound for preset speed',
    restoreNote: 'Must be on: automatically adjusts player speed for natural audio.',
    convertButton: 'Convert Audio',
    historyTitle: 'CONVERSION HISTORY',
    historySubtitle: 'Track all your audio conversions',
    subtitle: 'The converter system remains identical to the old page. Only interface colors, text, and effects have been updated.',
    backButton: 'Back',
    footerText: '© 2025 V STUDIO Pak_Huang. All rights reserved.',
    noHistory: 'No conversions yet',
    uploadError: 'Please upload an MP3 file.',
    provideUrlOrFile: 'Please provide a URL or upload an MP3 file.',
    processing: 'Processing...',
    checkingPreview: 'Checking URL and loading preview...',
    conversionComplete: 'Conversion complete! Download links are available in Conversion History.',
    downloadLinksHistory: 'Download links are now in Conversion History.',
    previewTitleDefault: 'YouTube Audio',
    statusCompleted: 'Completed',
    statusUpload: 'Uploading file...',
    conversionFailed: 'Conversion failed.',
    downloadPart: 'Download part',
    downloadOgg: 'Download OGG',
    deleteButton: 'Delete',
    recommendedSpeedPrefix: 'Set your player speed to',
    historyDetailRestore: 'Restore original sound',
    historyDetailPlayerSpeed: 'Set player speed to',
    presetSlow: 'Slow 2.1x',
    presetDefault: 'Default 2.3x',
    presetFast: 'Fast 2.5x',
    presetFaster: 'Faster 2.7x',
    presetUltra: 'Ultra 2.9x',
    restoreSummary: 'Restore original sound: {value}',
    compensateSummary: 'Compensate: {value}',
    discordLoginButton: 'Login with Discord',
    logoutButton: 'Logout',
    profileTooltip: 'Logged in with Discord',
    previewLoading: 'Loading preview...',
    autoDeleteInfo: 'Will be deleted in {minutes} minutes',
    autoDeleteWarning: '⚠️ Will be deleted soon!'
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

function t(key, vars = {}) {
  const value = translations[currentLang]?.[key] || translations.en[key] || '';
  return Object.keys(vars).reduce((text, varName) => {
    return text.replace(new RegExp(`\\{${varName}\\}`, 'g'), vars[varName]);
  }, value);
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  localStorage.setItem('lang', lang);
  currentLang = lang;
  document.documentElement.lang = lang;
  document.getElementById('lang-id').classList.toggle('active', lang === 'id');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  translatePage();
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.placeholder = t(key);
  });
  setStatus('');
  setResult('');
  updateSummary();
  renderPresets();
  renderHistory();
  if (youtubePreviewMeta) {
    renderYoutubePreview(youtubePreviewMeta);
  }
}

const urlInput = document.getElementById('url');
const fileInput = document.getElementById('file');
const browseButton = document.getElementById('browse-button');
const dropZone = document.getElementById('drop-zone');
const fileName = document.getElementById('file-name');
const presetsContainer = document.getElementById('presets');
const speedInput = document.getElementById('speed');
const amplifyInput = document.getElementById('amplify');
const maxDurationInput = document.getElementById('maxDuration');
const compensateCheckbox = document.getElementById('compensate');
const playerSpeedInput = document.getElementById('playerSpeed');
const playerSpeedHint = document.getElementById('player-speed-hint');
const restoreOriginalCheckbox = document.getElementById('restoreOriginal');
const speedValue = document.getElementById('speed-value');
const amplifyValue = document.getElementById('amplify-value');
const durationValue = document.getElementById('duration-value');
const advancedSummary = document.getElementById('advanced-summary');
const convertButton = document.getElementById('convert-button');
const status = document.getElementById('status');
const result = document.getElementById('result');
const form = document.getElementById('convert-form');
const previewCard = document.getElementById('youtube-preview');
const historyContainer = document.getElementById('history-container');

const BACKEND_URL = '';

const socket = io(BACKEND_URL || window.location.origin);
const profilePanel = document.getElementById('profile-panel');
const profileAvatar = document.getElementById('profile-avatar');
const profileUsername = document.getElementById('profile-username');
const profileTag = document.getElementById('profile-tag');
const profilePlan = document.getElementById('profile-plan');
const profilePlanDetail = document.getElementById('profile-plan-detail');
const logoutButton = document.getElementById('logout-button');
const discordLoginButton = document.getElementById('discord-login-btn');

let currentSocketId = null;
let currentAuthUser = null;
let youtubePreviewMeta = null;

let selectedPreset = 'fast';
let selectedFile = null;
let conversationHistory = [];
let isConverting = false; // Flag untuk prevent spam klik saat convert berlangsung

socket.on('connect', () => {
  currentSocketId = socket.id;
});

socket.on('progress', (payload) => {
  if (payload && payload.message) {
    handleSocketProgress(payload);
  }
});

async function fetchAuthUser() {
  try {
    const response = await fetch(BACKEND_URL + '/auth/user', { credentials: 'include' });
    const data = await response.json();
    return data.success && data.user ? data.user : null;
  } catch (err) {
    console.error('Error fetching auth user:', err);
    return null;
  }
}

function handleDiscordLogin() {
  window.location.href = BACKEND_URL + '/auth/discord';
}

async function handleLogout() {
  // 1. Immediately request server to delete all files in the current history
  try {
    const promises = conversationHistory.map(item => {
      return fetch(BACKEND_URL + '/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          downloads: item.downloads || [],
          downloadUrl: item.downloadUrl 
        })
      }).catch(err => console.error('Error deleting file on logout:', err));
    });
    // Wait briefly for the delete requests to be sent
    await Promise.all(promises);
  } catch (err) {
    console.error('Error in logout cleanup:', err);
  }

  // 2. Clear history from localStorage
  localStorage.removeItem('audioConverterHistory');
  conversationHistory = [];

  // 3. Redirect to backend logout URL
  window.location.href = BACKEND_URL + '/auth/logout';
}

function formatPlanLabel(plan) {
  if (plan === 'premium-week') return 'Premium 7 Day';
  if (plan === 'premium-month') return 'Premium 30 Day';
  if (plan === 'premium-custom') return 'Premium Custom';
  return 'Free Plan';
}

function formatExpiryCountdown(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  if (minutes || hours || days) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

let planCountdownInterval = null;

function updatePlanCountdown({ plan, expiresAt, nextConversionSeconds }) {
  if (planCountdownInterval) {
    clearInterval(planCountdownInterval);
    planCountdownInterval = null;
  }

  let countdownSeconds = nextConversionSeconds || 0;

  const update = () => {
    if (plan === 'free') {
      const remainingSeconds = Math.max(0, countdownSeconds);
      const formatted = formatCountdown(remainingSeconds);
      if (profilePlanDetail) profilePlanDetail.textContent = remainingSeconds > 0 ? `Coba lagi dalam ${formatted}` : 'Free plan siap';
      if (document.getElementById('dashboard-status')) document.getElementById('dashboard-status').textContent = remainingSeconds > 0 ? `Coba lagi dalam ${formatted}` : 'Free plan siap';
      if (document.getElementById('dashboard-expiry-value')) document.getElementById('dashboard-expiry-value').textContent = remainingSeconds > 0 ? formatted : 'Free plan siap';
      if (document.getElementById('dashboard-expiry-sub')) document.getElementById('dashboard-expiry-sub').textContent = remainingSeconds > 0 ? `Next: ${formatted}` : 'Free plan siap';
      countdownSeconds = Math.max(0, countdownSeconds - 1);
      return;
    }

    if (!expiresAt) {
      if (profilePlanDetail) profilePlanDetail.textContent = '';
      return;
    }

    const now = Date.now();
    const remainingMs = expiresAt - now;
    if (remainingMs <= 0) {
      if (profilePlanDetail) profilePlanDetail.textContent = 'Plan premium telah kedaluwarsa';
      if (document.getElementById('dashboard-plan-sub')) document.getElementById('dashboard-plan-sub').textContent = 'Plan premium telah kedaluwarsa';
      if (document.getElementById('dashboard-status')) document.getElementById('dashboard-status').textContent = 'Free plan aktif';
      if (document.getElementById('dashboard-expiry-value')) document.getElementById('dashboard-expiry-value').textContent = 'Free plan aktif';
      if (document.getElementById('dashboard-expiry-sub')) document.getElementById('dashboard-expiry-sub').textContent = 'Premium expired';
      clearInterval(planCountdownInterval);
      planCountdownInterval = null;
      if (currentAuthUser) {
        loadDashboardData(currentAuthUser);
      }
      return;
    }
    const remainingSeconds = Math.floor(remainingMs / 1000);
    const formatted = formatExpiryCountdown(remainingSeconds);
    const expiryLabel = `Sampai ${new Date(expiresAt).toLocaleString()}`;
    if (profilePlanDetail) profilePlanDetail.textContent = `Berakhir dalam ${formatted} · ${expiryLabel}`;
    if (document.getElementById('dashboard-plan-sub')) document.getElementById('dashboard-plan-sub').textContent = expiryLabel;
    if (document.getElementById('dashboard-status')) document.getElementById('dashboard-status').textContent = `Sisa waktu: ${formatted}`;
    if (document.getElementById('dashboard-expiry-value')) document.getElementById('dashboard-expiry-value').textContent = formatted;
    if (document.getElementById('dashboard-expiry-sub')) document.getElementById('dashboard-expiry-sub').textContent = expiryLabel;
  };

  update();
  planCountdownInterval = setInterval(update, 1000);
}

function updateProfileAndDashboardPlanUI({ plan, planStartedAt, expiresAt, canConvertNow, nextConversionSeconds }) {
  const planLabel = formatPlanLabel(plan);
  const planBadge = document.getElementById('dashboard-plan-badge');
  const dashPlan = document.getElementById('dashboard-plan');
  const dashPlanSub = document.getElementById('dashboard-plan-sub');
  const dashStatus = document.getElementById('dashboard-status');

  if (planBadge) {
    planBadge.textContent = planLabel;
    planBadge.className = `plan-badge ${plan === 'free' ? 'free' : 'premium'}`;
  }
  if (dashPlan) dashPlan.textContent = planLabel;
  if (profilePlan) profilePlan.textContent = planLabel;

  const dashExpiryValue = document.getElementById('dashboard-expiry-value');
  const dashExpirySub = document.getElementById('dashboard-expiry-sub');

  if (plan === 'free') {
    if (dashPlanSub) dashPlanSub.textContent = '1 konversi setiap 24 jam';
    const message = canConvertNow ? 'Free plan siap' : `Coba lagi dalam ${formatCountdown(nextConversionSeconds || 0)}`;
    if (dashStatus) dashStatus.textContent = message;
    if (profilePlanDetail) profilePlanDetail.textContent = message;
    if (dashExpiryValue) dashExpiryValue.textContent = canConvertNow ? 'Free plan siap' : formatCountdown(nextConversionSeconds || 0);
    if (dashExpirySub) dashExpirySub.textContent = canConvertNow ? 'Free plan siap' : `Next: ${formatCountdown(nextConversionSeconds || 0)}`;
    updatePlanCountdown({ plan, expiresAt: null, nextConversionSeconds: nextConversionSeconds || 0 });
  } else {
    const expiresAtNumber = expiresAt ? Number(expiresAt) : null;
    const startAtNumber = planStartedAt ? Number(planStartedAt) : null;
    const expiryLabel = expiresAtNumber ? `Berlaku sampai ${new Date(expiresAtNumber).toLocaleString()}` : 'Unlimited conversions';
    const startLabel = startAtNumber ? `Mulai ${new Date(startAtNumber).toLocaleString()}` : null;
    const remainingSeconds = expiresAtNumber ? Math.max(0, Math.floor((expiresAtNumber - Date.now()) / 1000)) : 0;
    const formatted = expiresAtNumber ? formatExpiryCountdown(remainingSeconds) : 'Premium aktif';
    if (dashPlanSub) dashPlanSub.textContent = expiryLabel;
    if (dashStatus) dashStatus.textContent = expiresAtNumber ? `Sisa waktu: ${formatted}` : 'Premium aktif';
    if (profilePlanDetail) profilePlanDetail.textContent = expiresAtNumber ? `${startLabel ? startLabel + ' · ' : ''}Sampai ${new Date(expiresAtNumber).toLocaleString()}` : 'Premium aktif';
    if (dashExpiryValue) dashExpiryValue.textContent = formatted;
    if (dashExpirySub) dashExpirySub.textContent = startLabel ? `${startLabel} · ${expiryLabel}` : expiryLabel;
    updatePlanCountdown({ plan, expiresAt: expiresAtNumber, nextConversionSeconds: 0 });
  }
}

async function initAuthProfile() {
  const user = await fetchAuthUser();
  currentAuthUser = user;
  
  const mainContainer = document.getElementById('main-container');

  if (user) {
    if (mainContainer) mainContainer.style.display = 'block';
    
    if (profilePanel) {
      profilePanel.style.display = 'flex';
      if (profileAvatar) {
        profileAvatar.src = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=80` : 'https://via.placeholder.com/80';
      }
      if (profileUsername) profileUsername.textContent = user.username || 'Discord User';
      if (profileTag) {
        profileTag.textContent = user.loginOrder ? `#${user.loginOrder}` : `#${user.discriminator || '0000'}`;
      }
      if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    }

    if (discordLoginButton) {
      discordLoginButton.textContent = `${user.username}#${user.discriminator}`;
      discordLoginButton.onclick = () => window.location.href = '/converter';
    }

    // Load dashboard data when authenticated
    loadDashboardData(user);
  } else {
    // Redirect unauthenticated user back to landing page if trying to access the converter page
    const isConverterPage = window.location.pathname.includes('converter');
    if (isConverterPage) {
      window.location.href = 'index.html';
      return;
    }

    if (profilePanel) profilePanel.style.display = 'none';
    if (discordLoginButton) {
      discordLoginButton.textContent = t('discordLoginButton');
      discordLoginButton.onclick = handleDiscordLogin;
    }
  }
}

// Load history from localStorage
function loadHistory() {
  try {
    const saved = localStorage.getItem('audioConverterHistory');
    const loaded = saved ? JSON.parse(saved) : [];
    
    const now = Date.now();
    const activeHistory = [];
    const expiredItems = [];

    loaded.forEach(item => {
      // Compatibility fallback: if expiresAt doesn't exist, set it to 10 mins from now
      if (!item.expiresAt) {
        item.expiresAt = Date.now() + 10 * 60 * 1000;
      }

      if (item.expiresAt <= now) {
        expiredItems.push(item);
      } else {
        activeHistory.push(item);
        setAutoDeleteTimer(item.id, item.expiresAt);
      }
    });

    conversationHistory = activeHistory;
    localStorage.setItem('audioConverterHistory', JSON.stringify(conversationHistory));
    renderHistory();

    // Clean up expired files from the server in the background
    expiredItems.forEach(item => {
      fetch(BACKEND_URL + '/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          downloads: item.downloads || [],
          downloadUrl: item.downloadUrl 
        })
      }).catch(err => console.error('Error cleaning up expired file from server:', err));
    });

  } catch (err) {
    console.error('Error loading history:', err);
    conversationHistory = [];
  }
}

// Save history to localStorage
function saveHistory() {
  try {
    localStorage.setItem('audioConverterHistory', JSON.stringify(conversationHistory));
    renderHistory();
  } catch (err) {
    console.error('Error saving history:', err);
  }
}

// Add conversion to history
function addToHistory(data) {
  const item = {
    id: Date.now() + Math.random(),
    type: data.isFile ? 'file' : 'youtube',
    title: data.title,
    url: data.url || null,
    thumbnail: data.thumbnail || null,
    speed: data.speed,
    amplify: data.amplify,
    maxDuration: data.maxDuration,
    downloadUrl: data.downloadUrl,
    downloads: data.downloads || [],
    recommendedPlayerSpeed: data.recommendedPlayerSpeed || null,
    resultType: data.resultType,
    status: 'completed',
    timestamp: new Date().toLocaleString(),
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  };
  
  conversationHistory.unshift(item);
  saveHistory();
  
  // Set auto-delete timer
  setAutoDeleteTimer(item.id, item.expiresAt);
}

// Set auto-delete timer for each item
function setAutoDeleteTimer(itemId, expiresAt) {
  const timeRemaining = expiresAt - Date.now();
  if (timeRemaining > 0) {
    setTimeout(() => {
      deleteHistory(itemId, true);
    }, timeRemaining);
  }
}

// Delete history item
async function deleteHistory(itemId, isAutoDelete = false) {
  const item = conversationHistory.find(h => h.id === itemId);
  if (!item) return;

  try {
    // Call server to delete all files (pass all download URLs)
    await fetch(BACKEND_URL + '/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        downloads: item.downloads || [],
        downloadUrl: item.downloadUrl 
      })
    });
  } catch (err) {
    console.error('Error deleting files from server:', err);
  }

  // Remove from history
  conversationHistory = conversationHistory.filter(h => h.id !== itemId);
  saveHistory();
}

// Render history
function renderHistory() {
  historyContainer.innerHTML = '';
  
  if (conversationHistory.length === 0) {
    historyContainer.innerHTML = `<p style="color: var(--muted); text-align: center; padding: 2rem;">${t('noHistory')}</p>`;
    return;
  }

  conversationHistory.forEach((item) => {
    const timeRemaining = Math.max(0, item.expiresAt - Date.now());
    const minutesLeft = Math.ceil(timeRemaining / 60000);
    
    const historyEl = document.createElement('div');
    historyEl.className = 'history-item';
    
    // Build download buttons HTML
    let downloadButtonsHTML = '';
    if (item.downloads && item.downloads.length > 0) {
      item.downloads.forEach((download) => {
        const durationLabel = download.formattedDuration ? ` (${download.formattedDuration})` : '';
        const label = download.totalParts > 1 ? `${t('downloadPart')} ${download.partNumber}${durationLabel}` : `${t('downloadOgg')}${durationLabel}`;
        downloadButtonsHTML += `<a href="${download.url}" target="_blank" rel="noreferrer" class="history-download-btn" download="${download.fileName}">⬇ ${label}</a>`;
      });
    } else if (item.downloadUrl) {
      // Fallback for old format
      downloadButtonsHTML = `<a href="${item.downloadUrl}" target="_blank" rel="noreferrer" class="history-download-btn" download>⬇ ${t('downloadOgg')}</a>`;
    }
    
    // Info auto-delete
    let autoDeleteInfo = '';
    if (minutesLeft > 0) {
      if (minutesLeft <= 2) {
        autoDeleteInfo = `<div class="history-detail" style="color: var(--red);">⏱️ ${t('autoDeleteWarning')}</div>`;
      } else {
        autoDeleteInfo = `<div class="history-detail" style="color: var(--muted2);">⏱️ ${t('autoDeleteInfo', { minutes: minutesLeft })}</div>`;
      }
    }
    
    historyEl.innerHTML = `
      <div class="history-thumbnail">
        ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}">` : '<span>🎵</span>'}
      </div>
      <div class="history-content">
        <div class="history-row">
          <div>
            <p class="history-title">${item.title || t('previewTitleDefault')}</p>
            ${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer" class="history-url">${item.url}</a>` : ''}
          </div>
          <span class="history-badge completed">${t('statusCompleted')}</span>
        </div>
        <div class="history-details">
          <div class="history-detail">${t('speedLabel')}: <strong>${item.speed}x</strong></div>
          <div class="history-detail">${t('amplifyLabel')}: <strong>${item.amplify}dB</strong></div>
          <div class="history-detail">${t('maxLabel')}: <strong>${item.maxDuration}s</strong></div>
          ${item.restoreOriginal ? `<div class="history-detail">${t('historyDetailRestore')}</div>` : ''}
          ${item.recommendedPlayerSpeed ? `<div class="history-detail">${t('historyDetailPlayerSpeed')} <strong>${Number(item.recommendedPlayerSpeed).toFixed(2)}x</strong></div>` : ''}
          ${autoDeleteInfo}
        </div>
        <div class="history-actions">
          ${downloadButtonsHTML}
          <button class="history-delete-btn" data-item-id="${item.id}" title="${t('deleteButton')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
            </svg>
            ${t('deleteButton')}
          </button>
        </div>
      </div>
    `;
    
    historyContainer.appendChild(historyEl);
  });

  // Add delete button listeners
  document.querySelectorAll('.history-delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemId = parseFloat(btn.dataset.itemId);
      deleteHistory(itemId);
    });
  });
}

function updateSummary() {
  speedValue.textContent = `${speedInput.value}x`;
  amplifyValue.textContent = `${amplifyInput.value} dB`;
  durationValue.textContent = `${maxDurationInput.value}s`;
  let summary = `${t('speedLabel')}: ${speedInput.value}x, ${t('amplifyLabel')}: ${amplifyInput.value} dB, ${t('maxLabel')}: ${maxDurationInput.value}s`;
  if (restoreOriginalCheckbox && restoreOriginalCheckbox.checked) {
    const ps = playerSpeedInput && playerSpeedInput.value ? Number(playerSpeedInput.value).toFixed(2) : '';
    summary += `, ${t('restoreSummary', { value: ps })}`;
  } else if (compensateCheckbox && compensateCheckbox.checked) {
    const ps2 = playerSpeedInput && playerSpeedInput.value ? Number(playerSpeedInput.value).toFixed(2) : '';
    summary += `, ${t('compensateSummary', { value: ps2 })}`;
  }
  advancedSummary.textContent = summary;
  updatePlayerSpeedHint();
}

function updatePlayerSpeedHint() {
  if (!playerSpeedHint || !playerSpeedInput) return;
  const value = playerSpeedInput.value || '0.40';
  playerSpeedHint.textContent = t('playerSpeedHint', { value: Number(value).toFixed(2) });
}

function isYoutubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url);
}

async function fetchYoutubeMetadata(url) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/youtube/metadata?url=${encodeURIComponent(url)}`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to load video preview');
    }
    return data.data;
  } catch (err) {
    console.error('YouTube metadata error:', err);
    return null;
  }
}

function renderYoutubePreview(data) {
  if (!previewCard || !data) return;
  youtubePreviewMeta = data;
  previewCard.style.display = 'block';
  previewCard.innerHTML = `
    <div class="preview-content">
      <div class="preview-thumb">
        ${data.thumbnail ? `<img src="${data.thumbnail}" alt="${data.title}">` : '<div class="preview-placeholder">Preview</div>'}
      </div>
      <div class="preview-info">
        <div class="preview-title">${data.title || t('previewTitleDefault')}</div>
        <div class="preview-meta">${data.uploader ? `${data.uploader}` : ''}</div>
        <div class="preview-link"><a href="${data.webpage_url || data.url}" target="_blank" rel="noreferrer">${data.webpage_url || data.url}</a></div>
        <div class="preview-settings">${t('speedLabel')}: <strong>${speedInput.value}x</strong> · ${t('amplifyLabel')}: <strong>${amplifyInput.value}dB</strong> · ${t('maxLabel')}: <strong>${maxDurationInput.value}s</strong></div>
      </div>
    </div>
  `;
}

function clearYoutubePreview() {
  if (!previewCard) return;
  previewCard.style.display = 'none';
  previewCard.innerHTML = '';
  youtubePreviewMeta = null;
}

let previewTimeout = null;

async function handleUrlPreview() {
  const url = urlInput ? urlInput.value.trim() : '';
  if (!url || !isYoutubeUrl(url)) {
    clearYoutubePreview();
    return;
  }

  if (previewCard) {
    previewCard.style.display = 'block';
    previewCard.innerHTML = `<div class="preview-loading">${t('previewLoading')}</div>`;
  }

  // Helpful debug + user-visible status for troubleshooting
  console.debug('handleUrlPreview triggered, url=', url);
  try { setStatus(t('checkingPreview'), ''); } catch (e) { console.debug('setStatus not available', e); }

  if (previewTimeout) {
    clearTimeout(previewTimeout);
  }

  previewTimeout = setTimeout(async () => {
    const data = await fetchYoutubeMetadata(url);
    if (data) {
      renderYoutubePreview(data);
    } else {
      clearYoutubePreview();
    }
  }, 300);
}

function syncRestoreOriginalPlayerSpeed() {
  if (!restoreOriginalCheckbox || !restoreOriginalCheckbox.checked || !playerSpeedInput || !speedInput) return;
  const speed = Number(speedInput.value) || 1;
  if (speed <= 0) return;
  playerSpeedInput.value = (1 / speed).toFixed(2);
  if (compensateCheckbox) compensateCheckbox.checked = true;
  playerSpeedInput.disabled = true;
}

function handleRestoreOriginalChange() {
  if (!restoreOriginalCheckbox) return;
  if (restoreOriginalCheckbox.checked) {
    syncRestoreOriginalPlayerSpeed();
    if (compensateCheckbox) compensateCheckbox.checked = true;
  } else {
    if (playerSpeedInput) playerSpeedInput.disabled = false;
  }
  updateSummary();
}

function setPreset(key) {
  selectedPreset = key;
  const preset = presets[key];
  if (!preset) return;

  speedInput.value = preset.speed;
  amplifyInput.value = preset.amplify;
  maxDurationInput.value = preset.maxDuration;
  // Automatically enable compensation and set playerSpeed = 1 / preset.speed
  if (compensateCheckbox) compensateCheckbox.checked = true;
  if (playerSpeedInput) playerSpeedInput.value = (1 / preset.speed).toFixed(2);
  if (restoreOriginalCheckbox && restoreOriginalCheckbox.checked) {
    syncRestoreOriginalPlayerSpeed();
  }
  updatePlayerSpeedHint();
  updateSummary();
  renderPresets();
}

function renderPresets() {
  presetsContainer.innerHTML = '';
  Object.entries(presets).forEach(([key, preset]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `preset-button${selectedPreset === key ? ' active' : ''}`;
    const presetLabel = preset.labelKey ? t(preset.labelKey) : preset.label;
    button.textContent = presetLabel;
    button.addEventListener('click', () => setPreset(key));
    presetsContainer.appendChild(button);
  });
}

function setStatus(message, type = '') {
  status.textContent = message;
  status.className = `status ${type}`.trim();
}

function handleSocketProgress(payload) {
  let text = payload.message;
  if (payload.percent !== undefined && payload.percent !== null) {
    text += ` ${payload.percent}%`;
  }
  setStatus(text, payload.type || '');
}

function setResult(message) {
  result.innerHTML = message;
}

function sendRequest(url, body, isUpload = false) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', BACKEND_URL + url, true);
    xhr.withCredentials = true;
    if (currentSocketId) {
      xhr.setRequestHeader('X-Socket-Id', currentSocketId);
    }
    if (!isUpload) {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setStatus(`${t('statusUpload')} ${percent}%`, 'upload');
      }
    };

    xhr.onload = () => {
      const response = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        const errorMessage = (response && response.error) || xhr.statusText || 'Server error';
        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = () => reject(new Error('Network error while sending request.'));
    xhr.send(body);
  });
}

function resetState() {
  setStatus('');
  setResult('');
}

function handleFileSelect(file) {
  selectedFile = file;
  fileName.textContent = file ? file.name : 'No file selected';
  if (file) {
    clearYoutubePreview();
    urlInput.value = '';
  }
}

browseButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => {
  handleFileSelect(event.target.files[0]);
});

if (urlInput) {
  urlInput.addEventListener('paste', () => setTimeout(handleUrlPreview, 50));
  urlInput.addEventListener('input', handleUrlPreview);
  urlInput.addEventListener('blur', handleUrlPreview);
  urlInput.addEventListener('change', handleUrlPreview);
}

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('dragover');
  });
});

dropZone.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  if (file && file.type === 'audio/mpeg') {
    handleFileSelect(file);
  } else {
    setStatus(t('uploadError'), 'error');
  }
});

speedInput.addEventListener('input', () => {
  if (restoreOriginalCheckbox && restoreOriginalCheckbox.checked) {
    syncRestoreOriginalPlayerSpeed();
  }
  updateSummary();
});
amplifyInput.addEventListener('input', updateSummary);
maxDurationInput.addEventListener('input', updateSummary);
if (compensateCheckbox) compensateCheckbox.addEventListener('change', updateSummary);
if (restoreOriginalCheckbox) restoreOriginalCheckbox.addEventListener('change', handleRestoreOriginalChange);
if (playerSpeedInput) playerSpeedInput.addEventListener('input', updateSummary);
// Enforce client-side clamp: maxDuration cannot exceed 400s
if (maxDurationInput) {
  maxDurationInput.addEventListener('input', () => {
    if (Number(maxDurationInput.value) > 400) maxDurationInput.value = 400;
    updateSummary();
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Prevent spam klik saat proses convert berlangsung
  if (isConverting) {
    console.warn('Convert sudah berjalan, abaikan request baru');
    return;
  }

  resetState();

  const url = urlInput.value.trim();
  const speed = parseFloat(speedInput.value);
  const amplify = parseInt(amplifyInput.value);
  let maxDuration = parseInt(maxDurationInput.value, 10) || 400;
  if (maxDuration > 400) maxDuration = 400;

  if (!url && !selectedFile) {
    setStatus(t('provideUrlOrFile'), 'error');
    return;
  }

  // Set flag converting dan disable button
  isConverting = true;
  convertButton.disabled = true;
  convertButton.textContent = t('processing');

  try {
    let response;
    let historyData = {
      speed,
      amplify,
      maxDuration,
      isFile: false
    };

    const restoreOriginal = restoreOriginalCheckbox ? restoreOriginalCheckbox.checked : false;
    let compensate = compensateCheckbox ? compensateCheckbox.checked : false;
    let playerSpeed = playerSpeedInput ? parseFloat(playerSpeedInput.value) : null;

    if (restoreOriginal) {
      compensate = true;
      if (speed && speed > 0) {
        playerSpeed = Number((1 / speed).toFixed(2));
      }
    }

    let resultData;
    let downloadUrl = '';
    let resultType = '';

    if (url) {
      const body = JSON.stringify({ url, speed, amplify, maxDuration, compensate, playerSpeed, restoreOriginal });
      resultData = await sendRequest('/api/youtube', body, false);
      historyData.url = url;
      historyData.title = youtubePreviewMeta?.title || 'YouTube Audio';
      historyData.thumbnail = youtubePreviewMeta?.thumbnail || null;
    } else {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('speed', speed);
      formData.append('amplify', amplify);
      formData.append('maxDuration', maxDuration);
      formData.append('compensate', compensate);
      formData.append('restoreOriginal', restoreOriginal);
      if (compensate) formData.append('playerSpeed', playerSpeed);

      resultData = await sendRequest('/api/upload', formData, true);
      historyData.isFile = true;
      historyData.title = selectedFile.name;
    }

    if (!resultData || !resultData.success) {
      throw new Error(resultData?.error || 'Server error while converting audio.');
    }

    if (resultData.jobId) {
      const targetJobId = resultData.jobId;
      resultData = await new Promise((resolve, reject) => {
        const progressHandler = (payload) => {
          if (payload && payload.jobId === targetJobId) {
            if (payload.type === 'completed') {
              socket.off('progress', progressHandler);
              resolve(payload.result);
            } else if (payload.type === 'error') {
              socket.off('progress', progressHandler);
              reject(new Error(payload.message || 'Conversion failed.'));
            } else {
              handleSocketProgress(payload);
            }
          }
        };
        socket.on('progress', progressHandler);
      });
    }

    if (resultData.downloads && resultData.downloads.length > 0) {
      downloadUrl = resultData.downloads[0].url;
    } else if (resultData.download) {
      downloadUrl = resultData.download;
    }

    historyData.downloadUrl = downloadUrl;
    historyData.resultType = resultData.type;
    historyData.downloads = resultData.downloads;
    historyData.compensate = compensate;
    historyData.restoreOriginal = restoreOriginal;
    historyData.playerSpeed = compensate ? playerSpeed : null;
    historyData.recommendedPlayerSpeed = resultData.recommendedPlayerSpeed || (compensate ? playerSpeed : Number((1 / speed).toFixed(2)));
    addToHistory(historyData);

    setStatus(t('conversionComplete'), 'success');
    let extra = '';
    if (resultData.recommendedPlayerSpeed) {
      extra += `<div style="margin-top:.75rem">${t('recommendedSpeedPrefix')} <strong>${Number(resultData.recommendedPlayerSpeed).toFixed(2)}</strong> ${currentLang === 'id' ? 'untuk audio normal.' : 'for normal audio.'}</div>`;
    }
    extra += `<div style="margin-top:.75rem">${t('downloadLinksHistory')}</div>`;
    setResult(`<div class="result-summary">${extra}</div>`);
    
    // Reload dashboard stats
    const dashConversions = document.getElementById('dashboard-conversions');
    if (dashConversions) {
      const currentCount = parseInt(dashConversions.textContent) || 0;
      dashConversions.textContent = currentCount + 1;
    }
  } catch (error) {
    setStatus(error.message || t('conversionFailed'), 'error');
    setResult('');
  } finally {
    // Reset state: reset form fields
    urlInput.value = '';
    selectedFile = null;
    fileName.textContent = 'No file selected';
    fileInput.value = '';

    // PENTING: Set isConverting = false dan enable button TERAKHIR
    // Tunggu sebentar untuk memastikan render selesai
    setTimeout(() => {
      isConverting = false;
      convertButton.disabled = false;
      convertButton.textContent = t('convertButton');
    }, 300);
  }
});

setPreset(selectedPreset);
renderPresets();
window.audioPresets = presets;

const langIdButton = document.getElementById('lang-id');
const langEnButton = document.getElementById('lang-en');
if (langIdButton) langIdButton.addEventListener('click', () => setLanguage('id'));
if (langEnButton) langEnButton.addEventListener('click', () => setLanguage('en'));

// Load history on page load
loadHistory();
setLanguage(currentLang);
initAuthProfile();

// Auto-refresh history setiap 30 detik untuk update countdown
setInterval(() => {
  renderHistory();
}, 30000);

function initPageEffects() {
  const cursorOuter = document.getElementById('cursor-outer');
  const cursorInner = document.getElementById('cursor-inner');
  if (cursorOuter && cursorInner) {
    let mouseX = 0;
    let mouseY = 0;
    let outerX = 0;
    let outerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorInner.style.left = `${mouseX}px`;
      cursorInner.style.top = `${mouseY}px`;
    });

    function animateCursor() {
      outerX += (mouseX - outerX) * 0.12;
      outerY += (mouseY - outerY) * 0.12;
      cursorOuter.style.left = `${outerX}px`;
      cursorOuter.style.top = `${outerY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorOuter.style.width = '52px';
        cursorOuter.style.height = '52px';
        cursorOuter.style.borderColor = 'rgba(201,168,76,0.8)';
        cursorOuter.style.background = 'rgba(201,168,76,0.06)';
      });
      el.addEventListener('mouseleave', () => {
        cursorOuter.style.width = '36px';
        cursorOuter.style.height = '36px';
        cursorOuter.style.borderColor = 'rgba(201,168,76,0.5)';
        cursorOuter.style.background = 'transparent';
      });
    });
  }

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      opacity: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.15 + 0.03,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      gold: Math.random() > 0.7
    });
  }

  const orbs = [
    { x: 0.2, y: 0.3, r: 180, color: 'rgba(124,106,232,', speed: 0.0008, phase: 0 },
    { x: 0.8, y: 0.7, r: 150, color: 'rgba(201,168,76,', speed: 0.0012, phase: 1 },
    { x: 0.5, y: 0.5, r: 200, color: 'rgba(77,217,232,', speed: 0.0006, phase: 2 },
  ];

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  let t = 0;
  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    orbs.forEach((orb) => {
      const cx = canvas.width * orb.x + Math.sin(t * orb.speed + orb.phase) * 80;
      const cy = canvas.height * orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 60;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
      grad.addColorStop(0, `${orb.color}0.04)`);
      grad.addColorStop(1, `${orb.color}0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const mgrad = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
    mgrad.addColorStop(0, 'rgba(201,168,76,0.03)');
    mgrad.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = mgrad;
    ctx.beginPath();
    ctx.arc(mx, my, 200, 0, Math.PI * 2);
    ctx.fill();

    particles.forEach((p) => {
      const tw = Math.sin(t * p.twinkleSpeed + p.twinkleOffset) * 0.4 + 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.gold ? '201,168,76' : '200,195,230'},${p.opacity * tw})`;
      ctx.fill();
      p.y -= p.speed;
      if (p.y < -2) {
        p.y = canvas.height + 2;
        p.x = Math.random() * canvas.width;
      }
    });

    t += 1;
    requestAnimationFrame(drawBackground);
  }

  drawBackground();
}

initPageEffects();

// Modal functions for upgrade plan and discord ticket instructions
function openUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.classList.add('active');
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.classList.remove('active');
}

function selectPlan(planKey) {
  closeUpgradeModal();
  const planNameEl = document.getElementById('selected-plan-name');
  if (planNameEl) {
    if (planKey === 'premium-week') {
      planNameEl.textContent = 'Premium 7 Day (70K)';
    } else if (planKey === 'premium-month') {
      planNameEl.textContent = 'Premium 30 Day (130K)';
    } else {
      planNameEl.textContent = 'Premium';
    }
  }
  openTicketModal();
}

function openTicketModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) modal.classList.add('active');
}

function closeTicketModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) modal.classList.remove('active');
}

// Expose functions globally to window so HTML inline onclick handlers can execute them
window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.selectPlan = selectPlan;
window.openTicketModal = openTicketModal;
window.closeTicketModal = closeTicketModal;

// Close modals when clicking outside
document.addEventListener('click', (e) => {
  const upgradeModal = document.getElementById('upgrade-modal');
  if (upgradeModal && e.target === upgradeModal) {
    closeUpgradeModal();
  }
  const ticketModal = document.getElementById('ticket-modal');
  if (ticketModal && e.target === ticketModal) {
    closeTicketModal();
  }
});

function formatCountdown(seconds) {
  if (!seconds || seconds <= 0) {
    return 'kurang dari 1 menit';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours} jam${minutes ? ' ' + minutes + ' menit' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} menit${secs ? ' ' + secs + ' detik' : ''}`;
  }
  return `${secs} detik`;
}

// Load dashboard data
async function loadDashboardData(user) {
  try {
    const dashSection = document.getElementById('dashboard-section');
    if (!dashSection) return;

    // Show dashboard
    dashSection.style.display = 'grid';

    // Set profile info
    const dashAvatar = document.getElementById('dashboard-avatar');
    const dashUsername = document.getElementById('dashboard-username');
    if (dashAvatar) {
      dashAvatar.src = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=80` : 'https://via.placeholder.com/80';
    }
    if (dashUsername) dashUsername.textContent = user.username || 'Discord User';

    // Fetch conversion stats
    const statsResponse = await fetch(BACKEND_URL + '/api/user-stats', { credentials: 'include' });
    const statsData = await statsResponse.json();
    if (statsData.success) {
      const dashConversions = document.getElementById('dashboard-conversions');
      if (dashConversions) dashConversions.textContent = statsData.data.conversionsThisMonth || 0;

      updateProfileAndDashboardPlanUI({
        plan: statsData.data.plan,
        planStartedAt: statsData.data.planStartedAt,
        expiresAt: statsData.data.planExpiresAt,
        canConvertNow: statsData.data.canConvertNow,
        nextConversionSeconds: statsData.data.nextConversionSeconds
      });

      const upgradeLockMessage = document.getElementById('upgrade-lock-message');
      if (!statsData.data.canConvertNow) {
        const nextSeconds = statsData.data.nextConversionSeconds || 0;
        const nextCountdown = formatCountdown(nextSeconds);
        if (convertButton) {
          convertButton.disabled = true;
          convertButton.textContent = 'Upgrade Plan';
        }
        if (upgradeLockMessage) {
          upgradeLockMessage.style.display = 'block';
          upgradeLockMessage.innerHTML = `Free plan hanya boleh 1 konversi dalam 24 jam. Coba lagi dalam ${nextCountdown}. <strong>Klik di sini untuk upgrade.</strong>`;
          upgradeLockMessage.onclick = openUpgradeModal;
        }
        setStatus(`Free plan hanya boleh 1 konversi dalam 24 jam. Coba lagi dalam ${nextCountdown}.`, 'error');
      } else {
        if (convertButton) {
          convertButton.disabled = false;
          convertButton.textContent = t('convertButton');
        }
        if (upgradeLockMessage) {
          upgradeLockMessage.style.display = 'none';
          upgradeLockMessage.onclick = null;
        }
      }
    }
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
}

