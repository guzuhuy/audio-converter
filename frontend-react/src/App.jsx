import React, { useState, useEffect } from 'react';
import { LanguageProvider, useI18n } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { IntroLoader } from './components/IntroLoader';
import { LandingPage } from './components/LandingPage';
import { ConverterPage } from './components/ConverterPage';
import { AdminPage } from './components/AdminPage';
import { PrivacyPage, TermsPage } from './components/LegalPages';
import { JoinDiscordPage } from './components/JoinDiscordPage';
import { RefreshCw, CheckCircle, Gift, Check } from 'lucide-react';

const BACKEND_URL = window.location.port === '5173'
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : '';

function AppContent() {
  const { t } = useI18n();
  const [currentUser, setCurrentUser] = useState(null);
  const [isIntroActive, setIsIntroActive] = useState(() => {
    return !sessionStorage.getItem('vstudio_intro_played');
  });
  const [authChecked, setAuthChecked] = useState(false);
  
  // Upgrade / License Modal States
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('');

  // Claim Free Premium States
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimingFreePremium, setClaimingFreePremium] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [hasDismissedClaimModal, setHasDismissedClaimModal] = useState(false);

  const handleSelectPlan = (planKey) => {
    setSelectedPlanName('Premium 30 Day (50K)');
    setShowUpgradeModal(false);
    setShowTicketModal(true);
  };
  
  // Routing State
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#/converter') return 'converter';
    if (hash === '#/admin') return 'admin';
    if (hash === '#/privacy') return 'privacy';
    if (hash === '#/terms') return 'terms';
    if (hash === '#/join-discord') return 'join-discord';
    if (hash === '#/test') return 'test';
    return 'landing';
  });

  // Listen for hash change for back/forward navigation support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/converter') setCurrentPage('converter');
      else if (hash === '#/admin') setCurrentPage('admin');
      else if (hash === '#/privacy') setCurrentPage('privacy');
      else if (hash === '#/terms') setCurrentPage('terms');
      else if (hash === '#/join-discord') setCurrentPage('join-discord');
      else if (hash === '#/test') setCurrentPage('test');
      else setCurrentPage('landing');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page) => {
    window.location.hash = page === 'landing' ? '' : `#/${page}`;
    setCurrentPage(page);
  };

  // Fetch session on mount or check page changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include' });
        const data = await response.json();
        if (data.success && data.user) {
          if (currentPage === 'landing') {
            // In local/offline mode, we auto-navigate to converter rather than forcing logout
            navigateTo('converter');
            return;
          }
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Session fetch failed:', err);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [currentPage]);

  useEffect(() => {
    if (currentUser && currentUser.claimedFreePremium === false && !hasDismissedClaimModal) {
      setShowClaimModal(true);
    } else {
      setShowClaimModal(false);
    }
  }, [currentUser, hasDismissedClaimModal]);

  const handleClaimFreePremium = async () => {
    setClaimingFreePremium(true);
    setClaimError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/claim-free-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setClaimSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setClaimError(data.error || t('claim_free_premium.error'));
      }
    } catch (err) {
      console.error('Error claiming free premium:', err);
      setClaimError(t('claim_free_premium.error'));
    } finally {
      setClaimingFreePremium(false);
    }
  };

  const handleLogout = async () => {
    // 1. Clean up local history files on the server
    try {
      const saved = localStorage.getItem('audioConverterHistory');
      const loaded = saved ? JSON.parse(saved) : [];
      
      const promises = loaded.map(item => {
        return fetch(`${BACKEND_URL}/api/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            downloads: item.downloads || [],
            downloadUrl: item.downloadUrl 
          })
        }).catch(err => console.error('Error deleting file on logout:', err));
      });
      
      await Promise.all(promises);
    } catch (err) {
      console.error('Error during logout file cleanup:', err);
    }

    // 2. Clear local storage
    localStorage.removeItem('audioConverterHistory');

    // 3. Trigger backend logout and refresh
    window.location.href = `${BACKEND_URL}/auth/logout`;
  };

  // Guard routing
  useEffect(() => {
    if (authChecked) {
      if (currentPage === 'converter' && !currentUser) {
        navigateTo('landing');
      }
    }
  }, [currentPage, currentUser, authChecked]);

  if (isIntroActive) {
    return (
      <IntroLoader 
        onFinish={() => {
          setIsIntroActive(false);
          sessionStorage.setItem('vstudio_intro_played', 'true');
        }} 
      />
    );
  }

  if (!authChecked) {
    return (
      <div className="app-loader">
        <RefreshCw className="spin loader-icon" size={36} />
        <span>Loading V STUDIO...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigate={navigateTo}
        currentPage={currentPage}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />
      
      <main className="main-content">
        {currentPage === 'landing' && (
          <LandingPage 
            currentUser={currentUser} 
            onNavigate={navigateTo} 
          />
        )}
        
        {currentPage === 'converter' && currentUser && (
          <ConverterPage 
            currentUser={currentUser} 
            onNavigate={navigateTo}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        )}
        
        {currentPage === 'admin' && (
          <AdminPage 
            currentUser={currentUser} 
          />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPage onNavigate={navigateTo} />
        )}

        {currentPage === 'terms' && (
          <TermsPage onNavigate={navigateTo} />
        )}

        {currentPage === 'join-discord' && (
          <JoinDiscordPage />
        )}

        {currentPage === 'test' && (
          <div className="test-page-container">
            <div className="test-card glass-panel text-center">
              <CheckCircle size={48} className="text-success" />
              <h1>{t('test.heading')}</h1>
              <p>{t('test.message')}</p>
              <div className="test-api-status">
                <span>API Connection: </span>
                <span className="api-badge">Online</span>
              </div>
              <div className="test-api-status mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Entrance Animation Test:</span>
                <button 
                  onClick={() => {
                    sessionStorage.removeItem('vstudio_intro_played');
                    window.location.reload();
                  }} 
                  className="btn-primary-glow"
                  style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '8px' }}
                >
                  Clear Session & Play Full Intro
                </button>
              </div>
              <button onClick={() => navigateTo('landing')} className="btn-secondary mt-4">
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('plans.modal_title')}</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="btn-modal-close">×</button>
            </div>
            
            <div className="pricing-modal-grid">
              <div className="pricing-card popular">
                <div className="modal-popular-badge">{t('plans.popular')}</div>
                <span className="pricing-period">{t('plans.month.title')}</span>
                <span className="pricing-cost highlight">50K</span>
                <span className="pricing-curr">IDR</span>
                <ul className="pricing-features">
                  <li>{t('plans.features.unlimited')}</li>
                  <li>{t('plans.features.auto_upload')}</li>
                  <li>{t('plans.features.controls')}</li>
                  <li>{t('plans.features.support')}</li>
                </ul>
                <button 
                  onClick={() => handleSelectPlan('premium-month')} 
                  className="btn-modal-plan-select filled"
                >
                  {t('plans.month.cta_acquire')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Ticket Modal */}
      {showTicketModal && (
        <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content ticket-modal-width" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowTicketModal(false)} className="btn-modal-close">×</button>
            
            <div className="ticket-modal-inner">
              <span className="ticket-emoji">🎫</span>
              <h3>{t('plans.ticket_title')}</h3>
              <p>
                {t('plans.ticket_desc_1')}<strong>{selectedPlanName}</strong>{t('plans.ticket_desc_2')}
              </p>
              <a 
                href="https://discord.gg/mMPMyPGq6W" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-discord-ticket"
              >
                {t('plans.ticket_cta')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Claim Free Premium Modal */}
      {showClaimModal && (
        <div className="modal-overlay">
          <div className="claim-modal-content">
            {!claimSuccess ? (
              <>
                <div className="claim-gift-container">
                  <Gift className="claim-gift-icon" size={40} />
                </div>
                <h2 className="claim-modal-title">{t('claim_free_premium.title')}</h2>
                <p className="claim-modal-desc">{t('claim_free_premium.desc')}</p>
                <div className="claim-actions">
                  <button 
                    onClick={handleClaimFreePremium} 
                    className="btn-claim-premium"
                    disabled={claimingFreePremium}
                  >
                    {claimingFreePremium ? (
                      <RefreshCw className="spin" size={18} />
                    ) : (
                      t('claim_free_premium.btn_claim')
                    )}
                  </button>
                  <button 
                    onClick={() => setHasDismissedClaimModal(true)} 
                    className="btn-claim-close"
                    disabled={claimingFreePremium}
                  >
                    {t('claim_free_premium.btn_close')}
                  </button>
                </div>
                {claimError && <div className="claim-error-msg">{claimError}</div>}
              </>
            ) : (
              <>
                <div className="claim-success-icon-container">
                  <Check size={40} />
                </div>
                <h2 className="claim-modal-title">{t('claim_free_premium.success')}</h2>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
