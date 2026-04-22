import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = { CHOOSE: 'choose', LOCAL_PATH: 'local_path', SETTING_UP: 'setting_up', DONE: 'done' };

const SETUP_MESSAGES = {
  local: [
    'Preparing your local workspace…',
    'Initialising LibasTrack directory…',
    'Crafting branded Excel workbooks…',
    'Adding README and folder structure…',
    'Finalising environment…',
  ],
  cloud: [
    'Connecting to Google Drive…',
    'Verifying permissions…',
    'Setting up cloud workspace…',
  ],
};

export default function StorageSetup() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [chosen, setChosen] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [useDefaultPath, setUseDefaultPath] = useState(true);

  const animateProgress = async (messages, targetPct) => {
    const stepSize = targetPct / messages.length;
    for (let i = 0; i < messages.length; i++) {
      setProgressMsg(messages[i]);
      setProgress(Math.round(stepSize * (i + 1)));
      await new Promise(r => setTimeout(r, 550));
    }
  };

  const setupLocal = async (pathOverride) => {
    setChosen('local_excel');
    setStep(STEPS.SETTING_UP);
    try {
      await animateProgress(SETUP_MESSAGES.local.slice(0, 2), 40);
      const body = {};
      if (pathOverride && pathOverride.trim()) {
        body.customPath = pathOverride.trim();
      }
      const res = await api.post('/storage/setup-local', body);
      await animateProgress(SETUP_MESSAGES.local.slice(2), 100);
      setFolderPath(res.data.folderPath);
      await refreshUser();
      setTimeout(() => setStep(STEPS.DONE), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed. Please try again.');
      setStep(STEPS.LOCAL_PATH);
    }
  };

  const setupGoogle = async () => {
    setChosen('google_drive');
    try {
      await api.post('/storage/switch', { storageType: 'google_drive' });
      await refreshUser();
      navigate('/drive-setup');
    } catch {
      toast.error('Connection failed. Please try again.');
    }
  };

  const handleLocalChoice = () => {
    setChosen('local_excel');
    setStep(STEPS.LOCAL_PATH);
  };

  const handleLocalConfirm = (e) => {
    e.preventDefault();
    const pathToUse = useDefaultPath ? '' : customPath;
    setupLocal(pathToUse);
  };

  return (
    <div className="onboarding-page app-shell-full">
      <div className="vibe-noise" />
      <div className="vibe-grid" />
      <div className="ornament storage-setup-bg">FLOW</div>

      <AnimatePresence mode="wait">

        {/* Step 1: Choose */}
        {step === STEPS.CHOOSE && (
          <motion.div
            key="choose"
            className="storage-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="storage-step-indicator">
              <div className="ssi-step ssi-done">
                <span className="ssi-num">✓</span>
                <span className="ssi-label">Sign In</span>
              </div>
              <div className="ssi-line ssi-line-done" />
              <div className="ssi-step ssi-done">
                <span className="ssi-num">✓</span>
                <span className="ssi-label">Brand</span>
              </div>
              <div className="ssi-line ssi-line-active" />
              <div className="ssi-step ssi-active">
                <span className="ssi-num">3</span>
                <span className="ssi-label">Storage</span>
              </div>
              <div className="ssi-line" />
              <div className="ssi-step">
                <span className="ssi-num">4</span>
                <span className="ssi-label">Dashboard</span>
              </div>
            </div>

            <header className="onboarding-header" style={{ marginTop: 32 }}>
              <div className="brand-icon-lg glass-rose">🗂️</div>
              <h1 className="hero-display">Select Workspace</h1>
              <p className="hero-sub">Where would you like LibasTrack to store your brand data?</p>
            </header>

            <div className="storage-cards-grid">
              {/* Local Excel */}
              <motion.div
                className="storage-option-card card glass hover-lift"
                onClick={handleLocalChoice}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleLocalChoice()}
              >
                <div className="option-icon">📁</div>
                <h3 className="option-title">Local Excel</h3>
                <p className="option-desc">Files saved directly on your PC. Works offline, lightning fast, 100% private.</p>
                <div className="option-features">
                  <span>📊 Standard Excel Format</span>
                  <span>📂 Choose your folder</span>
                  <span>🔒 No Internet Required</span>
                </div>
                <div className="option-footer">
                  <span className="mode-label">Local-First</span>
                  <span className="arrow">→</span>
                </div>
              </motion.div>

              {/* Google Drive */}
              <motion.div
                className="storage-option-card card glass hover-lift"
                onClick={setupGoogle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setupGoogle()}
              >
                <div className="option-icon">☁️</div>
                <h3 className="option-title">Cloud Sync</h3>
                <p className="option-desc">Live sync to Google Sheets. Access your atelier from any device, anywhere.</p>
                <div className="option-features">
                  <span>📋 Real-time Google Sheets</span>
                  <span>🌍 Multi-device Access</span>
                  <span>👥 Team Collaboration</span>
                </div>
                <div className="option-footer">
                  <span className="mode-label">Cloud-Hybrid</span>
                  <span className="arrow">→</span>
                </div>
              </motion.div>
            </div>

            <p className="onboarding-footnote">You can mirror your local data to Google Drive later in settings.</p>
          </motion.div>
        )}

        {/* Step 1.5: Local Path Selection */}
        {step === STEPS.LOCAL_PATH && (
          <motion.div
            key="local-path"
            className="storage-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="storage-step-indicator">
              <div className="ssi-step ssi-done"><span className="ssi-num">✓</span><span className="ssi-label">Sign In</span></div>
              <div className="ssi-line ssi-line-done" />
              <div className="ssi-step ssi-done"><span className="ssi-num">✓</span><span className="ssi-label">Brand</span></div>
              <div className="ssi-line ssi-line-active" />
              <div className="ssi-step ssi-active"><span className="ssi-num">3</span><span className="ssi-label">Storage</span></div>
              <div className="ssi-line" />
              <div className="ssi-step"><span className="ssi-num">4</span><span className="ssi-label">Dashboard</span></div>
            </div>

            <header className="onboarding-header" style={{ marginTop: 32 }}>
              <div className="brand-icon-lg glass-rose">📂</div>
              <h1 className="hero-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Choose Folder Location</h1>
              <p className="hero-sub">Select where LibasTrack will save your Excel files on this PC.</p>
            </header>

            <div className="card glass" style={{ maxWidth: 560, width: '100%', padding: '36px 40px' }}>
              <form onSubmit={handleLocalConfirm}>

                {/* Default path option */}
                <label
                  className={`path-option-card ${useDefaultPath ? 'path-option-selected' : ''}`}
                  onClick={() => setUseDefaultPath(true)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px',
                    border: `1px solid ${useDefaultPath ? 'var(--accent)' : 'var(--border-faint)'}`,
                    borderRadius: 12, cursor: 'pointer', marginBottom: 12,
                    background: useDefaultPath ? 'var(--accent-soft)' : 'var(--bg-layer2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    border: `2px solid ${useDefaultPath ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    background: useDefaultPath ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {useDefaultPath && <span style={{ color: 'white', fontSize: 11, fontWeight: 900 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                      Default Location
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
                      Documents\LibasTrack\[BrandName]\
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 5 }}>
                      Recommended — keeps everything organised in your Documents folder
                    </div>
                  </div>
                </label>

                {/* Custom path option */}
                <label
                  className={`path-option-card ${!useDefaultPath ? 'path-option-selected' : ''}`}
                  onClick={() => setUseDefaultPath(false)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px',
                    border: `1px solid ${!useDefaultPath ? 'var(--accent)' : 'var(--border-faint)'}`,
                    borderRadius: 12, cursor: 'pointer', marginBottom: 24,
                    background: !useDefaultPath ? 'var(--accent-soft)' : 'var(--bg-layer2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    border: `2px solid ${!useDefaultPath ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    background: !useDefaultPath ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!useDefaultPath && <span style={{ color: 'white', fontSize: 11, fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                      Custom Location
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: !useDefaultPath ? 12 : 0 }}>
                      Specify a full path, e.g. D:\MyBrand\Data or /Users/name/brand
                    </div>
                    {!useDefaultPath && (
                      <input
                        className="form-input"
                        value={customPath}
                        onChange={e => setCustomPath(e.target.value)}
                        placeholder="e.g. C:\Users\YourName\Desktop\MyBrand"
                        onClick={e => e.stopPropagation()}
                        style={{ marginTop: 4, fontFamily: 'monospace', fontSize: '0.82rem' }}
                        autoFocus
                      />
                    )}
                  </div>
                </label>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStep(STEPS.CHOOSE)}
                    style={{ flex: '0 0 auto' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={!useDefaultPath && !customPath.trim()}
                  >
                    Create Workspace →
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step 2: Setting Up */}
        {step === STEPS.SETTING_UP && (
          <motion.div
            key="setup"
            className="setup-progress-reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="setup-loader-wrap">
              <div className="setup-orbit-loader" />
              <div className="setup-loader-icon">{chosen === 'local_excel' ? '📁' : '☁️'}</div>
            </div>
            <h2 className="setup-title">{chosen === 'local_excel' ? 'Crafting Workspace…' : 'Connecting Cloud…'}</h2>
            <p className="setup-status">{progressMsg}</p>
            <div className="setup-progress-bar-wrap">
              <motion.div
                className="setup-progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <div className="setup-progress-val">{progress}%</div>
          </motion.div>
        )}

        {/* Step 3: Done */}
        {step === STEPS.DONE && (
          <motion.div
            key="done"
            className="setup-complete-card card glass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="complete-icon"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >✅</motion.div>
            <h2 className="display-italic">Workspace Ready</h2>
            <p className="text-muted" style={{ color: 'var(--text-muted)', marginTop: 12 }}>
              LibasTrack has initialised your environment. All records will be tracked in real-time.
            </p>
            {folderPath && (
              <div className="folder-reveal-box">
                <span className="label">WORKSPACE PATH</span>
                <span className="path">{folderPath}</span>
              </div>
            )}
            <motion.button
              className="btn btn-primary lg"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ marginTop: 8, background: 'var(--accent)' }}
            >
              Launch Dashboard →
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}