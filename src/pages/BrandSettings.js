import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const BRAND_CATEGORIES = ['Luxury', 'Premium', 'Contemporary', 'Fast Fashion', 'Streetwear', 'Bridal', 'Kids', 'Sportswear', 'Modest Fashion', 'Other'];
const CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'INR', 'BDT', 'TRY'];
const COUNTRIES = ['Pakistan', 'United States', 'United Kingdom', 'United Arab Emirates', 'Saudi Arabia', 'India', 'Bangladesh', 'Turkey', 'Other'];

export default function BrandSettings() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: '', tagline: '', category: 'Contemporary',
    website: '', instagram: '', phone: '', address: '', city: '', country: 'Pakistan',
    currency: 'PKR', founded: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.brand) {
      setForm(f => ({ ...f, ...user.brand }));
    }
  }, [user]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Brand name is required');
    setSaving(true);
    try {
      await api.put('/auth/brand', form);
      await refreshUser();
      toast.success('Brand settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Brand Settings</h1>
            <p className="page-subtitle">Update your brand profile and preferences</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

          {/* Identity */}
          <div className="card">
            <div className="card-title">Brand Identity</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Brand Name *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Your brand's tagline" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {BRAND_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Founded</label>
                <input className="form-input" type="number" value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="Year" min="1900" max="2026" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <div className="card-title">Contact & Location</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Country</label>
                <select className="form-select" value={form.country} onChange={e => set('country', e.target.value)}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone / WhatsApp</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address} onChange={e => set('address', e.target.value)} rows={2} />
              </div>
            </div>
          </div>

          {/* Digital */}
          <div className="card">
            <div className="card-title">Digital Presence</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourbrand.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@handle" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card">
            <div className="card-title">Preferences</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <span className="form-hint">All financial records use this currency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
