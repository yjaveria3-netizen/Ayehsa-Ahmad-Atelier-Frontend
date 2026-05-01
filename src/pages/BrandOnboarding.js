import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BRAND_CATEGORIES = ['Luxury', 'Premium', 'Contemporary', 'Fast Fashion', 'Streetwear', 'Bridal', 'Kids', 'Sportswear', 'Modest Fashion', 'Other'];
const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'];
const COUNTRIES = ['Pakistan', 'United States', 'United Kingdom', 'Australia', 'Canada', 'Other'];

const STEPS = [
  { id: 1, title: 'Brand Identity', desc: 'Name and positioning', icon: '🏷️' },
  { id: 2, title: 'Contact & Market', desc: 'Location and reach', icon: '📍' },
  { id: 3, title: 'Preferences', desc: 'Currency and finish', icon: '⚙️' },
];

export default function BrandOnboarding() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', tagline: '', category: 'Contemporary',
    website: '', instagram: '', phone: '',
    address: '', city: '', country: 'Pakistan',
    currency: 'PKR', founded: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleNext = () => {
    if (step === 1 && !form.name.trim()) return toast.error('Brand name is required');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Brand name is required');
    setSaving(true);
    try {
      await api.put('/auth/brand', { ...form, complete: true });
      await refreshUser();
      toast.success(`Welcome, ${form.name}! Let's get started.`);
      navigate('/storage-setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save brand info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="vibe-noise" />
      <div className="vibe-grid" />
      <div className="ornament brand-setup-bg">SETUP</div>

      <div className="onboarding-container">

        {/* ── Labeled Step Pills ── */}
        <div className="ob-stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`ob-step-pill ${s.id < step ? 'ob-done' : s.id === step ? 'ob-active' : ''}`}>
                <div className="ob-step-icon">
                  {s.id < step ? '✓' : s.icon}
                </div>
                <div className="ob-step-text">
                  <div className="ob-step-title">{s.title}</div>
                  <div className="ob-step-desc">{s.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`ob-step-connector ${s.id < step ? 'ob-connector-done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Header ── */}
        <header className="onboarding-header">
          <div className="status-pill glass">
            <span className="dot pulse" style={{ background: 'var(--accent)' }} />
            <span className="label" style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>PHASE {step} / {STEPS.length}</span>
          </div>
          <h1 className="hero-display">
            {step === 1 ? 'Configure Identity' : step === 2 ? 'Global Reach' : 'Final Preferences'}
          </h1>
          <p className="hero-sub">
            {step === 1 ? 'LibasTrack adapts to your vision. Tell us who you are.' : 
             step === 2 ? 'Connect your atelier to the world with location and contact details.' :
             'Almost there. Select your base currency and finalize your profile.'}
          </p>
        </header>

        {/* ── Form Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="onboarding-card card glass"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >

            {step === 1 && (
              <div className="animate-vibe">
                <div className="form-group full-width">
                  <label className="form-label">Brand Name *</label>
                  <input
                    className="form-input lg glass"
                    style={{ 
                      fontSize: '1.75rem', 
                      fontWeight: 800, 
                      border: 'none', 
                      borderBottom: '2px solid var(--accent-border)', 
                      borderRadius: 0, 
                      background: 'transparent',
                      padding: '10px 0',
                      color: 'var(--accent)'
                    }}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. ÉLAN"
                    autoFocus
                    id="brand-name-input"
                  />
                </div>
                <div className="form-group full-width" style={{ marginTop: 32 }}>
                  <label className="form-label">Brand Mantra</label>
                  <input className="form-input glass" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Crafted for the modern woman" />
                </div>
                <div className="form-grid-2" style={{ marginTop: 24 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select glass" value={form.category} onChange={e => set('category', e.target.value)}>
                      {BRAND_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Founded Year</label>
                    <input className="form-input glass" value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="2024" type="number" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-grid-2 animate-vibe">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select className="form-select glass" value={form.country} onChange={e => set('country', e.target.value)}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input glass" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lahore" />
                </div>
                <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Studio Address</label>
                  <textarea className="form-textarea glass" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Physical address..." rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Active Phone</label>
                  <input className="form-input glass" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 3XX XXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <input className="form-input glass" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@yourbrand" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-vibe">
                <div className="form-group">
                  <label className="form-label">Base Currency *</label>
                  <select className="form-select glass" value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <p className="form-hint" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 12 }}>
                    All financial records, orders, and pricing will utilize this currency for reporting.
                  </p>
                </div>
                <div className="info-summary glass" style={{ marginTop: 32, padding: 24, border: '1px solid var(--accent-border)', background: 'var(--accent-soft)', borderRadius: 16 }}>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 800 }}>Confirm Identity</h4>
                  <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Welcome to LibasTrack, <strong>{form.name || 'Your Brand'}</strong>. We are ready to launch your brand management suite. You can update these details later in settings.
                  </p>
                </div>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="onboarding-actions" style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {step > 1 ? (
                <button className="btn btn-secondary glass" onClick={() => setStep(s => s - 1)}>← Back</button>
              ) : <div />}

              {step < STEPS.length ? (
                <motion.button
                  className="btn btn-primary"
                  style={{ background: 'var(--accent)', color: 'white', padding: '12px 32px' }}
                  onClick={handleNext}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Continue →
                </motion.button>
              ) : (
                <motion.button
                  className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
                  style={{ background: 'var(--accent)', color: 'white', padding: '12px 32px' }}
                  onClick={handleSubmit}
                  disabled={saving}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  id="onboarding-submit-btn"
                >
                  <span>{saving ? 'Configuring…' : 'Launch Dashboard →'}</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
