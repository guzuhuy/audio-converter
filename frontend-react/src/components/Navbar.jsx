import React from 'react';
import { useI18n } from '../context/LanguageContext';
import { LogOut, Globe, ShieldAlert, Cpu } from 'lucide-react';

const BACKEND_URL = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

export const Navbar = ({ currentUser, onLogout, onNavigate, currentPage, onUpgradeClick }) => {
  const { lang, setLang, t } = useI18n();

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => onNavigate('landing')}>
        <img 
          src="https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png" 
          alt="V STUDIO Logo" 
          className="logo-img"
        />
        <span className="logo-text">
          V STUDIO <span className="logo-subtext">Konverter Audio</span>
        </span>
      </div>

      <div className="nav-links">
        <button 
          onClick={() => onNavigate('landing')} 
          className={`nav-link-btn ${currentPage === 'landing' ? 'active' : ''}`}
        >
          {t('nav.features')}
        </button>
        {currentUser && (
          <button 
            onClick={() => onNavigate('converter')} 
            className={`nav-link-btn ${currentPage === 'converter' ? 'active' : ''}`}
          >
            {t('nav.converter')}
          </button>
        )}
        {currentUser && (
          <button 
            onClick={onUpgradeClick} 
            className="nav-link-btn nav-upgrade-btn"
          >
            {t('nav.upgrade')}
          </button>
        )}
        {currentUser && currentUser.isAdmin && (
          <button 
            onClick={() => onNavigate('admin')} 
            className={`nav-link-btn ${currentPage === 'admin' ? 'active' : ''}`}
          >
            {t('nav.admin')}
          </button>
        )}
      </div>

      <div className="nav-actions">
        {/* Language Toggler */}
        <div className="lang-toggle-wrap">
          <Globe size={12} className="lang-icon" />
          <button 
            className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
            onClick={() => setLang('id')}
          >
            ID
          </button>
          <div className="lang-divider"></div>
          <button 
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>

        {/* Auth Badge */}
        {currentUser ? (
          <div className="profile-container">
            <div className="profile-badge">
              <img 
                src={currentUser.avatar ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png?size=80` : 'https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png'} 
                alt="Avatar" 
                className="profile-avatar"
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div className="profile-info-text">
                <span className="profile-username">{currentUser.username}</span>
                <span className="profile-tag">ID: {currentUser.loginOrder || currentUser.discriminator || '0'}</span>
              </div>
            </div>
            
            <button 
              onClick={onLogout} 
              className="btn-icon-logout" 
              title={t('converter.logoutButton')}
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button 
            className="btn-discord-nav"
            onClick={() => window.location.href = `${BACKEND_URL}/auth/discord`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            <span>{t('nav.login')}</span>
          </button>
        )}
      </div>
    </nav>
  );
};
