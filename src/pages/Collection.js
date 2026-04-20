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
    } catch {
      setLoadError('Unable to load collections right now.');
      toast.error('Failed to load collections');
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
    try { await api.delete(`/collections/${id}`); toast.success('Collection deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="collections-page animate-vibe">
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Collections</h1>
              <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>{total} premium seasonal & themed launches</p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <MagneticButton className="btn" onClick={openAdd} style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }}>+ New Collection</MagneticButton>
          </Reveal>
        </div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="table-toolbar" style={{ marginBottom: 32 }}>
          <div className="filter-group">
            <div className="search-input-wrapper glass" style={{ border: '1px solid var(--accent-soft)' }}>
              <span className="search-icon" style={{ color: 'var(--accent)' }}>⌕</span>
              <input className="form-input search-input" style={{ background: 'transparent', border: 'none' }} placeholder="Search elite collections…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            </div>
            <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Collection grid */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : loadError ? (
          <QueryErrorState message={loadError} onRetry={fetchData} />
        ) : collections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ color: 'var(--accent)' }}>◫</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>No collections found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Curate your first seasonal or themed luxury collection</p>
            <button className="btn" style={{ background: 'var(--accent)', color: 'white', marginTop: 24 }} onClick={openAdd}>+ Start Collection</button>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map((c, idx) => {
              const statusColors = {
                Planning: 'var(--accent-soft)',
                Production: 'rgba(251, 191, 36, 0.12)',
                Ready: 'rgba(52, 211, 153, 0.12)',
                Launched: 'var(--accent)',
                Archived: 'rgba(255, 255, 255, 0.05)',
              };
              const statusText = {
                Planning: 'var(--accent)',
                Production: '#FBBF24',
                Ready: '#34D399',
                Launched: 'white',
                Archived: 'var(--text-muted)',
              };
              
              return (
                <motion.div key={c._id} className="collection-card glass hover-glow"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  style={{ border: '1px solid var(--accent-soft)', padding: '24px' }}
                >
                  <div className="card-top" style={{ marginBottom: 20 }}>
                    <div>
                      <div className="id-badge" style={{ color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700 }}>{c.collectionId}</div>
                      <h3 className="collection-name" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>{c.name}</h3>
                    </div>
                    <span className="badge" style={{ background: statusColors[c.status], color: statusText[c.status], fontSize: '0.65rem', padding: '4px 10px', borderRadius: '4px' }}>{c.status}</span>
                  </div>

                  {c.description && <p className="collection-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, flex: 1 }}>{c.description}</p>}

                  <div className="badge-group" style={{ gap: 8, marginBottom: 24 }}>
                    {c.season && <span className="badge glass" style={{ border: '1px solid var(--accent-soft)', color: 'var(--accent)' }}>{c.season}</span>}
                    {c.theme && <span className="badge glass" style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'var(--text-faint)' }}>{c.theme}</span>}
                  </div>

                  <div className="card-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 16 }}>
                    <div className="footer-meta" style={{ opacity: 0.5, fontSize: '0.75rem' }}>
                      {c.productCount > 0 && <span>{c.productCount} Pieces</span>}
                      {c.launchDate && <span>🗓 {new Date(c.launchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>}
                    </div>
                    <div className="footer-actions" style={{ gap: 8 }}>
                      <button className="btn-icon-sm" onClick={() => openEdit(c)} style={{ color: 'var(--accent)' }}>✎</button>
                      <button className="btn-icon-sm" onClick={() => handleDelete(c._id)} style={{ color: '#F87171' }}>✕</button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass animate-vibe" style={{ border: '1px solid var(--accent-border)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{editing ? 'Edit Collection' : 'New Collection'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Collection Name *</label>
                  <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Festive Luxe 2025" />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Season</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.season} onChange={e => set('season', e.target.value)}>
                      {SEASONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} type="number" value={form.year} onChange={e => set('year', e.target.value)} min="2020" max="2030" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Launch Date</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} type="date" value={form.launchDate} onChange={e => set('launchDate', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.theme} onChange={e => set('theme', e.target.value)} placeholder="Midnight Garden…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea glass" style={{ border: '1px solid var(--accent-soft)' }} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe this collection…" />
                </div>
                <div className="form-actions" style={{ marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary glass" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn" style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Collection' : 'Create Collection'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}