import React from 'react';
import { useI18n } from '../context/LanguageContext';
import { ShieldAlert, Cpu, HardDrive, Key } from 'lucide-react';

const BACKEND_URL = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

export const LandingPage = ({ currentUser, onNavigate }) => {
  const { t, lang } = useI18n();

  const handleStartCTA = () => {
    if (currentUser) {
      onNavigate('converter');
    } else {
      window.location.href = `${BACKEND_URL}/auth/discord`;
    }
  };

  return (
    <div className="landing-page">
      {/* Decorative Scanlines and Grid */}
      <div className="bg-aurora"></div>
      <div className="grid-lines"></div>

      {/* Hero Terminal Console */}
      <header className="hero-section">
        <div className="badge-wrapper">
          <span className="hero-badge">{t('hero.badge')}</span>
        </div>
        
        <h1 className="hero-title">
          V STUDIO // <strong>{t('nav.converter')}</strong>
        </h1>
        
        <div className="hero-subtitle">
          <p style={{ color: 'var(--text)' }}>{t('hero.sub')}</p>
        </div>
        
        <div className="hero-actions">
          <button onClick={handleStartCTA} className="btn-primary-glow">
            <span>{currentUser ? t('hero.dashboard_cta') : t('hero.login_cta')}</span>
          </button>
          
          <a href="#plans" className="btn-secondary">
            {t('hero.pricing_cta')}
          </a>
        </div>
      </header>

      {/* Stats HUD */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-card">
            <span className="stat-num">10.240+</span>
            <span className="stat-label">{t('stats.uploaded')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">99.98%</span>
            <span className="stat-label">{t('stats.uptime')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">512+</span>
            <span className="stat-label">{t('stats.users')}</span>
          </div>
        </div>
      </div>

      {/* Access Tiers Section */}
      <section className="plans-section" id="plans">
        <div className="section-header">
          <h2>{t('plans.header.title')}</h2>
          <p>{t('plans.header.sub')}</p>
        </div>

        <div className="plans-grid">
          {/* Monthly License */}
          <div className="plan-card popular glass-panel">
            <div className="popular-badge">
              <span>{t('plans.popular')}</span>
            </div>
            <span className="plan-period">{t('plans.month.title')}</span>
            <div className="plan-price-wrap">
              <span className="plan-price highlight">50K</span>
              <span className="plan-price-slash">IDR / {lang === 'id' ? 'BULAN' : 'MONTH'}</span>
            </div>
            
            <hr className="plan-divider" />
            
            <ul className="plan-features">
              <li>{t('plans.features.unlimited')}</li>
              <li>{t('plans.features.auto_upload')}</li>
              <li>{t('plans.features.controls')}</li>
              <li>{t('plans.features.moderation')}</li>
              <li>{t('plans.features.support')}</li>
            </ul>
            
            <button onClick={handleStartCTA} className="btn-plan-select filled">
              {t('plans.month.cta')}
            </button>
          </div>
        </div>
      </section>

      {/* Security Directives Section */}
      <section className="security-section" id="security">
        <div className="section-header">
          <h2>{t('secure.title_friendly')}</h2>
        </div>

        <div className="security-grid">
          <div className="security-card glass-panel">
            <div className="security-icon-wrap">
              <Key size={18} className="security-icon" />
            </div>
            <div className="security-content">
              <h3>{t('secure.card1_title')}</h3>
              <p>{t('secure.card1_desc')}</p>
            </div>
          </div>

          <div className="security-card glass-panel">
            <div className="security-icon-wrap">
              <Cpu size={18} className="security-icon" />
            </div>
            <div className="security-content">
              <h3>{t('secure.card2_title')}</h3>
              <p>{t('secure.card2_desc')}</p>
            </div>
          </div>

          <div className="security-card glass-panel">
            <div className="security-icon-wrap">
              <ShieldAlert size={18} className="security-icon" />
            </div>
            <div className="security-content">
              <h3>{t('secure.card3_title')}</h3>
              <p>{t('secure.card3_desc')}</p>
            </div>
          </div>
        </div>

        <div className="security-footer-links">
          {lang === 'id' ? (
            <>
              Baca <button onClick={() => onNavigate('privacy')} className="link-btn">Kebijakan Privasi</button> dan <button onClick={() => onNavigate('terms')} className="link-btn">Syarat Ketentuan</button> kami.
            </>
          ) : (
            <>
              Read our <button onClick={() => onNavigate('privacy')} className="link-btn">Privacy Policy</button> and <button onClick={() => onNavigate('terms')} className="link-btn">Terms of Service</button>.
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <img 
            src="https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png" 
            alt="Logo" 
            className="footer-logo-img"
          />
          <span>V STUDIO // {t('nav.converter')}</span>
        </div>
        <div className="footer-stars">
          {lang === 'id' ? 'Layanan Konversi Roblox Terpercaya' : 'Trusted Roblox Audio Service'}
        </div>
        <p className="footer-copyright">{t('footer.copyright')}</p>
      </footer>
    </div>
  );
};
