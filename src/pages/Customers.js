import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, GlowCard } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const SEGMENTS = ['VIP', 'Loyal', 'Regular', 'New', 'At Risk', 'Inactive'];
const SOURCES = ['Instagram', 'Website', 'WhatsApp', 'Walk-in', 'Referral', 'Facebook', 'TikTok', 'Other'];
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const COUNTRIES = ['Pakistan', 'United States', 'United Kingdom', 'UAE', 'Saudi Arabia', 'India', 'Bangladesh', 'Other'];

const SEGMENT_STYLE = {
  'VIP': { color: '#FBBF24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)' },
  'Loyal': { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  'Regular': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'New': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'At Risk': { color: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)' },
  'Inactive': { color: '#64748b', bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.20)' },
};

const EMPTY = {
  fullName: '', email: '', phone: '', whatsapp: '', address: '',
  city: '', country: 'Pakistan', gender: 'Female', segment: 'New',
  source: 'Instagram', isSubscribed: true, notes: '', tags: '', dateJoined: '',
};

export default function Customers() {
  const { formatCurrency } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [segmentFilter, setSegmentFilter] = useState('');
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
      if (segmentFilter) params.set('segment', segmentFilter);
      const [res, s] = await Promise.all([
        api.get(`/customers?${params}`),
        api.get('/customers/stats/summary').catch(() => ({ data: {} })),
      ]);
      setCustomers(res.data.customers);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch {
      setLoadError('Unable to load customers right now.');
      toast.error('Failed to load customers');
    }
    finally { setLoading(false); }
  }, [page, search, segmentFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      ...EMPTY, ...c,
      tags: Array.isArray(c.tags) ? c.tags.join(', ') : '',
      dateJoined: c.dateJoined ? c.dateJoined.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editing) {
        await api.put(`/customers/${editing._id}`, payload);
        toast.success('Customer updated!');
      } else {
        await api.post('/customers', payload);
        toast.success('Customer added!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="customers-page animate-vibe">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Customers</h1>
              <p className="page-subtitle">{total} profiles in your database</p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <button className="btn btn-primary" onClick={openAdd}>
              + Add Customer
            </button>
          </Reveal>
        </div>
      </div>

      <div className="page-body">

        {/* ── Stats row ── */}
        {loading && !stats ? (
          <StatsLoadingGrid count={2} />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              <StaggerItem>
                <GlowCard className="stat-card card glass">
                  <div className="stat-label">Total Customers</div>
                  <div className="stat-value">{stats.total || 0}</div>
                </GlowCard>
              </StaggerItem>
              <StaggerItem>
                <GlowCard className="stat-card card glass">
                  <div className="stat-label">New This Month</div>
                  <div className="stat-value" style={{ color: '#34D399' }}>
                    +{stats.thisMonth || 0}
                  </div>
                </GlowCard>
              </StaggerItem>
            </div>
          </StaggerContainer>
        )}

        {/* ── Segment filter pills ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['', ...SEGMENTS].map(s => {
            const active = segmentFilter === s;
            const st = s ? SEGMENT_STYLE[s] : null;
            return (
              <button
                key={s || 'all'}
                onClick={() => { setSegmentFilter(s); setPage(1); }}
                style={{
                  padding: '5px 14px',
                  borderRadius: 99,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: `1px solid ${active && st ? st.border : active ? 'var(--accent-border)' : 'var(--border-faint)'}`,
                  background: active && st ? st.bg : active ? 'var(--accent-soft)' : 'transparent',
                  color: active && st ? st.color : active ? 'var(--accent)' : 'var(--text-faint)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s || 'All'}
              </button>
            );
          })}
        </div>

        {/* ── Search bar ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="search-input-wrapper" style={{ maxWidth: 380 }}>
            <span className="search-icon" style={{ color: 'var(--text-faint)' }}>🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search name, ID, email, phone…"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <Reveal delay={0.05}>
          <div className="table-container">
            {loading ? (
              <TableLoadingRows cols={9} rows={7} />
            ) : loadError ? (
              <QueryErrorState message={loadError} onRetry={fetchData} />
            ) : customers.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👥</div>
                <h3>No customers yet</h3>
                <p>Add your first customer to start building your CRM.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>City</th>
                    <th>Segment</th>
                    <th>Source</th>
                    <th>Total Spent</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, idx) => {
                    const seg = SEGMENT_STYLE[c.segment] || SEGMENT_STYLE['New'];
                    return (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.35 }}
                      >
                        <td>
                          <span className="id-chip">{c.customerId}</span>
                        </td>
                        <td>
                          <div className="cell-primary">{c.fullName}</div>
                          {c.email && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 2 }}>
                              {c.email}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {c.phone || '—'}
                          </div>
                          {c.whatsapp && c.whatsapp !== c.phone && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 2 }}>
                              WA: {c.whatsapp}
                            </div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {[c.city, c.country].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '3px 10px', borderRadius: 99,
                            fontSize: '0.6rem', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            color: seg.color, background: seg.bg,
                            border: `1px solid ${seg.border}`,
                          }}>
                            {c.segment || 'New'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {c.source || 'Direct'}
                        </td>
                        <td>
                          <span className="cell-primary" style={{ fontSize: '0.88rem' }}>
                            {c.totalSpent > 0 ? formatCurrency(c.totalSpent) : '—'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.88rem' }}>
                          {c.totalOrders || 0}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(c)}
                              style={{
                                width: 30, height: 30, borderRadius: 7,
                                border: '1px solid var(--accent-border)',
                                background: 'var(--accent-soft)', color: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '0.78rem',
                              }}
                            >✏️</motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(c._id)}
                              style={{
                                width: 30, height: 30, borderRadius: 7,
                                border: '1px solid rgba(248,113,113,0.25)',
                                background: 'rgba(248,113,113,0.08)', color: '#F87171',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '0.78rem',
                              }}
                            >🗑️</motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}

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
              style={{ border: '1px solid var(--accent-border)', maxWidth: 580 }}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editing ? '✏️ Edit Customer' : '+ New Customer'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSave}>

                  {/* Basic info */}
                  <div className="section-label">Basic Info</div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-input"
                      value={form.fullName}
                      onChange={e => set('fullName', e.target.value)}
                      required
                      placeholder="Sara Ahmed"
                    />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="sara@email.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 1234567" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                        {GENDERS.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Karachi" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select className="form-select" value={form.country} onChange={e => set('country', e.target.value)}>
                        {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp</label>
                      <input className="form-input" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+92 300 1234567" />
                    </div>
                  </div>

                  {/* CRM */}
                  <div className="section-label">CRM</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Segment</label>
                      <select className="form-select" value={form.segment} onChange={e => set('segment', e.target.value)}>
                        {SEGMENTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Source</label>
                      <select className="form-select" value={form.source} onChange={e => set('source', e.target.value)}>
                        {SOURCES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this customer…" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="vip, bridal, repeat  (comma separated)" />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving…' : editing ? 'Update' : 'Add Customer'}
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