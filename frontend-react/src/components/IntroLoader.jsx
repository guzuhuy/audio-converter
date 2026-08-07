import React, { useState, useEffect, useRef } from 'react';

export const IntroLoader = ({ onFinish }) => {
  const [isBooted, setIsBooted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const audioInstance = useRef(null);

  // Set up audio on mount
  useEffect(() => {
    const audio = new Audio("https://sufficient-amber-2z1dbtgs.edgeone.dev/Futuristic%20HUD_UI%20Visuals%20Sound%20Design.mp3");
    audio.volume = 0.55;
    audio.loop = true;
    audioInstance.current = audio;

    return () => {
      // Fade out audio on component unmount
      let currentVol = audio.volume;
      const fadeTimer = setInterval(() => {
        if (currentVol > 0.05) {
          currentVol -= 0.05;
          audio.volume = currentVol;
        } else {
          clearInterval(fadeTimer);
          audio.pause();
        }
      }, 40);
    };
  }, []);

  // Animate progress bar from 0 to 100 once booted
  useEffect(() => {
    if (!isBooted) return;

    const duration = 4200; // 4.2 seconds for progress bar
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setShowWelcome(true);

          // Let the welcome message run for 2.2 seconds
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              onFinish();
            }, 600); // 600ms transition time
          }, 2200);

          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isBooted, onFinish]);

  // Determine which system logs to display based on progress percentage
  const getLogs = () => {
    const logs = [];
    if (progress >= 0) {
      logs.push({ text: '[SYS] INITIALIZING V STUDIO DIRECTIVES...', type: 'info' });
    }
    if (progress >= 25) {
      logs.push({ text: '[SYS] SECURING API COMMUNICATION LAYER...', type: 'info' });
    }
    if (progress >= 55) {
      logs.push({ text: '[SYS] CALIBRATING AUDIO WAVEFORM MODULES...', type: 'success' });
    }
    if (progress >= 85) {
      logs.push({ text: '[SYS] CLIENT READY. WELCOME AGENT.', type: 'ready' });
    }
    return logs;
  };

  const handleStartBoot = () => {
    setIsBooted(true);
    if (audioInstance.current) {
      audioInstance.current.play().catch((err) => {
        console.log("Audio playback failed:", err);
      });
    }
  };



  return (
    <div className={`intro-overlay ${isExiting ? 'exiting' : ''} ${showWelcome ? 'welcome-phase' : ''}`}>
      {/* Background aesthetics */}
      <div className="intro-bg-glow"></div>
      <div className="intro-grid-lines"></div>
      <div className="intro-scanner-line"></div>

      <div className="intro-container">
        {!isBooted ? (
          /* Sci-Fi Boot Initialization Screen */
          <div className="boot-initialization-screen">
            <div className="hud-wrapper pulse-boot-logo">
              <div className="hud-ring hud-ring-outer slow-spin"></div>
              <div className="hud-ring hud-ring-inner slow-spin-reverse"></div>
              <div className="hud-logo-container">
                <img 
                  src="https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png" 
                  alt="V Studio Logo" 
                  className="hud-logo-img" 
                />
              </div>
            </div>

            <div className="boot-title">
              V STUDIO // <span>CONVERTER</span>
            </div>
            
            <p className="boot-desc">
              AUTOMATIC ROBLOX AUDIO SERVICE
            </p>

            <button onClick={handleStartBoot} className="btn-boot-system">
              <span className="btn-boot-glow"></span>
              <span className="btn-boot-text">INITIALIZE SYSTEM</span>
            </button>
          </div>
        ) : (
          /* Loading & Welcome Screen */
          <>
            {/* Loading Phase elements */}
            <div className="intro-loading-elements">
              {/* Futuristic HUD circles surrounding the Logo */}
              <div className="hud-wrapper">
                <div className="hud-ring hud-ring-outer"></div>
                <div className="hud-ring hud-ring-inner"></div>
                <div className="hud-logo-container">
                  <img 
                    src="https://i.ibb.co/4ZffCQHF/file-0000000037307207800c1b0df4ef447d.png" 
                    alt="V Studio Logo" 
                    className="hud-logo-img" 
                  />
                </div>
              </div>

              {/* Audio Visualizer Equalizer Bars */}
              <div className="audio-visualizer-bars">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
                <div className="bar bar-4"></div>
                <div className="bar bar-5"></div>
                <div className="bar bar-6"></div>
                <div className="bar bar-7"></div>
                <div className="bar bar-8"></div>
              </div>

              <div className="intro-title">
                V STUDIO // <span>CONVERTER</span>
              </div>

              {/* Terminal logs showing boot sequences */}
              <div className="intro-terminal-box">
                <div className="intro-terminal-header">
                  <span className="terminal-dot red"></span>
                  <span className="terminal-dot yellow"></span>
                  <span className="terminal-dot green"></span>
                  <span className="terminal-title">System Console</span>
                </div>
                <div className="intro-terminal-content">
                  {getLogs().map((log, idx) => (
                    <div key={idx} className={`terminal-line ${log.type}`}>
                      <span className="terminal-prompt">&gt;</span> {log.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress block */}
              <div className="intro-progress-wrapper">
                <div className="progress-text-row">
                  <span className="progress-status-text">
                    {progress < 100 ? 'LOADING MODULES...' : 'SYSTEM BOOTED'}
                  </span>
                  <span className="progress-percentage-val">
                    {Math.min(100, Math.floor(progress)).toString().padStart(3, '0')}%
                  </span>
                </div>
                
                <div className="progress-track-outer">
                  <div 
                    className="progress-fill-inner" 
                    style={{ width: `${Math.min(100, progress)}%` }}
                  >
                    <div className="progress-glow-tip"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Phase elements (rendered after loading completes) */}
            <div className="intro-welcome-elements">
              <div className="welcome-icon-glow">
                <svg 
                  className="welcome-icon-svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              
              <div className="welcome-subtitle">
                ACCESS PROTOCOL SUCCESS
              </div>

              <div className="welcome-title-main">
                WELCOME TO V STUDIO
              </div>

              {/* Cool running marquee (Teks Berjalan) */}
              <div className="welcome-marquee-container">
                <div className="welcome-marquee-text">
                  <span>WELCOME TO PAK HUANG AUTOMATIC AUDIO CONVERTER</span> ⚡ PROSES SUPER CEPAT ⚡ FULL OTOMATIS & 100% AMAN ⚡ CONVERT MP3/YT KE ROBLOX AUDIO ⚡ UPLOAD INSTAN KE ROBLOX CREATOR ⚡ ENJOY THE SERVICE! ⚡
                </div>
              </div>

              <div className="welcome-status-info">
                INITIALIZING SECURE DASHBOARD...
              </div>
            </div>
          </>
        )}
      </div>


    </div>
  );
};
