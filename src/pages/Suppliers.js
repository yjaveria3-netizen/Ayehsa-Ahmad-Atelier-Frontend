import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, MagneticButton, GlowCard, ease } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const CATEGORIES = ['Fabric', 'Embroidery', 'Stitching', 'Packaging', 'Printing', 'Accessories', 'Wholesale', 'Other'];
const COUNTRIES = ['Pakistan', 'China', 'India', 'Bangladesh', 'Turkey', 'UAE', 'Other'];
const EMPTY = { name:'', contactPerson:'', email:'', phone:'', whatsapp:'', address:'', city:'', country:'Pakistan', category:'Fabric', materials:'', rating:'', leadTimeDays:'', minimumOrder:'', paymentTerms:'', notes:'' };

export default function Suppliers() {
  const { user, formatCurrency } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const [res, statsRes] = await Promise.all([
        api.get(`/suppliers?${params}`),
        api.get('/suppliers/stats/summary'),
      ]);
      setSuppliers(res.data.suppliers);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Fetch suppliers error:', err.message);
      setLoadError('Unable to load suppliers right now.');
      toast.error(err.response?.data?.message || 'Failed to load suppliers');
    }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ ...EMPTY, ...s, materials: Array.isArray(s.materials) ? s.materials.join(', ') : '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, materials: form.materials ? form.materials.split(',').map(m => m.trim()).filter(Boolean) : [], rating: form.rating ? Number(form.rating) : undefined, leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : undefined };
      if (editing) { await api.put(`/suppliers/${editing._id}`, payload); toast.success('Supplier updated!'); }
      else { await api.post('/suppliers', payload); toast.success('Supplier added!'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted');
      fetchData();
    } catch (err) {
      console.error('Delete supplier error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to delete supplier');
    }
  };

  const stars = (r) => r ? '★'.repeat(r) + '☆'.repeat(5 - r) : '—';

  return (
    <div className="suppliers-page animate-vibe">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Supply Chain</h1>
              <p className="page-subtitle">
                {total} vendors and production houses
                {user?.storageType === 'google_drive' && user?.driveConnected && (
                  <span style={{ marginLeft: 14, color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700 }}>
                    ● Vault Secured
                  </span>
                )}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <button className="btn btn-primary" onClick={openAdd}>
              + Add Vendor
            </button>
          </Reveal>
        </div>
      </div>

      <div className="page-body">

        {/* ── Stats Row ── */}
        {loading && !stats ? (
          <StatsLoadingGrid count={2} />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {[
                { label: 'Production Partners', value: stats.total || 0, color: 'var(--text-primary)' },
                { label: 'Active Flow', value: stats.active || 0, color: '#34D399' },
              ].map((s) => (
                <StaggerItem key={s.label}>
                  <GlowCard className="stat-card card glass">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color }}>
                      {s.value}
                    </div>
                  </GlowCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        )}

        {/* ── Toolbar ── */}
        <div className="commerce-toolbar" style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ maxWidth: 380, flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search vendor, specialty, city…"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 220, padding: '10px 18px', fontSize: '0.85rem' }}
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Specialties</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <Reveal delay={0.05}>
          <div className="table-container">
            {loading ? (
              <TableLoadingRows cols={9} rows={7} />
            ) : loadError ? (
              <QueryErrorState message={loadError} onRetry={fetchData} />
            ) : suppliers.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏭</div>
                <h3>No vendors found</h3>
                <p>Centralize your vendor management and production tracking here.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Vendor</th>
                    <th>Specialty</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Lead Time</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, idx) => (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.35 }}
                    >
                      <td>
                        <span className="id-chip">{s.supplierId}</span>
                      </td>
                      <td>
                        <div className="cell-primary" style={{ marginBottom: 2 }}>{s.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {s.contactPerson || 'Direct Line'}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px', borderRadius: 8,
                          background: 'var(--accent-soft)', color: 'var(--accent)',
                          fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase'
                        }}>
                          {s.category}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.phone || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{s.email || '—'}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {[s.city, s.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        {s.leadTimeDays ? `${s.leadTimeDays} days` : '—'}
                      </td>
                      <td>
                        <div style={{ color: '#FBBF24', letterSpacing: '1px', fontSize: '0.8rem' }}>
                          {stars(s.rating)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${s.isActive ? 'active' : 'archived'}`} style={{ fontSize: '0.6rem' }}>
                          {s.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(s)}
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
                            onClick={() => handleDelete(s._id)}
                            style={{
                              width: 32, height: 32, borderRadius: 8,
                              border: '1px solid rgba(201,122,109,0.2)',
                              background: 'rgba(201,122,109,0.05)', color: '#C97A6D',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: '0.85rem',
                            }}
                          >🗑️</motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="page-info">Page {page} of {totalPages}</span>
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
              </div>
            )}
          </div>
        </Reveal>
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
              style={{ border: '1px solid var(--accent-border)', maxWidth: 600 }}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editing ? '✏️ Optimize Partner' : '+ Onboard Partner'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <form onSubmit={handleSave}>

                  <div className="section-label">Identity Portfolio</div>
                  <div className="form-group">
                    <label className="form-label">Vendor Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      required
                      placeholder="e.g. Master Embroidery Ltd."
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Point of Contact</label>
                      <input className="form-input" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="Name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Specialty Category</label>
                      <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="vendor@email.com" />
                    </div>
                  </div>

                  <div className="section-label">Performance & Strategy</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Lead Time (Days)</label>
                      <input className="form-input" type="number" value={form.leadTimeDays} onChange={e => set('leadTimeDays', e.target.value)} placeholder="14" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Partner Rating (1-5)</label>
                      <input className="form-input" type="number" value={form.rating} onChange={e => set('rating', e.target.value)} min="1" max="5" placeholder="5" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Production Materials Provided</label>
                    <input className="form-input" value={form.materials} onChange={e => set('materials', e.target.value)} placeholder="Zari, Resham, Pure Silk... (comma separated)" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Internal Analysis / Notes</label>
                    <textarea className="form-textarea" rows="2" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Quality remarks, payment terms..." />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 28 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                      Discard
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Syncing…' : editing ? 'Finalize Changes' : 'Onboard Partner'}
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
