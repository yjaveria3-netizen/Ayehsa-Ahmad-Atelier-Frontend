import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function DriveSetup() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ driveName: 'Ayesha Ahmad Atelier', driveLink: '' });
  const [loading, setLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState(null);

  useEffect(() => {
    api.get('/drive/status').then(r => setDriveStatus(r.data));
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!form.driveLink) return toast.error('Please enter your Google Drive folder link');
    setLoading(true);
    try {
      const res = await api.post('/drive/connect', form);
      toast.success(res.data.message);
      await refreshUser();
      setDriveStatus({ connected: true, ...res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect drive');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { num: 1, title: 'Sign in with Gmail', desc: 'You already did this ✓', done: true },
    { num: 2, title: 'Connect your Drive', desc: 'Paste your Google Drive folder link below', done: driveStatus?.connected },
    { num: 3, title: 'Start managing data', desc: 'All entries sync live to Google Sheets', done: false },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Google Drive Setup</h1>
        <p className="page-subtitle">Connect your drive once — all data syncs automatically to your Google Sheets</p>
      </div>

      <div className="page-body">
        {/* Steps */}
        <div style={{ display:'flex', gap:16, marginBottom:32, flexWrap:'wrap' }}>
          {STEPS.map(step => (
            <div key={step.num} style={{
              flex:1, minWidth:180,
              background: step.done ? 'rgba(90,158,122,0.08)' : 'var(--bg-card)',
              border: `1px solid ${step.done ? 'rgba(90,158,122,0.25)' : 'var(--border)'}`,
              borderRadius:'var(--radius-lg)',
              padding:'20px',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background: step.done ? 'var(--success)' : 'var(--bg-hover)',
                  border: `1.5px solid ${step.done ? 'var(--success)' : 'var(--border-light)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.75rem', fontWeight:600,
                  color: step.done ? 'white' : 'var(--text-muted)',
                }}>
                  {step.done ? '✓' : step.num}
                </div>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color: step.done ? 'var(--success)' : 'var(--text-primary)' }}>
                  {step.title}
                </span>
              </div>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', paddingLeft:38 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
          {/* Form */}
          <div className="card">
            <h3 className="card-title">Connect Your Google Drive</h3>

            {driveStatus?.connected ? (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', background:'rgba(90,158,122,0.08)', border:'1px solid rgba(90,158,122,0.2)', borderRadius:'var(--radius)', marginBottom:20 }}>
                  <span style={{ fontSize:'1.25rem' }}>✓</span>
                  <div>
                    <div style={{ fontSize:'0.875rem', color:'var(--success)', fontWeight:500 }}>Drive Connected!</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{driveStatus.driveName}</div>
                  </div>
                </div>

                {driveStatus.spreadsheets && (
                  <div>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.1em' }}>Your Google Sheets</p>
                    <div className="sheet-links">
                      {Object.entries(driveStatus.spreadsheets).map(([key, url]) => url && (
                        <a key={key} href={url} target="_blank" rel="noreferrer" className="sheet-link">
                          ⊞ {key.charAt(0).toUpperCase() + key.slice(1)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <button className="btn btn-secondary" style={{ marginTop:20 }} onClick={() => navigate('/dashboard')}>
                  Go to Dashboard →
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnect}>
                <div className="form-grid" style={{ gridTemplateColumns:'1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Drive / Folder Name</label>
                    <input
                      className="form-input"
                      value={form.driveName}
                      onChange={e => setForm(p => ({ ...p, driveName: e.target.value }))}
                      placeholder="e.g. Ayesha Ahmad Atelier"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Google Drive Folder Link</label>
                    <input
                      className="form-input"
                      value={form.driveLink}
                      onChange={e => setForm(p => ({ ...p, driveLink: e.target.value }))}
                      placeholder="https://drive.google.com/drive/folders/..."
                      required
                    />
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      Open your Google Drive folder → right-click → "Get link" → paste here
                    </span>
                  </div>
                </div>
                <div className="form-actions" style={{ justifyContent:'flex-start' }}>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? '⟳ Connecting…' : '⊞ Connect Drive & Create Sheets'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Instructions */}
          <div className="card">
            <h3 className="card-title">How to get your Drive link</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { n:1, text:'Open Google Drive at drive.google.com' },
                { n:2, text:'Navigate to your "Ayesha Ahmad Atelier" main folder' },
                { n:3, text:'Right-click the folder → select "Get link"' },
                { n:4, text:'Set sharing to "Anyone with the link" → copy it' },
                { n:5, text:'Paste the link above and click Connect' },
              ].map(step => (
                <div key={step.n} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(201,169,110,0.15)', border:'1px solid rgba(201,169,110,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', color:'var(--gold)', flexShrink:0, marginTop:1 }}>
                    {step.n}
                  </div>
                  <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{step.text}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop:20, padding:'14px', background:'rgba(201,169,110,0.05)', border:'1px solid rgba(201,169,110,0.1)', borderRadius:'var(--radius)' }}>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', lineHeight:1.6 }}>
                <span style={{ color:'var(--gold)' }}>✦ </span>
                We'll automatically find your <strong style={{ color:'var(--text-secondary)' }}>Database</strong> subfolder and create/connect spreadsheets for Products, Orders, Customers, and Financial data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
