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
  return (
    <div className="onboarding-page">
      <div className="vibe-noise" />
      <div className="vibe-grid" />
      <div className="ornament storage-setup-bg">FLOW</div>

      <div className="onboarding-container">
        
        {/* ── Stepper ── */}
        <div className="ob-stepper">
          <div className="ob-step-pill ob-done">
            <div className="ob-step-icon">✓</div>
            <div className="ob-step-text">
              <div className="ob-step-title">Identity</div>
              <div className="ob-step-desc">Brand name</div>
            </div>
          </div>
          <div className="ob-step-connector ob-connector-done" />
          <div className={`ob-step-pill ${step === STEPS.CHOOSE || step === STEPS.LOCAL_PATH ? 'ob-active' : 'ob-done'}`}>
            <div className="ob-step-icon">
              {step === STEPS.DONE ? '✓' : '3'}
            </div>
            <div className="ob-step-text">
              <div className="ob-step-title">Storage</div>
              <div className="ob-step-desc">Workspace type</div>
            </div>
          </div>
          <div className={`ob-step-connector ${step === STEPS.DONE ? 'ob-connector-done' : ''}`} />
          <div className={`ob-step-pill ${step === STEPS.DONE ? 'ob-active' : ''}`}>
            <div className="ob-step-icon">4</div>
            <div className="ob-step-text">
              <div className="ob-step-title">Dashboard</div>
              <div className="ob-step-desc">Ready to launch</div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1: Choose */}
          {step === STEPS.CHOOSE && (
            <motion.div
              key="choose"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="onboarding-header">
                <div className="status-pill glass">
                  <span className="dot pulse" style={{ background: 'var(--accent)' }} />
                  <span className="label" style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>PHASE 3 / 4</span>
                </div>
                <h1 className="hero-display">Select Workspace</h1>
                <p className="hero-sub">Where would you like LibasTrack to store your brand data?</p>
              </header>

              <div className="storage-cards-grid">
                {/* Local Excel */}
                <motion.div
                  className="storage-option-card card glass"
                  onClick={handleLocalChoice}
                  whileHover={{ scale: 1.02, borderColor: 'var(--accent-border)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="option-icon">📁</div>
                  <h3 className="option-title">Local Excel</h3>
                  <p className="option-desc">Files saved directly on your PC. Works offline, lightning fast, and 100% private.</p>
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
                  className="storage-option-card card glass"
                  onClick={setupGoogle}
                  whileHover={{ scale: 1.02, borderColor: 'var(--accent-border)' }}
                  whileTap={{ scale: 0.98 }}
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

              <p style={{ marginTop: 40, color: 'var(--text-faint)', fontSize: '0.8rem', textAlign: 'center' }}>
                Note: You can mirror your local data to Google Drive later in settings.
              </p>
            </motion.div>
          )}

          {/* Step 1.5: Local Path Selection */}
          {step === STEPS.LOCAL_PATH && (
            <motion.div
              key="local-path"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="onboarding-header">
                <div className="status-pill glass">
                  <span className="dot pulse" style={{ background: 'var(--accent)' }} />
                  <span className="label" style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>PHASE 3 / 4</span>
                </div>
                <h1 className="hero-display">Folder Location</h1>
                <p className="hero-sub">Select where LibasTrack will save your Excel files on this PC.</p>
              </header>

              <div className="onboarding-card card glass">
                <form onSubmit={handleLocalConfirm}>

                  {/* Default path option */}
                  <label
                    onClick={() => setUseDefaultPath(true)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 16, padding: '24px',
                      border: `1px solid ${useDefaultPath ? 'var(--accent-border)' : 'var(--border-faint)'}`,
                      borderRadius: 16, cursor: 'pointer', marginBottom: 16,
                      background: useDefaultPath ? 'var(--accent-soft)' : 'var(--bg-layer2)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `2px solid ${useDefaultPath ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      background: useDefaultPath ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {useDefaultPath && <span style={{ color: 'white', fontSize: 12, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                        Default Location
                      </div>
                      <code style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 8, display: 'inline-block', marginBottom: 8 }}>
                        Documents\LibasTrack\BrandName\
                      </code>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Recommended — keeps everything organized in your system's Documents folder.
                      </div>
                    </div>
                  </label>

                  {/* Custom path option */}
                  <label
                    onClick={() => setUseDefaultPath(false)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 16, padding: '24px',
                      border: `1px solid ${!useDefaultPath ? 'var(--accent-border)' : 'var(--border-faint)'}`,
                      borderRadius: 16, cursor: 'pointer', marginBottom: 32,
                      background: !useDefaultPath ? 'var(--accent-soft)' : 'var(--bg-layer2)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `2px solid ${!useDefaultPath ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      background: !useDefaultPath ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!useDefaultPath && <span style={{ color: 'white', fontSize: 12, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                        Custom Location
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: !useDefaultPath ? 16 : 0 }}>
                        Specify a full absolute path for your database files.
                      </div>
                      {!useDefaultPath && (
                        <input
                          className="form-input lg glass"
                          value={customPath}
                          onChange={e => setCustomPath(e.target.value)}
                          placeholder="e.g. D:\MyBrand\Data"
                          onClick={e => e.stopPropagation()}
                          style={{ marginTop: 4, fontFamily: 'monospace', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)' }}
                          autoFocus
                        />
                      )}
                    </div>
                  </label>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <button
                      type="button"
                      className="btn btn-secondary glass"
                      onClick={() => setStep(STEPS.CHOOSE)}
                      style={{ padding: '12px 24px' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '12px 24px', background: 'var(--accent)', color: 'white' }}
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
              className="onboarding-card card glass"
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="setup-loader-wrap" style={{ position: 'relative', width: 80, height: 80, marginBottom: 32 }}>
                <div className="spinner" style={{ width: '100%', height: '100%', border: '4px solid var(--accent-soft)', borderTopColor: 'var(--accent)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  {chosen === 'local_excel' ? '📁' : '☁️'}
                </div>
              </div>
              <h2 className="hero-display" style={{ fontSize: '2rem', marginBottom: 12 }}>{chosen === 'local_excel' ? 'Crafting Workspace…' : 'Connecting Cloud…'}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{progressMsg}</p>
              
              <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                <motion.div
                  style={{ height: '100%', background: 'var(--accent)', boxShadow: '0 0 15px var(--accent-glow)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em' }}>{progress}% COMPLETE</div>
            </motion.div>
          )}

          {/* Step 3: Done */}
          {step === STEPS.DONE && (
            <motion.div
              key="done"
              className="onboarding-card card glass"
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ fontSize: '4rem', marginBottom: 24 }}>✨</div>
              <h1 className="hero-display" style={{ fontSize: '2.5rem', marginBottom: 16 }}>Workspace Ready</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 32, maxWidth: 400 }}>
                LibasTrack has initialized your management environment. Your brand journey begins now.
              </p>
              
              {folderPath && (
                <div style={{ 
                  width: '100%', 
                  padding: '20px', 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid var(--border-faint)', 
                  borderRadius: 16, 
                  marginBottom: 32,
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 8 }}>WORKSPACE PATH</div>
                  <code style={{ fontSize: '0.85rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{folderPath}</code>
                </div>
              )}

              <motion.button
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{ background: 'var(--accent)', color: 'white', padding: '16px 48px', fontSize: '1.1rem', fontWeight: 700 }}
              >
                Launch Dashboard →
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}