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
    <div className="onboarding-page app-shell-full animate-vibe">
      <div className="tm-noise" style={{ opacity: 0.05 }} />
      <div className="ornament brand-setup-bg" style={{ color: 'var(--accent)', opacity: 0.1, letterSpacing: '2rem' }}>SETUP</div>

      <div className="onboarding-container" style={{ position: 'relative', zIndex: 10 }}>

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
        <header className="onboarding-header" style={{ marginTop: 36 }}>
          <div className="status-pill glass" style={{ border: '1px solid var(--accent-soft)', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <span className="dot pulse" style={{ background: 'var(--accent)' }} />
            <span className="label" style={{ fontSize: '0.7rem', fontWeight: 800 }}>PHASE {step} / {STEPS.length}</span>
          </div>
          <h1 className="hero-display" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white' }}>Configure Identity</h1>
          <p className="hero-sub" style={{ color: 'var(--text-muted)' }}>LibasTrack adapts to your vision. Tell us who you are.</p>
        </header>

        {/* ── Form Card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="onboarding-card card glass"
            style={{ border: '1px solid var(--accent-soft)', padding: 40, width: '100%', maxWidth: 640 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >

            {step === 1 && (
              <div>
                <div className="form-group full-width">
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Brand Name *</label>
                  <input
                    className="form-input lg glass"
                    style={{ fontSize: '1.5rem', fontWeight: 700, border: 'none', borderBottom: '2px solid var(--accent-soft)', borderRadius: 0, background: 'transparent' }}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. ÉLAN"
                    autoFocus
                    id="brand-name-input"
                  />
                </div>
                <div className="form-group full-width" style={{ marginTop: 24 }}>
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Brand Mantra</label>
                  <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Crafted for the modern woman" />
                </div>
                <div className="form-grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.category} onChange={e => set('category', e.target.value)}>
                      {BRAND_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Founded</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="2024" type="number" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Country</label>
                  <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.country} onChange={e => set('country', e.target.value)}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>City</label>
                  <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lahore" />
                </div>
                <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Studio Address</label>
                  <textarea className="form-textarea glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Physical address..." rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Phone</label>
                  <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 3XX XXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Instagram</label>
                  <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@yourbrand" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Base Currency *</label>
                  <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <p className="form-hint" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 12 }}>All prices and financial data will utilise this currency.</p>
                </div>
                <div className="info-summary glass" style={{ marginTop: 32, padding: 24, border: '1px solid var(--accent-soft)', background: 'var(--accent-faint)' }}>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 800 }}>Confirm Identity</h4>
                  <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                    Welcome to LibasTrack, <strong>{form.name || 'Your Brand'}</strong>. We are ready to launch your management suite.
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
                  className="btn"
                  style={{ background: 'var(--accent)', color: 'white', fontWeight: 700, padding: '12px 28px' }}
                  onClick={handleNext}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  id={`onboarding-step${step}-next-btn`}
                >
                  Continue →
                </motion.button>
              ) : (
                <motion.button
                  className="btn"
                  style={{ background: 'var(--accent)', color: 'white', fontWeight: 700, padding: '12px 28px' }}
                  onClick={handleSubmit}
                  disabled={saving}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  id="onboarding-submit-btn"
                >
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="spinner" style={{ width: 16, height: 16 }} />
                      Configuring…
                    </span>
                  ) : 'Launch Dashboard →'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
