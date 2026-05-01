import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, MagneticButton } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState } from '../components/QueryState';

const STATUSES = ['Planning', 'Production', 'Ready', 'Launched', 'Archived'];
const SEASONS = ['SS24', 'AW24', 'SS25', 'AW25', 'SS26', 'AW26', 'Year-Round', 'Limited Edition', 'Custom'];
const EMPTY = {
  name: '', description: '', season: 'Year-Round',
  year: new Date().getFullYear(), theme: '',
  status: 'Planning', launchDate: '', notes: '',
};

const STATUS_CLASSES = {
  Planning: 'status-sky', Production: 'status-amber', Ready: 'status-emerald',
  Launched: 'status-rose', Archived: 'status-slate',
};

export default function Collection() {
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/collections?${params}`);
      setCollections(res.data.collections || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Fetch collections error:', err.message);
      setLoadError('Unable to load collections right now.');
      toast.error(err.response?.data?.message || 'Failed to load collections');
    }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...EMPTY, ...c, launchDate: c.launchDate ? c.launchDate.split('T')[0] : '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, year: form.year ? Number(form.year) : undefined };
      if (editing) { await api.put(`/collections/${editing._id}`, payload); toast.success('Collection updated!'); }
      else { await api.post('/collections', payload); toast.success('Collection created!'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await api.delete(`/collections/${id}`);
      toast.success('Collection deleted');
      fetchData();
    } catch (err) {
      console.error('Delete collection error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  return (
    <div className="collections-page animate-vibe">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Collections</h1>
              <p className="page-subtitle">{total} premium seasonal & themed launches</p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <button className="btn btn-primary" onClick={openAdd}>
              + New Collection
            </button>
          </Reveal>
        </div>
      </div>

      <div className="page-body">
        {/* ── Toolbar ── */}
        <div className="commerce-toolbar" style={{ marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ maxWidth: 380, flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search elite collections…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 200, padding: '10px 18px', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ── Collection Grid ── */}
        {loading ? (
          <div className="page-loader" style={{ height: '40vh' }}>
            <div className="spinner" />
          </div>
        ) : loadError ? (
          <QueryErrorState message={loadError} onRetry={fetchData} />
        ) : collections.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>◫</div>
            <h3>No collections found</h3>
            <p>Curate your first seasonal or themed luxury collection.</p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={openAdd}>
              + Start Collection
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {collections.map((c, idx) => (
              <motion.div
                key={c._id}
                className="card glass"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div className="id-chip" style={{ marginBottom: 8, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      {c.collectionId}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{c.name}</h3>
                  </div>
                  <span className={`badge badge-${c.status.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                    {c.status}
                  </span>
                </div>

                {c.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                  {c.season && (
                    <span className="id-chip" style={{ background: 'var(--bg-layer2)', color: 'var(--text-muted)' }}>
                      {c.season}
                    </span>
                  )}
                  {c.theme && (
                    <span className="id-chip" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-faint)' }}>
                      {c.theme}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, display: 'flex', gap: 12 }}>
                    {c.productCount > 0 && <span>{c.productCount} Pieces</span>}
                    {c.launchDate && <span>🗓 {new Date(c.launchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEdit(c)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: '1px solid var(--accent-border)',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.85rem',
                      }}
                    >✏️</motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(c._id)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: '1px solid rgba(248,113,113,0.2)',
                        background: 'rgba(248,113,113,0.05)', color: '#F87171',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.85rem',
                      }}
                    >🗑️</motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              className="modal glass"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              style={{ border: '1px solid var(--accent-border)', maxWidth: 520 }}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editing ? '✏️ Refine Collection' : '+ Curate Collection'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label className="form-label">Collection Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      required
                      placeholder="Festive Luxe 2025"
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Season</label>
                      <select className="form-select" value={form.season} onChange={e => set('season', e.target.value)}>
                        {SEASONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.year}
                        onChange={e => set('year', e.target.value)}
                        min="2020" max="2030"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Process Status</label>
                      <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Launch Identity Date</label>
                      <input
                        className="form-input"
                        type="date"
                        value={form.launchDate}
                        onChange={e => set('launchDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Aesthetic Theme</label>
                    <input
                      className="form-input"
                      value={form.theme}
                      onChange={e => set('theme', e.target.value)}
                      placeholder="Midnight Garden…"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Creative Vision</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Describe this collection's unique story…"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 28 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} disabled={saving}>
                      <span>{saving ? 'Syncing…' : editing ? 'Finalize Changes' : 'Launch Collection'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}