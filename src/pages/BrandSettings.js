import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Reveal } from '../components/Motion';

const BRAND_CATEGORIES = [
  'Luxury', 'Premium', 'Contemporary', 'Fast Fashion',
  'Streetwear', 'Bridal', 'Kids', 'Sportswear', 'Modest Fashion', 'Other',
];
const CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'INR', 'BDT', 'TRY'];
const COUNTRIES = ['Pakistan', 'United States', 'United Kingdom', 'UAE', 'Saudi Arabia', 'India', 'Bangladesh', 'Turkey', 'Other'];

/* ── Section card wrapper ────────────────────────────────────── */
function SettingCard({ icon, title, subtitle, children, delay = 0 }) {
  return (
    <Reveal delay={delay} direction="none">
      <div style={{
        background: 'var(--bg-layer1)',
        border: '1px solid var(--border-faint)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      }}>
        {/* Card header stripe */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-faint)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'rgba(167,139,250,0.03)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>
            {icon}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.2,
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {/* Card body */}
        <div style={{ padding: '24px 28px' }}>
          {children}
        </div>
      </div>
    </Reveal>
  );
}

/* ── Field helpers ───────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function BrandSettings() {
  const { user, refreshUser } = useAuth();
  const defaultValues = {
    name: '', tagline: '', category: 'Contemporary',
    website: '', instagram: '', phone: '', address: '',
    city: '', country: 'Pakistan', currency: 'PKR', founded: '',
  };
  const { watch, setValue, reset, handleSubmit } = useForm({ defaultValues });
  const form = watch();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.brand) reset({ ...defaultValues, ...user.brand });
  }, [reset, user]);

  const set = (k, v) => setValue(k, v, { shouldDirty: true });

  const onSave = async (values) => {
    if (!values.name?.trim()) return toast.error('Brand name is required');
    setSaving(true);
    try {
      await api.put('/auth/brand', values);
      await refreshUser();
      toast.success('Brand settings saved ✓');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = handleSubmit(onSave);

  return (
    <div className="settings-page animate-vibe">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Brand Settings</h1>
              <p className="page-subtitle">Manage your brand identity, contact info, and preferences</p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <motion.button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
            </motion.button>
          </Reveal>
        </div>
      </div>

      <div className="page-body">

        {/* ── Brand identity strip at top ── */}
        <Reveal delay={0.05} direction="none">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '20px 24px', borderRadius: 14, marginBottom: 32,
            background: 'linear-gradient(135deg, var(--accent-soft) 0%, rgba(167,139,250,0.04) 100%)',
            border: '1px solid var(--accent-border)',
          }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem',
              color: 'white', boxShadow: '0 6px 18px var(--accent-glow)',
            }}>
              {form.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                {form.name || 'Your Brand Name'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {form.tagline || 'Add a brand tagline below'}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {form.category && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 99,
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    border: '1px solid var(--accent-border)',
                  }}>{form.category}</span>
                )}
                {form.currency && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 99,
                    background: 'rgba(52,211,153,0.08)', color: '#34D399',
                    border: '1px solid rgba(52,211,153,0.2)',
                  }}>{form.currency}</span>
                )}
                {form.country && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-faint)',
                    border: '1px solid var(--border-faint)',
                  }}>{form.country}</span>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Two-column layout ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
        }}>

          {/* Card 1: Identity */}
          <SettingCard icon="🏷️" title="Brand Identity" subtitle="Name, tagline, and market positioning" delay={0.1}>
            <Field label="Brand Name *">
              <input
                className="form-input"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Ayesha Atelier"
              />
            </Field>
            <Field label="Tagline">
              <input
                className="form-input"
                value={form.tagline}
                onChange={e => set('tagline', e.target.value)}
                placeholder="e.g. Elegance in every stitch"
              />
            </Field>
            <div className="form-grid-2">
              <Field label="Category">
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {BRAND_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Founded">
                <input
                  className="form-input"
                  type="number"
                  value={form.founded}
                  onChange={e => set('founded', e.target.value)}
                  placeholder="2022"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </Field>
            </div>
          </SettingCard>

          {/* Card 2: Digital Presence */}
          <SettingCard icon="🌐" title="Digital Presence" subtitle="Online channels and contact details" delay={0.15}>
            <Field label="Website">
              <input
                className="form-input"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="https://yourbrand.com"
                type="url"
              />
            </Field>
            <Field label="Instagram">
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-faint)', fontSize: '0.85rem', pointerEvents: 'none',
                }}>@</span>
                <input
                  className="form-input"
                  style={{ paddingLeft: 30 }}
                  value={form.instagram.replace('@', '')}
                  onChange={e => set('instagram', e.target.value)}
                  placeholder="yourbrand"
                />
              </div>
            </Field>
            <Field label="Business Phone">
              <input
                className="form-input"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+92 300 1234567"
                type="tel"
              />
            </Field>
          </SettingCard>

          {/* Card 3: Location */}
          <SettingCard icon="📍" title="Location" subtitle="Studio address and geographic base" delay={0.2}>
            <div className="form-grid-2">
              <Field label="Country">
                <select className="form-select" value={form.country} onChange={e => set('country', e.target.value)}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="City">
                <input
                  className="form-input"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="Lahore"
                />
              </Field>
            </div>
            <Field label="Studio / Office Address">
              <textarea
                className="form-textarea"
                value={form.address}
                onChange={e => set('address', e.target.value)}
                rows={3}
                placeholder="Street, Area, City"
              />
            </Field>
          </SettingCard>

          {/* Card 4: Preferences */}
          <SettingCard icon="⚙️" title="Preferences" subtitle="Currency and regional settings" delay={0.25}>
            <Field
              label="Default Currency"
              hint="Used across all financial reporting, orders, and analytics."
            >
              <select className="form-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            {/* Currency preview */}
            <div style={{
              marginTop: 8, padding: '12px 16px', borderRadius: 10,
              background: 'var(--bg-layer2)', border: '1px solid var(--border-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600 }}>
                PREVIEW
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                {form.currency} 1,000
              </span>
            </div>
          </SettingCard>

        </div>

        {/* ── Save button at bottom ── */}
        <Reveal delay={0.3} direction="none">
          <div style={{
            marginTop: 32, paddingTop: 24,
            borderTop: '1px solid var(--border-faint)',
            display: 'flex', justifyContent: 'flex-end', gap: 12,
          }}>
            <button
              className="btn btn-ghost"
              onClick={() => { if (user?.brand) setForm(f => ({ ...f, ...user.brand })); }}
            >
              Discard Changes
            </button>
            <motion.button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{ minWidth: 140 }}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
            </motion.button>
          </div>
        </Reveal>

      </div>
    </div>
  );
}