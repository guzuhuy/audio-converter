import React from 'react';
import { useI18n } from '../context/LanguageContext';
import { AlertOctagon } from 'lucide-react';

const BACKEND_URL = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

export const JoinDiscordPage = () => {
  const { t, lang } = useI18n();

  return (
    <div className="legal-container">
      {/* Decorative scanlines */}
      <div className="bg-aurora"></div>
      <div className="grid-lines"></div>

      <div className="legal-card discord-gate-card">
        <div className="discord-gate-icon-wrap">
          <AlertOctagon size={28} style={{ color: 'var(--danger)' }} />
        </div>
        <h2 className="discord-gate-title">
          {lang === 'id' ? 'Gabung Server Discord' : 'Join Discord Server'}
        </h2>
        
        <p className="discord-gate-desc">
          {t('join.note')}
        </p>

        <div className="discord-gate-actions">
          <a 
            href={`${BACKEND_URL}/join-discord/invite`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary-glow"
            style={{ textDecoration: 'none', justifyContent: 'center' }}
          >
            {t('join.invite')}
          </a>

          <form method="get" action={`${BACKEND_URL}/auth/discord/callback`}>
            <button 
              type="submit" 
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {t('join.verify')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
