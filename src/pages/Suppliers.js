import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, MagneticButton, GlowCard, ease } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const CATEGORIES = ['Fabric', 'Embroidery', 'Stitching', 'Packaging', 'Printing', 'Accessories', 'Wholesale', 'Other'];
const COUNTRIES = ['Pakistan', 'China', 'India', 'Bangladesh', 'Turkey', 'UAE', 'Other'];
const EMPTY = { name:'', contactPerson:'', email:'', phone:'', whatsapp:'', address:'', city:'', country:'Pakistan', category:'Fabric', materials:'', rating:'', leadTimeDays:'', minimumOrder:'', paymentTerms:'', notes:'' };

export default function Suppliers() {
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
    } catch {
      setLoadError('Unable to load suppliers right now.');
      toast.error('Failed to load suppliers');
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
    try { await api.delete(`/suppliers/${id}`); toast.success('Supplier deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const stars = (r) => r ? '★'.repeat(r) + '☆'.repeat(5 - r) : '—';

  return (
    <div className="suppliers-page animate-vibe">
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Supply Chain</h1>
              <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>{total} vendors and production houses</p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <MagneticButton className="btn" onClick={openAdd} style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }}>+ Add Vendor</MagneticButton>
          </Reveal>
        </div>
      </div>

      <div className="page-body">
        {loading && !stats ? (
          <StatsLoadingGrid count={2} />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid">
              <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Production Partners</div>
                <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>{stats.total}</div>
              </GlowCard></StaggerItem>
              <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Active Flow</div>
                <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#34D399' }}>{stats.active}</div>
              </GlowCard></StaggerItem>
            </div>
          </StaggerContainer>
        )}

        <div className="table-toolbar" style={{ marginTop: 32 }}>
          <div className="filter-group">
            <div className="search-input-wrapper glass" style={{ border: '1px solid var(--accent-soft)' }}>
              <span className="search-icon" style={{ color: 'var(--accent)' }}>⌕</span>
              <input className="form-input search-input" style={{ background: 'transparent', border: 'none' }} placeholder="Search Reference, Name, Specialty..." value={searchInput} onChange={e => { setSearchInput(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Production Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <Reveal delay={0.05}>
          <div className="card glass overflow-hidden" style={{ border: '1px solid var(--accent-soft)', marginTop: 24 }}>
            <div className="table-container">
              {loading ? (
                <TableLoadingRows cols={9} rows={6} />
              ) : loadError ? (
                <QueryErrorState message={loadError} onRetry={fetchData} />
              ) : suppliers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ color: 'var(--accent)' }}>⊞</div>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>No production partners found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Centralize your vendor management and production tracking here.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th>Reference</th><th>Vendor Name</th><th>Specialty</th><th>Connectivity</th><th>Territory</th><th>Turnaround</th><th>Reputation</th><th>Flow</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s, idx) => (
                      <motion.tr 
                        key={s._id} 
                        initial={{ opacity:0, y:8 }} 
                        animate={{ opacity:1, y:0 }} 
                        transition={{ delay: idx * 0.03, duration:0.4 }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      >
                        <td><span className="id-chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{s.supplierId}</span></td>
                        <td>
                          <div className="cell-primary" style={{ fontWeight: 700 }}>{s.name}</div>
                          <div className="text-xs" style={{ opacity: 0.5 }}>{s.contactPerson || 'Direct Line'}</div>
                        </td>
                        <td><span className="badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '0.6rem' }}>{s.category}</span></td>
                        <td>
                          <div className="text-sm" style={{ fontWeight: 600 }}>{s.phone || '—'}</div>
                          <div className="text-xs" style={{ opacity: 0.5, fontStyle: 'italic' }}>{s.email || 'No email attached'}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{[s.city, s.country].filter(Boolean).join(', ') || '—'}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.leadTimeDays ? `${s.leadTimeDays} days` : '—'}</td>
                        <td style={{ color: '#FBBF24', letterSpacing: '2px', fontSize: '0.65rem' }}>{stars(s.rating)}</td>
                        <td><span className={`badge badge-${s.isActive ? 'active' : 'archived'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{s.isActive ? 'Active' : 'Archived'}</span></td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon-sm" onClick={() => openEdit(s)} style={{ color: 'var(--accent)' }}>✎</button>
                            <button className="btn-icon-sm" onClick={() => handleDelete(s._id)} style={{ color: '#F87171' }}>✕</button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {totalPages > 1 && (
              <div className="pagination" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <span className="page-info">Page {page} / {totalPages}</span>
                <button className="page-btn glass" onClick={() => setPage(p => p-1)} disabled={page===1}>←</button>
                <button className="page-btn glass" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>→</button>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal glass md animate-vibe" style={{ border: '1px solid var(--accent-border)' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{editing ? 'Optimize Partner' : 'Onboard Production Partner'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="section-label" style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>Identity Portfolio</div>
                <div className="form-grid-2">
                  <div className="form-group full-width">
                    <label className="form-label">Vendor Name *</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Master Embroidery Ltd." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Point of Contact</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialty Category</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.category} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="section-label" style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>Performance & Strategy</div>
                <div className="form-grid-2">
                   <div className="form-group">
                    <label className="form-label">Estimated Lead Time (Days)</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} type="number" value={form.leadTimeDays} onChange={e => set('leadTimeDays', e.target.value)} placeholder="14" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Partner Rating</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} type="number" value={form.rating} onChange={e => set('rating', e.target.value)} min="1" max="5" placeholder="5" />
                  </div>
                  <div className="form-group full-width">
                     <label className="form-label">Production Materials Provided</label>
                     <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.materials} onChange={e => set('materials', e.target.value)} placeholder="Zari, Resham, Pure Silk..." />
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop:32, borderTop:'1px solid rgba(255,255,255,0.03)', paddingTop:24 }}>
                  <button type="button" className="btn btn-secondary glass" onClick={() => setShowModal(false)}>Discard</button>
                  <button type="submit" className="btn" style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }} disabled={saving}>{saving ? 'Finalizing...' : 'Finalize Partnership'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
