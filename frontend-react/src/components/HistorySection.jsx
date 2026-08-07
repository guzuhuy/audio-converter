import React, { useEffect, useState } from 'react';
import { Trash2, Download, ExternalLink, Music, Clock } from 'lucide-react';
import { useI18n } from '../context/LanguageContext';

const BACKEND_URL = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

const getDownloadUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

export const HistorySection = ({ historyList, onDeleteItem }) => {
  const { t, lang } = useI18n();
  const [ticks, setTicks] = useState(0);

  // Re-render countdowns every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (expiresAt) => {
    const timeRemaining = Math.max(0, expiresAt - Date.now());
    const minutesLeft = Math.ceil(timeRemaining / 60000);
    return minutesLeft;
  };

  if (historyList.length === 0) {
    return (
      <div className="history-empty glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
        <p>{lang === 'id' ? 'Belum ada riwayat konversi.' : 'No conversion history found.'}</p>
      </div>
    );
  }

  return (
    <div className="history-grid">
      {historyList.map((item) => {
        const minutesLeft = formatCountdown(item.expiresAt);
        const isExpiringSoon = minutesLeft <= 2;

        return (
          <div key={item.id} className="history-item-card glass-panel">
            <div className="history-item-thumb">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div className="music-placeholder">
                  <Music size={16} />
                </div>
              )}
            </div>

            <div className="history-item-info">
              <div className="history-item-title-row">
                <h4 className="history-item-title" title={item.title}>
                  {item.title}
                </h4>
                <span className="badge-completed">
                  {lang === 'id' ? 'Berhasil' : 'Success'}
                </span>
              </div>

              {item.url && (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="history-item-link"
                >
                  <ExternalLink size={10} />
                  <span>{lang === 'id' ? 'Sumber' : 'Source'}: {item.url}</span>
                </a>
              )}

              <div className="history-item-details">
                <span>{lang === 'id' ? 'Kecepatan' : 'Speed'}: <strong>{item.speed}x</strong></span>
                <span>{lang === 'id' ? 'Volume' : 'Volume'}: <strong>{item.amplify}dB</strong></span>
                <span>{lang === 'id' ? 'Durasi' : 'Duration'}: <strong>{item.maxDuration}s</strong></span>
                {item.restoreOriginal && (
                  <span className="badge-restore-label">
                    {lang === 'id' ? 'Suara Asli Aktif' : 'Original Sound Active'}
                  </span>
                )}
                {item.recommendedPlayerSpeed && (
                  <span className="badge-speed-label">
                    {lang === 'id' ? 'Kecepatan Pemutar' : 'Player Speed'}: <strong>{Number(item.recommendedPlayerSpeed).toFixed(2)}x</strong>
                  </span>
                )}
              </div>

              {/* Roblox auto-upload status */}
              {item.robloxStatus === 'uploading' && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(0, 210, 196, 0.05)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(0, 210, 196, 0.15)' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></span>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {lang === 'id' ? '🚀 Mengunggah ke Roblox...' : '🚀 Uploading to Roblox...'}
                  </span>
                </div>
              )}
              {item.robloxStatus === 'pending' && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(245, 158, 11, 0.05)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }}></span>
                  <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                    {lang === 'id' ? '⏳ Roblox: Peninjauan Moderasi (Pending)...' : '⏳ Roblox: Under Moderation (Pending)...'}
                  </span>
                </div>
              )}
              {item.robloxStatus === 'approved' && (
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', background: 'rgba(16, 185, 129, 0.05)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.15)', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>
                      {lang === 'id' ? '✅ Roblox: Lolos!' : '✅ Roblox: Approved!'}
                    </span>
                    <code style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text)' }}>
                      {item.robloxAssetId}
                    </code>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`rbxassetid://${item.robloxAssetId}`);
                      alert(lang === 'id' ? 'Asset ID berhasil disalin!' : 'Asset ID copied!');
                    }}
                    style={{ background: 'var(--primary)', border: 'none', color: '#000', fontSize: '10px', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {lang === 'id' ? 'Salin ID' : 'Copy ID'}
                  </button>
                </div>
              )}
              {item.robloxStatus === 'blocked' && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span>
                  <span style={{ fontWeight: '600', color: 'var(--danger)' }}>
                    {lang === 'id' ? '❌ Roblox: Diblokir (Copyright / Hak Cipta)' : '❌ Roblox: Blocked (Copyright / Censored)'}
                  </span>
                </div>
              )}
              {item.robloxStatus === 'error' && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span>
                    <span style={{ fontWeight: '600', color: 'var(--danger)' }}>
                      {lang === 'id' ? '⚠️ Roblox: Gagal Mengunggah' : '⚠️ Roblox: Upload Failed'}
                    </span>
                  </div>
                  {item.robloxError && (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', paddingLeft: '16px' }}>
                      {item.robloxError}
                    </span>
                  )}
                </div>
              )}

              {/* Timer info */}
              {item.expiresAt && item.expiresAt < Date.now() + 365 * 24 * 60 * 60 * 1000 && (
                <div className="history-item-timer">
                  <Clock size={12} className={isExpiringSoon ? 'expiring-soon' : ''} />
                  {minutesLeft > 0 ? (
                    <span className={isExpiringSoon ? 'expiring-soon-text' : 'timer-text'}>
                      {isExpiringSoon 
                        ? (lang === 'id' ? 'Peringatan: File segera dihapus' : 'Warning: File expiring soon') 
                        : (lang === 'id' ? `Dihapus otomatis dalam: ${minutesLeft} menit` : `Auto-deleting in: ${minutesLeft}m`)}
                    </span>
                  ) : (
                    <span className="expiring-soon-text">
                      {lang === 'id' ? 'Sudah Dihapus' : 'Purged'}
                    </span>
                  )}
                </div>
              )}

              <div className="history-item-actions">
                {/* Download links */}
                <div className="download-buttons-group">
                  {item.downloads && item.downloads.length > 0 ? (
                    item.downloads.map((dl, idx) => {
                      const durationLabel = dl.formattedDuration ? ` [${dl.formattedDuration}]` : '';
                      const label = dl.totalParts > 1 
                        ? `${lang === 'id' ? 'Bagian' : 'Part'} ${dl.partNumber}${durationLabel}` 
                        : `${lang === 'id' ? 'Audio OGG' : 'OGG Audio'}${durationLabel}`;
                      return (
                        <a
                          key={idx}
                          href={getDownloadUrl(dl.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-download-part"
                          download={dl.fileName}
                        >
                          <Download size={12} />
                          <span>{lang === 'id' ? 'Unduh' : 'Download'} {label}</span>
                        </a>
                      );
                    })
                  ) : item.downloadUrl ? (
                    <a
                      href={getDownloadUrl(item.downloadUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-download-part"
                      download
                    >
                      <Download size={12} />
                      <span>{lang === 'id' ? 'Unduh Audio OGG' : 'Download OGG Audio'}</span>
                    </a>
                  ) : null}
                </div>

                <button 
                  onClick={() => onDeleteItem(item.id)} 
                  className="btn-delete-history"
                  title={t('deleteButton')}
                >
                  <Trash2 size={12} />
                  <span>{lang === 'id' ? 'Hapus' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
