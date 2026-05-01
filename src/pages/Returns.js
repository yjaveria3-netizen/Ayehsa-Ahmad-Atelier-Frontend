import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, MagneticButton, GlowCard, ease } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const REASONS = ['Wrong Size','Wrong Item','Defective/Damaged','Not as Described','Changed Mind','Duplicate Order','Late Delivery','Quality Issue','Other'];
const TYPES = ['Refund','Exchange','Store Credit'];
const STATUSES = ['Requested','Approved','Item Received','Inspected','Refund Issued','Exchange Dispatched','Completed','Rejected'];
const EMPTY = { orderId:'', customerId:'', reason:'Defective/Damaged', type:'Refund', status:'Requested', refundAmount:'', notes:'' };

const STATUS_CLASSES = {
  'Requested': 'badge-pending',
  'Approved': 'badge-active',
  'Item Received': 'badge-active',
  'Inspected': 'badge-rose',
  'Refund Issued': 'badge-success',
  'Exchange Dispatched': 'badge-success',
  'Completed': 'badge-success',
  'Rejected': 'badge-archived',
};

export default function Returns() {
  const { user, formatCurrency } = useAuth();
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/returns/stats/summary');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const res = await api.get(`/returns?${params.toString()}`);
      setReturns(res.data.returns);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setLoadError('Unable to load returns right now.');
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [fetchReturns, fetchStats]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ orderId:r.orderId, customerId:r.customerId, reason:r.reason, type:r.type, status:r.status, refundAmount:r.refundAmount, notes:r.notes }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/returns/${editing._id}`, form);
        toast.success('Return updated');
      } else {
        await api.post('/returns', form);
        toast.success('Return created');
      }
      setShowModal(false);
      fetchReturns();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this return?')) return;
    try {
      await api.delete(`/returns/${id}`);
      toast.success('Return deleted');
      fetchReturns();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="returns-page animate-vibe">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Returns</h1>
              <p className="page-subtitle">
                {total} cases requiring attention
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
              + Log Case
            </button>
          </Reveal>
        </div>
      </div>

      <div className="page-body">

        {/* ── Stats Row ── */}
        {loading && !stats ? (
          <StatsLoadingGrid count={3} />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {[
                { label: 'Total Volume', value: stats.total || 0, color: 'var(--text-primary)' },
                { label: 'Awaiting Resolution', value: stats.pending || 0, color: '#FBBF24' },
                { label: 'Adjusted Value', value: formatCurrency(stats.totalRefunded || 0), color: '#F87171', isText: true },
              ].map((s) => (
                <StaggerItem key={s.label}>
                  <GlowCard className="stat-card card glass">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: s.isText ? '1.4rem' : undefined }}>
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
              placeholder="Search reference, order, client…"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              className="form-select"
              style={{ width: 180, padding: '10px 18px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Phases</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="form-select"
              style={{ width: 160, padding: '10px 18px', fontSize: '0.85rem' }}
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <Reveal delay={0.05}>
          <div className="table-container">
            {loading ? (
              <TableLoadingRows cols={8} rows={7} />
            ) : loadError ? (
              <QueryErrorState message={loadError} onRetry={fetchReturns} />
            ) : returns.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>↩</div>
                <h3>No active returns</h3>
                <p>When a client requests an exchange or refund, it will appear here.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Order</th>
                    <th>Client</th>
                    <th>Reasoning</th>
                    <th>Resolution</th>
                    <th>Phase</th>
                    <th>Adjustment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r, idx) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.35 }}
                    >
                      <td>
                        <span className="id-chip">{r.returnId}</span>
                      </td>
                      <td>
                        <span className="id-chip" style={{ background: 'var(--bg-layer2)', color: 'var(--text-muted)' }}>{r.orderId}</span>
                      </td>
                      <td>
                        <div className="cell-primary">{r.customerName || r.customerId}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', opacity: 0.6 }}>{r.reason}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>{r.type}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${(r.status || 'requested').toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.6rem' }}>
                          {r.status}
                        </span>
                      </td>
                      <td className="cell-primary" style={{ fontWeight: 800 }}>
                        {formatCurrency(r.refundAmount || 0)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(r)}
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
                            onClick={() => handleDelete(r._id)}
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
                  {editing ? '✏️ Optimize Case' : '+ Log Case'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <form onSubmit={handleSave}>

                  <div className="section-label">Case Identity</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Order Reference *</label>
                      <input
                        className="form-input"
                        value={form.orderId}
                        onChange={e => setForm(p => ({ ...p, orderId: e.target.value }))}
                        placeholder="ORD-XXXX"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Client Reference</label>
                      <input
                        className="form-input"
                        value={form.customerId}
                        onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))}
                        placeholder="CUS-XXXX"
                      />
                    </div>
                  </div>

                  <div className="section-label">Reasoning & Status</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Primary Reason</label>
                      <select className="form-select" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} required>
                        {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Resolution Path</label>
                      <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} required>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Phase</label>
                      <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} required>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Adjustment Amount</label>
                      <input className="form-input" type="number" min="0" value={form.refundAmount} onChange={e => setForm(p => ({ ...p, refundAmount: e.target.value }))} placeholder="0" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Internal Analysis / Notes</label>
                    <textarea className="form-textarea" rows="2" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Damage details, inspection results..." />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 28 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                      Discard
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Syncing…' : editing ? 'Finalize Case' : 'Log Return'}
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
