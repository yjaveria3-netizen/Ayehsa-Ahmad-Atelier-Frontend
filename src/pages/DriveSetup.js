import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '../components/Motion';

const STEPS = [
  {
    num: '01',
    title: 'Create a folder',
    desc: 'Make a dedicated "LibasTrack" folder in your Google Drive.',
    icon: '📁',
  },
  {
    num: '02',
    title: 'Set permissions',
    desc: 'Share the folder as "Anyone with the link" with Editor access.',
    icon: '🔑',
  },
  {
    num: '03',
    title: 'Paste the link',
    desc: 'Copy the folder URL and paste it in the form on the right.',
    icon: '🔗',
  },
];

const SHEET_ICONS = {
  products: '👗', orders: '📦', customers: '👥',
  financial: '💰', suppliers: '🧵', collections: '🗂️', returns: '↩️',
};

export default function DriveSetup() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ driveName: '', driveLink: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [sheets, setSheets] = useState(null);
  const [mode, setMode] = useState('new'); // 'new' or 'existing'
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    api.get('/drive/status').then(r => {
      if (r.data.connected) {
        setStatus(r.data);
        setSheets(r.data.spreadsheets);
      }
    }).catch(() => { });
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!form.driveLink.includes('drive.google.com')) {
      return toast.error('Please paste a valid Google Drive folder link');
    }
    setLoading(true);
    setImportResults(null);
    try {
      const endpoint = mode === 'new' ? '/drive/connect' : '/drive/connect-existing';
      const res = await api.post(endpoint, form);
      
      setSheets(res.data.spreadsheets);
      
      if (mode === 'existing') {
        setImportResults(res.data.importStats);
        toast.success(`Connected! Found existing data ✓`);
      } else {
        toast.success('Google Drive connected! Spreadsheets created ✓');
      }

      await refreshUser();
      
      if (mode === 'new') {
        setTimeout(() => navigate('/dashboard'), 1800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect. Check folder permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Google Drive? Your data in MongoDB will remain.')) return;
    try {
      await api.post('/drive/disconnect');
      await refreshUser();
      setStatus(null);
      setSheets(null);
      setImportResults(null);
      toast.success('Drive disconnected');
    } catch { toast.error('Failed to disconnect'); }
  };

  return (
    <div className="drive-setup-page animate-vibe">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Google Drive Sync</h1>
              <p className="page-subtitle">Connect your Drive to enable real-time spreadsheet sync</p>
            </div>
          </Reveal>
          {status?.connected && (
            <button className="btn btn-secondary" onClick={handleDisconnect} style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.3)' }}>
              Disconnect Drive
            </button>
          )}
        </div>
      </div>

      <div className="page-body">

        {/* ── CONNECTED STATE ── */}
        {status?.connected ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

            {/* Status card */}
            <Reveal delay={0.1}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(52,211,153,0.02) 100%)',
                border: '1px solid rgba(52,211,153,0.20)',
                borderRadius: 16, padding: '28px 28px 24px',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(52,211,153,0.12)',
                    border: '1px solid rgba(52,211,153,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', flexShrink: 0,
                  }}>
                    ☁️
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {status.driveName || 'Google Workspace'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#34D399', boxShadow: '0 0 8px #34D399',
                        display: 'inline-block', animation: 'pulse 2s infinite',
                      }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34D399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Live Sync Active
                      </span>
                    </div>
                  </div>
                </div>

                {importResults && (
                  <div style={{ marginBottom: 24, padding: 12, background: 'rgba(167,139,250,0.05)', borderRadius: 12, border: '1px solid var(--accent-border)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase' }}>Recent Import Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {Object.entries(importResults).map(([k, v]) => v > 0 && (
                        <div key={k} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{k}</span>: <strong>{v}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spreadsheet links */}
                <div>
                  <div style={{
                    fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-faint)',
                    letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12,
                  }}>
                    Synced Spreadsheets
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sheets && Object.entries(sheets).map(([name, url]) => url && (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                          background: 'var(--bg-layer2)',
                          border: '1px solid var(--border-faint)',
                          transition: 'all 0.15s ease',
                          color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--accent-border)';
                          e.currentTarget.style.color = 'var(--accent)';
                          e.currentTarget.style.transform = 'translateX(3px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-faint)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>{SHEET_ICONS[name] || '📄'}</span>
                        <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>{name}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Reconnect / update form */}
            <Reveal delay={0.15}>
              <div style={{
                background: 'var(--bg-layer1)',
                border: '1px solid var(--border-faint)',
                borderRadius: 16, padding: '28px',
              }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                    Update Connection
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                    Switch to a different Drive folder or rename your workspace.
                  </div>
                </div>
                <form onSubmit={handleConnect}>
                  <div className="form-group">
                    <label className="form-label">Workspace Name</label>
                    <input
                      className="form-input"
                      value={form.driveName}
                      onChange={e => setForm(p => ({ ...p, driveName: e.target.value }))}
                      placeholder="e.g. Ayesha Atelier Drive"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Folder URL</label>
                    <input
                      className="form-input"
                      value={form.driveLink}
                      onChange={e => setForm(p => ({ ...p, driveLink: e.target.value }))}
                      placeholder="https://drive.google.com/drive/folders/…"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                    {loading ? 'Reconnecting…' : 'Update Connection'}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>

        ) : (

          /* ── NOT CONNECTED STATE ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>

            {/* Instructions card */}
            <Reveal delay={0.1}>
              <div style={{
                background: 'var(--bg-layer1)',
                border: '1px solid var(--border-faint)',
                borderRadius: 16, padding: '28px',
              }}>
                <div style={{
                  fontSize: '0.58rem', fontWeight: 800, color: 'var(--accent)',
                  letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20,
                }}>
                  Setup Guide
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {STEPS.map((step, i) => (
                    <div key={step.num} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                      {/* Connector line */}
                      {i < STEPS.length - 1 && (
                        <div style={{
                          position: 'absolute', left: 19, top: 44, bottom: -4,
                          width: 2, background: 'var(--border-faint)', zIndex: 0,
                        }} />
                      )}

                      {/* Step number */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)',
                        position: 'relative', zIndex: 1,
                      }}>
                        {step.num}
                      </div>

                      <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0, paddingTop: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What gets created */}
                <div style={{
                  marginTop: 24, padding: '14px 16px', borderRadius: 10,
                  background: 'var(--bg-layer2)', border: '1px solid var(--border-faint)',
                }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
                    Auto-created Spreadsheets
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(SHEET_ICONS).map(([name, icon]) => (
                      <span key={name} style={{
                        fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px',
                        borderRadius: 99, background: 'var(--bg-layer1)',
                        border: '1px solid var(--border-faint)',
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        {icon} {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Connect form */}
            <Reveal delay={0.15}>
              <div style={{
                background: 'var(--bg-layer1)',
                border: '1px solid var(--accent-border)',
                borderRadius: 16, padding: '28px',
                boxShadow: '0 8px 32px rgba(167,139,250,0.08)',
              }}>
                {/* Mode Toggle */}
                <div style={{ display: 'flex', background: 'var(--bg-layer2)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
                  <button 
                    onClick={() => setMode('new')}
                    style={{ 
                      flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                      background: mode === 'new' ? 'var(--accent)' : 'transparent',
                      color: mode === 'new' ? 'white' : 'var(--text-faint)',
                      cursor: 'pointer', transition: '0.2s'
                    }}
                  >
                    New Workspace
                  </button>
                  <button 
                    onClick={() => setMode('existing')}
                    style={{ 
                      flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                      background: mode === 'existing' ? 'var(--accent)' : 'transparent',
                      color: mode === 'existing' ? 'white' : 'var(--text-faint)',
                      cursor: 'pointer', transition: '0.2s'
                    }}
                  >
                    Connect Existing
                  </button>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, marginBottom: 16,
                    background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                  }}>
                    {mode === 'new' ? '☁️' : '📥'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>
                    {mode === 'new' ? 'Connect Google Drive' : 'Sync Existing Drive'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {mode === 'new' 
                      ? 'Paste your Drive folder link below. Spreadsheets will be created automatically.'
                      : 'Provide your existing LibasTrack folder link. We will fetch and import all data.'}
                  </div>
                </div>

                <form onSubmit={handleConnect}>
                  <div className="form-group">
                    <label className="form-label">Workspace Name</label>
                    <input
                      className="form-input"
                      value={form.driveName}
                      onChange={e => setForm(p => ({ ...p, driveName: e.target.value }))}
                      placeholder="e.g. My Atelier Drive"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Folder Link *</label>
                    <input
                      className="form-input"
                      value={form.driveLink}
                      onChange={e => setForm(p => ({ ...p, driveLink: e.target.value }))}
                      placeholder="https://drive.google.com/drive/folders/…"
                      required
                    />
                  </div>

                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 14px', borderRadius: 10, marginBottom: 16,
                          background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                          fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600,
                        }}
                      >
                        <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        {mode === 'new' ? 'Creating workspace…' : 'Fetching existing data…'}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 4, padding: '13px' }}
                    disabled={loading}
                  >
                    {loading ? 'Initializing…' : mode === 'new' ? '🔗 Connect & Create Sheets' : '📥 Connect & Sync Data'}
                  </button>
                </form>
              </div>
            </Reveal>

          </div>
        )}
      </div>
    </div>
  );
}