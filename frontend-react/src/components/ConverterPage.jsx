import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/LanguageContext';
import { HistorySection } from './HistorySection';
import { io } from 'socket.io-client';
import { 
  User, BarChart3, Crown, Clock, Sparkles, Upload, 
  Sliders, Play, CheckCircle2, AlertTriangle, 
  HelpCircle, ChevronDown, ChevronUp, RefreshCw 
} from 'lucide-react';

const YoutubeIcon = ({ className, size }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    width={size} 
    height={size}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const BACKEND_URL = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

const presets = {
  slow: { labelKey: 'converter.preset_slow', speed: 2.1, amplify: -4, maxDuration: 400 },
  default: { labelKey: 'converter.preset_default', speed: 2.3, amplify: -4, maxDuration: 400 },
  fast: { labelKey: 'converter.preset_fast', speed: 2.5, amplify: -6, maxDuration: 400 },
  faster: { labelKey: 'converter.preset_faster', speed: 2.7, amplify: -8, maxDuration: 400 },
  ultra: { labelKey: 'converter.preset_ultra', speed: 2.9, amplify: -10, maxDuration: 400 }
};

const getFriendlyErrorMessage = (msg, lang) => {
  if (!msg) return '';
  const isIndo = lang === 'id';
  
  if (msg.includes('TRANSCODE_NODE_DISPATCH_FAILED') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return isIndo 
      ? 'Koneksi ke server gagal. Pastikan internet Anda aktif atau hubungi admin jika server offline.' 
      : 'Failed to connect to server. Please check your internet connection or contact the administrator.';
  }
  if (msg.includes('TRANSCODE_NODE_INIT_ERROR') || msg.includes('PROCESS_TRANSCODE_ERROR')) {
    return isIndo 
      ? 'Gagal memulai konversi. Silakan coba beberapa saat lagi.' 
      : 'Failed to initialize conversion. Please try again in a few moments.';
  }
  if (msg.includes('QUEUE_NODE_JOB_FAILED')) {
    return isIndo
      ? 'Antrean konversi gagal. Silakan coba kembali.'
      : 'Queue job processing failed. Please try again.';
  }
  if (msg.includes('ytdlp') || msg.includes('yt-dlp') || msg.includes('youtube') || msg.includes('metadata') || msg.includes('ExtractError') || msg.includes('Unsupported URL')) {
    return isIndo
      ? 'Gagal mengambil video YouTube. Pastikan link benar, video tidak privat, dan tidak dibatasi umur.'
      : 'Failed to extract YouTube video info. Ensure the link is valid, public, and not age-restricted.';
  }
  return msg;
};


export const ConverterPage = ({ currentUser, onNavigate, onUpgradeClick }) => {
  const { t, lang } = useI18n();

  // Socket
  const socketRef = useRef(null);
  const [socketId, setSocketId] = useState(null);

  // Form states
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Customization states
  const [selectedPreset, setSelectedPreset] = useState('fast');
  const [speed, setSpeed] = useState(2.5);
  const [amplify, setAmplify] = useState(-6);
  const [maxDuration, setMaxDuration] = useState(400);
  const [compensate, setCompensate] = useState(true);
  const [playerSpeed, setPlayerSpeed] = useState(0.40);
  const [restoreOriginal, setRestoreOriginal] = useState(true);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState(''); // 'error', 'success', 'upload', etc
  const [resultMsg, setResultMsg] = useState('');
  const [youtubePreview, setYoutubePreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);



  // Dashboard Stats
  const [conversionsUsed, setConversionsUsed] = useState(0);
  const [userPlan, setUserPlan] = useState('free');
  const [planExpiresAt, setPlanExpiresAt] = useState(null);
  const [canConvertNow, setCanConvertNow] = useState(true);
  const [nextConversionSeconds, setNextConversionSeconds] = useState(0);
  const [planCountdownText, setPlanCountdownText] = useState('');

  // History state
  const [historyList, setHistoryList] = useState([]);

  // File input ref
  const fileInputRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  // Roblox states
  const [robloxApiKey, setRobloxApiKey] = useState('');
  const [robloxTargetId, setRobloxTargetId] = useState('');
  const [robloxTargetType, setRobloxTargetType] = useState('user');
  const [isRobloxConnected, setIsRobloxConnected] = useState(false);
  const [savedRobloxTargetId, setSavedRobloxTargetId] = useState('');
  const [savedRobloxTargetType, setSavedRobloxTargetType] = useState('user');
  const [uploadToRoblox, setUploadToRoblox] = useState(false);
  const [isSavingRoblox, setIsSavingRoblox] = useState(false);
  const [robloxConfigError, setRobloxConfigError] = useState('');
  const [showRobloxTutorial, setShowRobloxTutorial] = useState(false);
  const [isEditingRoblox, setIsEditingRoblox] = useState(false);

  // Init Socket connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
      setSocketId(socketRef.current.id);
    });

    socketRef.current.on('progress', (payload) => {
      if (payload && payload.type === 'roblox-status') {
        const { jobId, status, assetId, message } = payload;
        setHistoryList((prev) => {
          const updated = prev.map((item) => {
            if (String(item.id) === String(jobId)) {
              return {
                ...item,
                robloxStatus: status,
                robloxAssetId: assetId || item.robloxAssetId || null,
                robloxError: (status === 'error' || status === 'blocked') ? message : null
              };
            }
            return item;
          });
          localStorage.setItem('audioConverterHistory', JSON.stringify(updated));
          return updated;
        });
        return;
      }

      if (payload && payload.message) {
        let text = payload.message;
        if (payload.percent !== undefined && payload.percent !== null) {
          text += ` ${payload.percent}%`;
        }
        setStatusMsg(text);
        setStatusType(payload.type || '');
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [lang]);

  const handleSaveRobloxConfig = async (e) => {
    e.preventDefault();
    if (!robloxTargetId) {
      setRobloxConfigError(lang === 'id' ? 'Target ID wajib diisi.' : 'Target ID is required.');
      return;
    }
    setIsSavingRoblox(true);
    setRobloxConfigError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/roblox-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: robloxApiKey,
          targetId: robloxTargetId,
          targetType: robloxTargetType
        }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setIsRobloxConnected(true);
        setSavedRobloxTargetId(robloxTargetId);
        setSavedRobloxTargetType(robloxTargetType);
        setRobloxApiKey('••••••••');
        setIsEditingRoblox(false);
      } else {
        setRobloxConfigError(data.error || 'Gagal menyimpan konfigurasi.');
      }
    } catch (err) {
      console.error(err);
      setRobloxConfigError(lang === 'id' ? 'Kesalahan jaringan.' : 'Network error.');
    } finally {
      setIsSavingRoblox(false);
    }
  };

  const handleDisconnectRoblox = async () => {
    if (!window.confirm(lang === 'id' ? 'Apakah Anda yakin ingin memutuskan koneksi akun Roblox?' : 'Are you sure you want to disconnect your Roblox account?')) {
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/roblox-disconnect`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setIsRobloxConnected(false);
        setSavedRobloxTargetId('');
        setSavedRobloxTargetType('user');
        setRobloxApiKey('');
        setRobloxTargetId('');
        setRobloxTargetType('user');
        setIsEditingRoblox(false);
        setUploadToRoblox(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user-stats`, { credentials: 'include' });
      const statsData = await response.json();
      if (statsData.success) {
        setConversionsUsed(statsData.data.conversionsThisMonth || 0);
        setUserPlan(statsData.data.plan);
        setPlanExpiresAt(statsData.data.planExpiresAt);
        setCanConvertNow(statsData.data.canConvertNow);
        setNextConversionSeconds(statsData.data.nextConversionSeconds || 0);

        // Populate Roblox configuration state
        const hasRoblox = !!statsData.data.hasRobloxConnected;
        setIsRobloxConnected(hasRoblox);
        setSavedRobloxTargetId(statsData.data.robloxTargetId || '');
        setSavedRobloxTargetType(statsData.data.robloxTargetType || 'user');

        if (hasRoblox) {
          setRobloxApiKey('••••••••');
          setRobloxTargetId(statsData.data.robloxTargetId || '');
          setRobloxTargetType(statsData.data.robloxTargetType || 'user');
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    loadLocalHistory();
  }, []);

  // Set up Plan Expiry / Cooldown Countdown Timer
  useEffect(() => {
    const formatExpiryCountdown = (secs) => {
      const days = Math.floor(secs / 86400);
      const hours = Math.floor((secs % 86400) / 3600);
      const minutes = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      const parts = [];
      if (days) parts.push(`${days}d`);
      if (hours || days) parts.push(`${hours}h`);
      if (minutes || hours || days) parts.push(`${minutes}m`);
      parts.push(`${s}s`);
      return parts.join(' ');
    };

    const formatCountdown = (secs) => {
      if (secs <= 0) return 'READY';
      const hours = Math.floor(secs / 3600);
      const minutes = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${s}s`;
      return `${s}s`;
    };

    const interval = setInterval(() => {
      if (userPlan === 'free') {
        if (nextConversionSeconds > 0) {
          setNextConversionSeconds((prev) => {
            const next = Math.max(0, prev - 1);
            setPlanCountdownText(formatCountdown(next));
            if (next === 0) setCanConvertNow(true);
            return next;
          });
        } else {
          setPlanCountdownText(t('converter.ready'));
        }
      } else {
        if (planExpiresAt) {
          const remainingMs = planExpiresAt - Date.now();
          if (remainingMs <= 0) {
            setPlanCountdownText(lang === 'id' ? 'KADALUARSA' : 'EXPIRED');
            setUserPlan('free');
            fetchDashboardStats();
          } else if (remainingMs > 365 * 24 * 60 * 60 * 1000) {
            // Local bypass mode (100 years duration)
            setPlanCountdownText(lang === 'id' ? 'Selamanya' : 'Forever');
          } else {
            setPlanCountdownText(formatExpiryCountdown(Math.floor(remainingMs / 1000)));
          }
        } else {
          setPlanCountdownText(t('converter.unlimited'));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userPlan, planExpiresAt, nextConversionSeconds]);

  // Load history from localStorage
  const loadLocalHistory = () => {
    try {
      const saved = localStorage.getItem('audioConverterHistory');
      const loaded = saved ? JSON.parse(saved) : [];
      const now = Date.now();
      const activeHistory = [];
      const expiredItems = [];

      const isLocalUser = currentUser && currentUser.id === 'local-user-id';
      loaded.forEach(item => {
        if (isLocalUser) {
          item.expiresAt = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000; // never expire
        } else if (!item.expiresAt) {
          item.expiresAt = Date.now() + 10 * 60 * 1000;
        }

        if (item.expiresAt <= now) {
          expiredItems.push(item);
        } else {
          activeHistory.push(item);
          // Set delete timer (only for non-local accounts)
          if (!isLocalUser) {
            const timeRemaining = item.expiresAt - Date.now();
            setTimeout(() => {
              handleDeleteHistoryItem(item.id, true);
            }, timeRemaining);
          }
        }
      });

      setHistoryList(activeHistory);
      localStorage.setItem('audioConverterHistory', JSON.stringify(activeHistory));

      // Cleanup expired files on server
      expiredItems.forEach(item => {
        fetch(`${BACKEND_URL}/api/delete`, {
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
    }
  };

  // Add item to history list
  const addToHistory = (data) => {
    const item = {
      id: data.id || (Date.now() + Math.random()),
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
      robloxStatus: data.robloxStatus || null,
      robloxAssetId: data.robloxAssetId || null,
      robloxError: data.robloxError || null,
      timestamp: new Date().toLocaleString(),
      expiresAt: currentUser && currentUser.id === 'local-user-id'
        ? Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
        : Date.now() + 10 * 60 * 1000
    };

    setHistoryList((prev) => {
      const updated = [item, ...prev];
      localStorage.setItem('audioConverterHistory', JSON.stringify(updated));
      return updated;
    });

    // Auto-delete timer
    if (!currentUser || currentUser.id !== 'local-user-id') {
      setTimeout(() => {
        handleDeleteHistoryItem(item.id, true);
      }, 10 * 60 * 1000);
    }
  };

  const handleDeleteHistoryItem = async (itemId, isAutoDelete = false) => {
    setHistoryList((prev) => {
      const item = prev.find(h => h.id === itemId);
      if (item) {
        fetch(`${BACKEND_URL}/api/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            downloads: item.downloads || [],
            downloadUrl: item.downloadUrl 
          })
        }).catch(err => console.error('Error deleting files from server:', err));
      }
      const updated = prev.filter(h => h.id !== itemId);
      localStorage.setItem('audioConverterHistory', JSON.stringify(updated));
      return updated;
    });
  };

  // Preset setter
  const applyPreset = (key) => {
    setSelectedPreset(key);
    const p = presets[key];
    if (!p) return;

    setSpeed(p.speed);
    setAmplify(p.amplify);
    setMaxDuration(p.maxDuration);
    setCompensate(true);
    setPlayerSpeed(Number((1 / p.speed).toFixed(2)));
  };

  useEffect(() => {
    if (restoreOriginal && speed > 0) {
      setPlayerSpeed(Number((1 / speed).toFixed(2)));
    }
  }, [speed, restoreOriginal]);

  const handleRestoreChange = (checked) => {
    setRestoreOriginal(checked);
    if (checked) {
      setCompensate(true);
    }
  };

  // YouTube preview check
  const checkYoutubePreview = async (urlVal) => {
    if (!urlVal) {
      setYoutubePreview(null);
      return;
    }

    if (!/^(https?:\/\/)?([a-zA-Z0-9-]+\.)?(youtube\.com|youtu\.be)\/.+/i.test(urlVal)) {
      setYoutubePreview(null);
      return;
    }

    setIsPreviewLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/youtube/metadata?url=${encodeURIComponent(urlVal)}`, { credentials: 'include' });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setYoutubePreview(resData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleUrlInputChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (val) {
      setSelectedFile(null);
    } else {
      setYoutubePreview(null);
    }

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      checkYoutubePreview(val);
    }, 200);
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'audio/mpeg') {
      setSelectedFile(file);
      setUrl('');
      setYoutubePreview(null);
      setStatusMsg('');
    } else {
      setStatusMsg(t('uploadError'));
      setStatusType('error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUrl('');
      setYoutubePreview(null);
      setStatusMsg('');
    }
  };

  // Form Submit (Convert XMLHttp / Fetch Transcode)
  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (isConverting) return;

    setStatusMsg('');
    setResultMsg('');

    if (!url && !selectedFile) {
      setStatusMsg(t('provideUrlOrFile'));
      setStatusType('error');
      return;
    }

    setIsConverting(true);
    setStatusMsg(t('processing'));
    setStatusType('info');

    try {
      let resultData;
      let finalHistory = {
        speed,
        amplify,
        maxDuration,
        isFile: false
      };

      const finalRestore = restoreOriginal;
      let finalCompensate = compensate || restoreOriginal;
      let finalPlayerSpeed = playerSpeed;

      if (finalRestore && speed > 0) {
        finalPlayerSpeed = Number((1 / speed).toFixed(2));
      }

      const uploadPromise = () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const isFileMode = !!selectedFile;
          const endpoint = isFileMode ? '/api/upload' : '/api/youtube';

          xhr.open('POST', BACKEND_URL + endpoint, true);
          xhr.withCredentials = true;

          if (socketId) {
            xhr.setRequestHeader('X-Socket-Id', socketId);
          }

          if (!isFileMode) {
            xhr.setRequestHeader('Content-Type', 'application/json');
          }
          xhr.responseType = 'json';

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setStatusMsg(`UPLOADING_RAW: ${percent}%`);
              setStatusType('upload');
            }
          };

          xhr.onload = () => {
            const response = xhr.response;
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(response);
            } else {
              const errMsg = (response && response.error) || xhr.statusText || 'Server error';
              reject(new Error(errMsg));
            }
          };

          xhr.onerror = () => reject(new Error('TRANSCODE_NODE_DISPATCH_FAILED'));

          if (isFileMode) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('speed', speed);
            formData.append('amplify', amplify);
            formData.append('maxDuration', maxDuration);
            formData.append('compensate', finalCompensate);
            formData.append('restoreOriginal', finalRestore);
            formData.append('uploadToRoblox', uploadToRoblox);
            if (finalCompensate) {
              formData.append('playerSpeed', finalPlayerSpeed);
            }
            xhr.send(formData);
          } else {
            xhr.send(JSON.stringify({
              url,
              speed,
              amplify,
              maxDuration,
              compensate: finalCompensate,
              playerSpeed: finalPlayerSpeed,
              restoreOriginal: finalRestore,
              uploadToRoblox
            }));
          }
        });
      };

      let responseData = await uploadPromise();

      if (!responseData || !responseData.success) {
        throw new Error(responseData?.error || 'TRANSCODE_NODE_INIT_ERROR');
      }

      let targetJobId = null;
      // If queued in queue mode, wait for socket signal
      if (responseData.jobId) {
        targetJobId = responseData.jobId;
        responseData = await new Promise((resolve, reject) => {
          const progressHandler = (payload) => {
            if (payload && payload.jobId === targetJobId) {
              if (payload.type === 'completed') {
                socketRef.current.off('progress', progressHandler);
                resolve(payload.result);
              } else if (payload.type === 'error') {
                socketRef.current.off('progress', progressHandler);
                reject(new Error(payload.message || 'QUEUE_NODE_JOB_FAILED'));
              }
            }
          };
          socketRef.current.on('progress', progressHandler);
        });
      }

      let downloadUrl = '';
      if (responseData.downloads && responseData.downloads.length > 0) {
        downloadUrl = responseData.downloads[0].url;
      } else if (responseData.download) {
        downloadUrl = responseData.download;
      }

      finalHistory.id = targetJobId || `local-${Date.now()}`;
      if (uploadToRoblox && isRobloxConnected) {
        finalHistory.robloxStatus = 'uploading';
      }

      finalHistory.downloadUrl = downloadUrl;
      finalHistory.resultType = responseData.type;
      finalHistory.downloads = responseData.downloads;
      finalHistory.compensate = finalCompensate;
      finalHistory.restoreOriginal = finalRestore;
      finalHistory.playerSpeed = finalCompensate ? finalPlayerSpeed : null;
      finalHistory.recommendedPlayerSpeed = responseData.recommendedPlayerSpeed || (finalCompensate ? finalPlayerSpeed : Number((1 / speed).toFixed(2)));

      if (url) {
        finalHistory.url = url;
        finalHistory.title = responseData.title || youtubePreview?.title || 'YouTube Audio';
        finalHistory.thumbnail = responseData.thumbnail || youtubePreview?.thumbnail || null;
      } else {
        finalHistory.isFile = true;
        finalHistory.title = selectedFile.name;
      }

      addToHistory(finalHistory);
      setStatusMsg('PROCESS_DECRYPT_TRANSCODE_SUCCESS');
      setStatusType('success');

      let extraMarkup = '';
      if (responseData.recommendedPlayerSpeed) {
        const label = lang === 'id' ? 'Kecepatan Pemutar yang Disarankan' : 'Recommended Player Speed';
        extraMarkup += `<div style="margin-top:.75rem">${label}: <strong>${Number(responseData.recommendedPlayerSpeed).toFixed(2)}x</strong></div>`;
      }
      extraMarkup += `<div style="margin-top:.75rem">${t('converter.links_saved_msg')}</div>`;
      setResultMsg(extraMarkup);

      // Refresh stats
      fetchDashboardStats();

      // Reset Inputs
      setUrl('');
      setSelectedFile(null);
      setYoutubePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      setStatusMsg(err.message || 'PROCESS_TRANSCODE_ERROR');
      setStatusType('error');
    } finally {
      setTimeout(() => {
        setIsConverting(false);
      }, 500);
    }
  };



  // Helper string summary
  const getAdvancedSummaryText = () => {
    let summary = `SPEED: ${speed}x // GAIN: ${amplify}dB // CUT: ${maxDuration}s`;
    if (restoreOriginal) {
      summary += ` // RESTORE: ${Number(playerSpeed).toFixed(2)}`;
    } else if (compensate) {
      summary += ` // COMP: ${Number(playerSpeed).toFixed(2)}`;
    }
    return summary;
  };

  return (
    <div className="converter-container">
      {/* Decorative Scanlines and Grid */}
      <div className="bg-aurora"></div>
      <div className="grid-lines"></div>

      {/* Cyber stats hud */}
      <div className="dashboard-stats-grid">
        {/* Active Session Info */}
        <div className="dash-card profile-meta">
          <span className="dash-card-label">{t('converter.active_session')}</span>
          <div className="dash-profile-meta-wrap">
            <img 
              src={currentUser.avatar ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png?size=80` : 'https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png'} 
              alt="Avatar" 
              className="dash-avatar"
              style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
            />
            <div className="dash-profile-texts">
              <span className="dash-username">{currentUser.username}</span>
              <span className="dash-connected-badge">{t('converter.connected')}</span>
            </div>
          </div>
          <span className={`plan-badge-pill ${userPlan === 'free' ? 'free' : 'premium'}`}>
            {userPlan === 'free' ? t('converter.plan_free') : t('converter.plan_premium')}
          </span>
        </div>

        {/* Transcode logs stats */}
        <div className="dash-card">
          <div className="dash-card-header">
            <BarChart3 size={14} className="dash-icon" />
            <span className="dash-card-label">{t('converter.transcode_stats')}</span>
          </div>
          <span className="dash-card-value">{conversionsUsed}</span>
          <span className="dash-card-sub">{lang === 'id' ? 'Konversi selesai bulan ini' : 'Completed conversions this month'}</span>
        </div>

        {/* License key status */}
        <div className="dash-card">
          <div className="dash-card-header">
            <Crown size={14} className="dash-icon" />
            <span className="dash-card-label">{t('converter.system_license')}</span>
          </div>
          <span className="dash-card-value capitalize" style={{ fontSize: '20px' }}>
            {userPlan.startsWith('premium-') ? (lang === 'id' ? 'Premium' : 'Premium') : (lang === 'id' ? 'Gratis' : 'Free')}
          </span>
          <span className="dash-card-sub">
            {userPlan === 'free' 
              ? (lang === 'id' ? 'Batas: 1 file / 24 jam' : 'Limit: 1 file / 24 hours') 
              : (lang === 'id' ? 'Akses: Tanpa Batas' : 'Access: Unlimited Node')}
          </span>
        </div>

        {/* System telemetry cooldown countdown */}
        <div className="dash-card">
          <div className="dash-card-header">
            <Clock size={14} className="dash-icon" />
            <span className="dash-card-label">{t('converter.cooldown_telemetry')}</span>
          </div>
          <span className="dash-card-value font-mono" style={{ fontSize: '20px', color: 'var(--primary)' }}>
            {planCountdownText || '-'}
          </span>
          <span className="dash-card-sub">
            {userPlan === 'free' 
              ? (nextConversionSeconds > 0 ? (lang === 'id' ? 'Terkunci sementara' : 'Transcoder locked') : (lang === 'id' ? 'Siap digunakan' : 'Converter ready')) 
              : (planExpiresAt && (planExpiresAt - Date.now()) > 365 * 24 * 60 * 60 * 1000
                  ? (lang === 'id' ? 'Lisensi Lokal Aktif' : 'Local License Active')
                  : (lang === 'id' ? 'Sisa waktu premium' : 'Premium time remaining'))}
          </span>
        </div>
      </div>

      {/* Roblox Integration Settings Card */}
      <div className="roblox-settings-card glass-panel" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: 'var(--primary)', fontWeight: '800' }}>
              <span style={{ fontSize: '18px' }}>🤖</span> Roblox Auto-Upload Integration
            </h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
              {lang === 'id' 
                ? 'Unggah hasil konversi audio Anda secara otomatis langsung ke aset Roblox.' 
                : 'Automatically upload your converted audio assets directly to Roblox.'}
            </p>
          </div>
          <div>
            {isRobloxConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="roblox-status-connected" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '600' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  {lang === 'id' ? 'AKUN TERHUBUNG' : 'CONNECTED'}
                </span>
                {!isEditingRoblox && (
                  <>
                    <button type="button" onClick={() => setIsEditingRoblox(true)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      {lang === 'id' ? 'Ubah' : 'Edit'}
                    </button>
                    <button type="button" onClick={handleDisconnectRoblox} className="btn-admin-logout" style={{ padding: '4px 10px', fontSize: '11px', margin: 0 }}>
                      {lang === 'id' ? 'Putuskan' : 'Disconnect'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <span className="roblox-status-disconnected" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }}></span>
                {lang === 'id' ? 'AKUN TIDAK TERHUBUNG' : 'NOT CONNECTED'}
              </span>
            )}
          </div>
        </div>

        {isRobloxConnected && !isEditingRoblox && (
          <div style={{ marginTop: '16px', background: 'rgba(7, 21, 31, 0.4)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0, 210, 196, 0.05)', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Target Creator ID</span>
                <div style={{ fontWeight: '700', marginTop: '2px', color: 'var(--text)' }}>
                  {savedRobloxTargetId} <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--primary)', background: 'rgba(0, 210, 196, 0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{savedRobloxTargetType.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Status Aset</span>
                <div style={{ fontWeight: '500', marginTop: '2px', color: '#10b981' }}>
                  {lang === 'id' ? 'Unggah otomatis aktif' : 'Auto-upload active'}
                </div>
              </div>
            </div>
          </div>
        )}

        {(!isRobloxConnected || isEditingRoblox) && (
          <form onSubmit={handleSaveRobloxConfig} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label">Roblox Open Cloud API Key</label>
                <input 
                  type="password" 
                  value={robloxApiKey}
                  onChange={(e) => setRobloxApiKey(e.target.value)}
                  placeholder={isRobloxConnected ? '••••••••' : 'Masukkan API Key Anda'}
                  className="admin-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label">Creator Target ID (User/Group ID)</label>
                <input 
                  type="text" 
                  value={robloxTargetId}
                  onChange={(e) => setRobloxTargetId(e.target.value)}
                  placeholder="Contoh: 12345678"
                  className="admin-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div className="field-group" style={{ margin: 0 }}>
                <label className="field-label">Tipe Pemilik Aset</label>
                <select
                  value={robloxTargetType}
                  onChange={(e) => setRobloxTargetType(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', height: '37px', boxSizing: 'border-box', background: 'rgba(7, 21, 31, 0.9)' }}
                >
                  <option value="user">{lang === 'id' ? 'Akun Pribadi (User)' : 'Personal Account (User)'}</option>
                  <option value="group">{lang === 'id' ? 'Komunitas / Grup (Group)' : 'Group / Community (Group)'}</option>
                </select>
              </div>
            </div>

            {robloxConfigError && (
              <div style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: '600' }}>
                ⚠️ {robloxConfigError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button 
                type="button" 
                onClick={() => setShowRobloxTutorial(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', fontSize: '12px', cursor: 'pointer', padding: 0 }}
              >
                {lang === 'id' ? '❓ Cara Membuat & Mengatur API Key Roblox' : '❓ How to create & configure Roblox API Key'}
              </button>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {isEditingRoblox && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditingRoblox(false);
                      setRobloxApiKey(isRobloxConnected ? '••••••••' : '');
                      setRobloxTargetId(savedRobloxTargetId);
                      setRobloxTargetType(savedRobloxTargetType);
                      setRobloxConfigError('');
                    }}
                    className="btn-secondary" 
                    style={{ padding: '6px 16px', fontSize: '12px' }}
                  >
                    {lang === 'id' ? 'Batal' : 'Cancel'}
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={isSavingRoblox}
                  className="btn-primary-glow" 
                  style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '4px' }}
                >
                  {isSavingRoblox 
                    ? (lang === 'id' ? 'Menyimpan...' : 'Saving...') 
                    : (lang === 'id' ? 'Simpan & Hubungkan' : 'Save & Connect')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Transcoder Console Panel */}
      <form onSubmit={handleConvertSubmit} className="convert-form-card glass-panel">
        <h2 className="converter-card-title" style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)' }}>
          {t('converter.title')}
        </h2>

        <div className="field-group" style={{ marginTop: '18px' }}>
          <label htmlFor="url" className="field-label">{t('converter.urlLabel')}</label>
          <div className="url-input-wrapper">
            <YoutubeIcon className="input-icon" size={18} />
            <input 
              id="url"
              type="url"
              placeholder={t('converter.urlPlaceholder')}
              value={url}
              onChange={handleUrlInputChange}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData('Text');
                if (pastedText) {
                  if (previewTimeoutRef.current) {
                    clearTimeout(previewTimeoutRef.current);
                  }
                  checkYoutubePreview(pastedText);
                }
              }}
              className="url-input"
            />
          </div>
        </div>

        {/* Live metadata loading previews */}
        {isPreviewLoading && (
          <div className="preview-loading-box">
            <RefreshCw className="spin" size={14} />
            <span>{t('converter.loading_metadata')}</span>
          </div>
        )}

        {youtubePreview && (
          <div className="youtube-preview-card">
            <div className="preview-thumb" style={{ width: '80px', height: '52px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--primary-dim)', flexShrink: 0 }}>
              {youtubePreview.thumbnail && (
                <img 
                  src={youtubePreview.thumbnail} 
                  alt={youtubePreview.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </div>
            <div className="preview-meta-info">
              <span className="preview-title">{youtubePreview.title || t('previewTitleDefault')}</span>
              <span className="preview-spec">
                {lang === 'id' ? 'KECEPATAN' : 'SPEED'}: <strong>{speed}x</strong> // {lang === 'id' ? 'VOLUME' : 'VOLUME'}: <strong>{amplify}dB</strong> // {lang === 'id' ? 'DURASI' : 'DURATION'}: <strong>{maxDuration}s</strong>
              </span>
            </div>
          </div>
        )}

        <div className="form-divider">
          <span>{t('converter.divider')}</span>
        </div>

        {/* File Drag and Drop zone */}
        <div className="field-group">
          <label className="field-label">{t('converter.uploadLabel')}</label>
          <div 
            className={`drop-zone-wrapper ${dragOver ? 'dragover' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/mp3" 
              style={{ display: 'none' }}
            />
            <div className="drop-zone-content">
              <Upload size={24} className="upload-icon" />
              <p className="drop-hint">{t('converter.dropHint')}</p>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="btn-browse-ghost"
              >
                {t('converter.browseButton')}
              </button>
              <span className="hint-max">{t('converter.maxHint')}</span>
            </div>
          </div>
          <div className="file-name-indicator">
            {selectedFile ? `${lang === 'id' ? 'File Terpilih: ' : 'Selected File: '}${selectedFile.name}` : t('converter.no_file_selected')}
          </div>
        </div>

        {/* Advanced accordion dashboard */}
        <div className="advanced-accordion-trigger" onClick={() => setShowAdvanced(!showAdvanced)}>
          <div className="accordion-label-wrap">
            <Sliders size={14} className="accordion-icon" />
            <span>{t('converter.advancedTitle')}</span>
          </div>
          <span className="accordion-summary">{getAdvancedSummaryText()}</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {/* Advanced params details panel */}
        <div className={`advanced-settings-panel ${showAdvanced ? 'expanded' : ''}`}>
          <div className="presets-row">
            {Object.keys(presets).map((key) => (
              <button
                key={key}
                type="button"
                className={`btn-preset ${selectedPreset === key ? 'active' : ''}`}
                onClick={() => applyPreset(key)}
              >
                {t(presets[key].labelKey)}
              </button>
            ))}
          </div>

          <div className="slider-item">
            <div className="slider-labels">
              <span>{t('converter.speedLabel')}</span>
              <span className="slider-val-highlight">{speed}x</span>
            </div>
            <input 
              type="range" 
              min="1.0" 
              max="3.0" 
              step="0.1" 
              value={speed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeed(val);
                setSelectedPreset('');
              }}
              className="form-slider"
            />
          </div>

          <div className="slider-item">
            <div className="slider-labels">
              <span>{t('converter.amplifyLabel')}</span>
              <span className="slider-val-highlight">{amplify} dB</span>
            </div>
            <input 
              type="range" 
              min="-20" 
              max="6" 
              step="1" 
              value={amplify}
              onChange={(e) => {
                setAmplify(parseInt(e.target.value));
                setSelectedPreset('');
              }}
              className="form-slider"
            />
          </div>

          <div className="slider-item">
            <div className="slider-labels">
              <span>{t('converter.durationLabel')}</span>
              <span className="slider-val-highlight">{maxDuration}s</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="400" 
              step="10" 
              value={maxDuration}
              onChange={(e) => {
                setMaxDuration(parseInt(e.target.value));
                setSelectedPreset('');
              }}
              className="form-slider"
            />
            <p className="slider-hint-text">{t('converter.durationHint')}</p>
          </div>

          <div className="option-rows-container">
            <div className="option-flex-row">
              <label className="checkbox-label-wrap">
                <input 
                  type="checkbox" 
                  checked={compensate}
                  onChange={(e) => {
                    setCompensate(e.target.checked);
                    if (!e.target.checked) setRestoreOriginal(false);
                  }}
                  className="form-checkbox"
                />
                <span>{t('converter.compensateLabel')}</span>
              </label>

              <div className="player-speed-input-wrap">
                <label>{lang === 'id' ? 'KECEPATAN PEMUTAR' : 'PLAYER RATE'}</label>
                <input 
                  type="number" 
                  min="0.05" 
                  max="2" 
                  step="0.01" 
                  value={playerSpeed}
                  disabled={restoreOriginal}
                  onChange={(e) => setPlayerSpeed(parseFloat(e.target.value) || 0.40)}
                  className="player-speed-input"
                />
                <span className="player-speed-tip">
                  {t('converter.playerSpeedHint')}
                </span>
              </div>
            </div>

            <div className="option-flex-row">
              <label className="checkbox-label-wrap">
                <input 
                  type="checkbox" 
                  checked={restoreOriginal}
                  onChange={(e) => handleRestoreChange(e.target.checked)}
                  className="form-checkbox"
                />
                <span>{t('converter.restoreLabel')}</span>
              </label>
            </div>
            <p className="restore-note-text">{t('converter.restoreNote')}</p>
          </div>
        </div>

        {/* Roblox Upload Option */}
        <div style={{ marginTop: '18px', marginBottom: '18px' }}>
          <label className="checkbox-label-wrap" style={{ cursor: isRobloxConnected ? 'pointer' : 'not-allowed', opacity: isRobloxConnected ? 1 : 0.6 }}>
            <input 
              type="checkbox" 
              checked={uploadToRoblox && isRobloxConnected}
              disabled={!isRobloxConnected}
              onChange={(e) => {
                if (!isRobloxConnected) {
                  alert(lang === 'id' ? 'Silakan hubungkan akun Roblox Anda terlebih dahulu di panel atas!' : 'Please connect your Roblox account first in the panel above!');
                  return;
                }
                setUploadToRoblox(e.target.checked);
              }}
              className="form-checkbox"
            />
            <span style={{ fontWeight: '600', color: uploadToRoblox && isRobloxConnected ? 'var(--primary)' : 'var(--text)' }}>
              {lang === 'id' 
                ? '🤖 Upload Otomatis ke Roblox setelah konversi selesai' 
                : '🤖 Auto-upload to Roblox after conversion finishes'}
            </span>
          </label>
          {!isRobloxConnected && (
            <p style={{ margin: '4px 0 0 24px', fontSize: '11px', color: 'var(--danger)' }}>
              {lang === 'id' 
                ? '* Hubungkan akun Roblox Anda di atas untuk mengaktifkan fitur ini.' 
                : '* Connect your Roblox account above to enable this feature.'}
            </p>
          )}
        </div>

        {/* Submit Transcode node button */}
        <button 
          type="submit" 
          disabled={isConverting || (!canConvertNow && userPlan === 'free')} 
          className="btn-convert-primary"
        >
          {isConverting ? t('converter.processing') : t('converter.convertButton')}
        </button>

        {/* Lock message */}
        {!canConvertNow && userPlan === 'free' && (
          <div 
            onClick={() => setShowUpgradeModal(true)} 
            className="free-plan-lock-banner pointer"
          >
            {lang === 'id' ? (
              <p>
                Batas gratis habis (1 file / 24 jam). Waktu tunggu tersisa: {planCountdownText}.{' '}
                <strong>Beli Paket Premium untuk akses tanpa batas.</strong>
              </p>
            ) : (
              <p>
                Free limit reached (1 file / 24 hours). Cooldown remaining: {planCountdownText}.{' '}
                <strong>Upgrade to Premium Plan for unlimited access.</strong>
              </p>
            )}
          </div>
        )}

        {/* Status CLI Logs */}
        {statusMsg && (
          <div className={`status-bubble-msg ${statusType}`}>
            <span>
              {statusMsg === 'PROCESS_DECRYPT_TRANSCODE_SUCCESS' 
                ? t('converter.success_msg') 
                : (statusType === 'error' ? getFriendlyErrorMessage(statusMsg, lang) : statusMsg)}
            </span>
          </div>
        )}

        {resultMsg && (
          <div 
            className="result-bubble-msg"
            dangerouslySetInnerHTML={{ __html: resultMsg }}
          />
        )}
      </form>

      {/* History log console */}
      <section className="history-wrapper">
        <div className="section-header">
          <h2>{t('converter.historyTitle')}</h2>
          <p>{t('converter.historySubtitle')}</p>
        </div>
        <HistorySection 
          historyList={historyList} 
          onDeleteItem={handleDeleteHistoryItem} 
          t={t}
        />
      </section>

      {/* Roblox API Key Tutorial Modal */}
      {showRobloxTutorial && (
        <div className="modal-overlay" onClick={() => setShowRobloxTutorial(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>🤖 Tutorial API Key Roblox Open Cloud</h2>
              <button onClick={() => setShowRobloxTutorial(false)} className="btn-modal-close">×</button>
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
              <p>Ikuti panduan langkah demi langkah di bawah ini untuk membuat API Key yang aman untuk V STUDIO:</p>
              
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', margin: '12px 0' }}>
                <li>
                  <strong>Buka Roblox Credentials Dashboard:</strong>
                  <br />
                  Kunjungi tautan berikut di browser Anda: <a href="https://create.roblox.com/credentials" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>create.roblox.com/credentials</a>.
                </li>
                <li>
                  <strong>Buat API Key Baru:</strong>
                  <br />
                  Klik tombol <strong>"Create API Key"</strong> di pojok kanan atas.
                </li>
                <li>
                  <strong>Isi Detail Utama API Key:</strong>
                  <br />
                  - <strong>Name:</strong> Masukkan nama untuk menandai kunci ini, contohnya: <code>V Studio Audio</code>.
                  <br />
                  - <strong>Description:</strong> (Opsional) Tulis deskripsi singkat.
                </li>
                <li>
                  <strong>Atur Izin Akses (Access Permissions):</strong>
                  <br />
                  Di bawah menu <strong>"Access Permissions"</strong>, pilih API System berikut:
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '6px' }}>
                    <li>Pilih <strong>Assets API</strong> dari daftar drop-down.</li>
                    <li>Klik <strong>Add API System</strong>.</li>
                    <li>Pada kolom izin, tambahkan scope:
                      <br />- <code>Asset: Write</code> (Diperlukan untuk mengunggah audio).
                      <br />- <code>Asset: Read</code> (Diperlukan untuk memantau status lolos hak cipta).
                    </li>
                  </ul>
                  <div style={{ marginTop: '10px', marginBottom: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src="/roblox_tutorial_1.png?v=2" alt="Roblox API Key Permissions" style={{ width: '100%', display: 'block' }} />
                  </div>
                </li>
                <li>
                  <strong>Tentukan Akun/Grup (Experience/Owner Scope):</strong>
                  <br />
                  Pastikan Anda memilih pemilik aset yang sesuai (Akun pribadi Anda atau Grup Roblox).
                </li>
                <li>
                  <strong>Setel Keamanan IP (IP Restrictions):</strong>
                  <br />
                  Demi alasan keamanan, Anda bisa membatasi penggunaan kunci ini:
                  <br />
                  - Masukkan IP Range <code>0.0.0.0/0</code> agar kunci ini bisa diakses dari server cloud V STUDIO.
                  <br />
                  - <em>Catatan:</em> API Key ini 100% aman karena hanya memiliki akses khusus Assets API dan tidak bisa digunakan untuk mengambil Robux atau mengubah data login akun Anda.
                  <div style={{ marginTop: '10px', marginBottom: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src="/roblox_tutorial_2.png?v=2" alt="Roblox API Key Security" style={{ width: '100%', display: 'block' }} />
                  </div>
                </li>
                <li>
                  <strong>Simpan & Salin Kunci:</strong>
                  <br />
                  Klik <strong>"Save & Generate Key"</strong>. Roblox akan menampilkan API Key yang dihasilkan.
                  <br />
                  <span style={{ color: 'var(--danger)', fontWeight: '600' }}>⚠️ PENTING:</span> Salin API Key tersebut segera. Roblox tidak akan menampilkannya lagi demi keamanan. Tempel kunci tersebut di kolom input V STUDIO.
                </li>
              </ol>

              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0, 210, 196, 0.05)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                <strong>Cara Mencari Creator Target ID:</strong>
                <br />
                - <strong>Akun Pribadi:</strong> Masuk ke profil Roblox Anda di web. ID Pengguna adalah deretan angka pada URL profile Anda (misal: <code>roblox.com/users/<b>12345678</b>/profile</code>).
                <br />
                - <strong>Grup Roblox:</strong> Buka halaman grup Roblox Anda. ID Grup adalah deretan angka pada URL grup (misal: <code>roblox.com/groups/<b>87654321</b>/name</code>).
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowRobloxTutorial(false)} className="btn-primary-glow" style={{ padding: '8px 20px', borderRadius: '4px' }}>
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
