import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const BRAND_CATEGORIES = ['Luxury', 'Premium', 'Contemporary', 'Fast Fashion', 'Streetwear', 'Bridal', 'Kids', 'Sportswear', 'Modest Fashion', 'Other'];
const CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'INR', 'BDT', 'TRY'];
const COUNTRIES = ['Pakistan', 'United States', 'United Kingdom', 'United Arab Emirates', 'Saudi Arabia', 'India', 'Bangladesh', 'Turkey', 'Other'];

const STEPS = [
  { id: 1, title: 'Brand Identity', desc: 'Tell us your brand name and positioning' },
  { id: 2, title: 'Contact & Market', desc: 'Where you operate and how to reach you' },
  { id: 3, title: 'Preferences', desc: 'Currency and customization' },
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

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Brand name is required');
    setSaving(true);
    try {
      await api.put('/auth/brand', { ...form, complete: true });
      await refreshUser();
      toast.success(`Welcome, ${form.name}! Let's get started.`);
      navigate('/drive-setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save brand info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,180,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,180,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      {/* Glow */}
      <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:300, background:'radial-gradient(ellipse, rgba(0,212,180,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:580, position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--teal-soft)', border:'1px solid var(--border-bright)', borderRadius:999, padding:'4px 14px', marginBottom:18 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--teal)', boxShadow:'0 0 6px var(--teal)', display:'inline-block' }} />
            <span style={{ fontSize:'0.62rem', color:'var(--teal)', letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:600 }}>Brand Setup</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'3.2rem', color:'var(--text-primary)', letterSpacing:'0.08em', textTransform:'uppercase', lineHeight:1, marginBottom:10 }}>
            Setup Your Brand
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.84rem', lineHeight:1.6 }}>
            This platform adapts to your brand. Tell us who you are.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:6, marginBottom:28, justifyContent:'center' }}>
          {STEPS.map(s => (
            <div key={s.id} style={{
              flex: 1, height: 3,
              borderRadius: 3,
              background: s.id <= step ? 'var(--teal)' : 'var(--border-mid)',
              transition: 'background 0.3s ease',
              maxWidth: 120,
            }} />
          ))}
        </div>
        <p style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:24 }}>
          Step {step} of {STEPS.length} — <span style={{ color:'var(--teal)' }}>{STEPS[step-1].title}</span>
        </p>

        {/* Card */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-mid)', borderRadius:'var(--radius-xl)', padding:32, boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>

          {step === 1 && (
            <div>
              <div className="form-group full-width" style={{ marginBottom:16 }}>
                <label className="form-label">Brand Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Zara, FashionNova, ÉLAN…"
                  style={{ fontSize:'1rem', padding:'12px 14px' }}
                  autoFocus
                />
                <span className="form-hint">This will appear throughout your dashboard</span>
              </div>
              <div className="form-group full-width" style={{ marginBottom:16 }}>
                <label className="form-label">Brand Tagline</label>
                <input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Crafted for the modern woman" />
              </div>
              <div className="form-group">
                <label className="form-label">Brand Category *</label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {BRAND_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginTop:16 }}>
                <label className="form-label">Year Founded</label>
                <input className="form-input" value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="e.g. 2020" type="number" min="1900" max="2026" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Country</label>
                <select className="form-select" value={form.country} onChange={e => set('country', e.target.value)}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Lahore, Dubai, London" />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Business Address</label>
                <textarea className="form-textarea" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address…" rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone / WhatsApp</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 0000000" />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourbrand.com" />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Instagram Handle</label>
                <input className="form-input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@yourbrand" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="form-group" style={{ marginBottom:16 }}>
                <label className="form-label">Primary Currency *</label>
                <select className="form-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <span className="form-hint">All financial records will use this currency</span>
              </div>
              <div style={{ background:'var(--teal-soft)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius)', padding:'18px 20px', marginTop:20 }}>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'1rem', color:'var(--teal)', marginBottom:8 }}>You're all set!</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
                  Your platform will be configured for <strong style={{ color:'var(--text-primary)' }}>{form.name || 'your brand'}</strong>.
                  After this you'll connect your Google Drive to enable live sync to Google Sheets.
                </div>
              </div>
              {/* Summary preview */}
              <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--border)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
                {[
                  ['Brand', form.name || '—'],
                  ['Category', form.category],
                  ['Country', form.country],
                  ['Currency', form.currency],
                ].map(([k,v]) => (
                  <div key={k} style={{ background:'var(--bg-raised)', padding:'10px 14px' }}>
                    <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600, marginBottom:3 }}>{k}</div>
                    <div style={{ fontSize:'0.84rem', color:'var(--text-primary)', fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:10, justifyContent:'space-between', marginTop:28, paddingTop:20, borderTop:'1px solid var(--border)' }}>
            {step > 1
              ? <button className="btn btn-secondary" onClick={() => setStep(s => s-1)}>Back</button>
              : <div />
            }
            {step < STEPS.length
              ? <button className="btn btn-primary" onClick={() => { if(step===1 && !form.name.trim()) return toast.error('Brand name is required'); setStep(s => s+1); }}>
                  Continue →
                </button>
              : <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ minWidth:140 }}>
                  {saving ? 'Setting up…' : 'Launch Dashboard →'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
