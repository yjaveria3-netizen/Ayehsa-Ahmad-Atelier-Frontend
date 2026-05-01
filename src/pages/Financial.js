import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, MagneticButton, GlowCard, ease } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const COLORS = ['#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#2E1065'];

const PAYMENT_METHODS = ['Cash','Bank Transfer','EasyPaisa','JazzCash','Card','COD','Stripe','PayPal','Wise','Other'];
const PAYMENT_STATUSES = ['Pending','Completed','Failed','Refunded'];
const EMPTY = { orderId:'', price:'', paymentMethod:'Cash', paymentStatus:'Pending', transactionDate:'' };

export default function Financial() {
  const { user, formatCurrency } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState('');
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
      const params = new URLSearchParams({ page, limit:15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('paymentStatus', statusFilter);
      const [res, s] = await Promise.all([api.get(`/financial?${params}`), api.get('/financial/stats/summary')]);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch (err) {
      console.error('Fetch transactions error:', err.message);
      setLoadError('Unable to load transactions right now.');
      toast.error(err.response?.data?.message || 'Failed to load transactions');
    }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ orderId:t.orderId, price:t.price, paymentMethod:t.paymentMethod, paymentStatus:t.paymentStatus, transactionDate:t.transactionDate?t.transactionDate.split('T')[0]:'' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await api.put(`/financial/${editing._id}`, form); toast.success('Transaction updated!'); }
      else { await api.post('/financial', form); toast.success('Transaction recorded!'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/financial/${id}`);
      toast.success('Transaction deleted');
      fetchData();
    } catch (err) {
      console.error('Delete transaction error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  return (
    <div className="financial-page animate-vibe">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Accounts</h1>
              <p className="page-subtitle">
                {total} recorded movements in your balance
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
              + Record Cashflow
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
                { label: 'Realized Revenue', value: formatCurrency(stats.completedRevenue || 0), color: '#34D399' },
                { label: 'Receivables', value: formatCurrency(stats.pendingRevenue || 0), color: '#FBBF24' },
                { label: 'Total Volume', value: stats.total || 0, color: 'var(--text-primary)', isNumber: true },
              ].map((s) => (
                <StaggerItem key={s.label}>
                  <GlowCard className="stat-card card glass">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: s.isNumber ? '2rem' : '1.5rem' }}>
                      {s.value}
                    </div>
                  </GlowCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        )}

        {/* ── Analytics Grid ── */}
        {stats?.byMethod?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {stats.byMethod.map(m => (
                <div key={m._id} className="card glass" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{m._id}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(m.total)}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: 2 }}>{m.count} txns</div>
                </div>
              ))}
            </div>
            <div className="card glass" style={{ height: 180, padding: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byMethod}
                    dataKey="total"
                    nameKey="_id"
                    cx="50%" cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {stats.byMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ background: 'var(--bg-popover)', border: '1px solid var(--accent-soft)', borderRadius: '12px', color: 'white', fontSize: '0.8rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="commerce-toolbar" style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ maxWidth: 380, flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search reference, order, ID…"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 200, padding: '10px 18px', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Payment Statuses</option>
            {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <Reveal delay={0.05}>
          <div className="table-container">
            {loading ? (
              <TableLoadingRows cols={7} rows={7} />
            ) : loadError ? (
              <QueryErrorState message={loadError} onRetry={fetchData} />
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💳</div>
                <h3>No transactions recorded</h3>
                <p>Maintain your atelier's cashflow by adding payments here.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Order Ref</th>
                    <th>Value</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => (
                    <motion.tr
                      key={t._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.35 }}
                    >
                      <td>
                        <span className="id-chip">{t.transactionId}</span>
                      </td>
                      <td>
                        <span className="id-chip" style={{ background: 'var(--bg-layer2)', color: 'var(--text-muted)' }}>{t.orderId}</span>
                      </td>
                      <td className="cell-primary" style={{ fontWeight: 800 }}>
                        {formatCurrency(t.price)}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{t.paymentMethod}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${t.paymentStatus.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                          {t.paymentStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(t.transactionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(t)}
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
                            onClick={() => handleDelete(t._id)}
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
              style={{ border: '1px solid var(--accent-border)', maxWidth: 460 }}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editing ? '✏️ Optimize Record' : '+ Record Cashflow'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSave}>

                  <div className="form-group">
                    <label className="form-label">Order Reference *</label>
                    <input
                      className="form-input"
                      value={form.orderId}
                      onChange={e => set('orderId', e.target.value)}
                      placeholder="ORD-XXXX"
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Total Value *</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.price}
                        onChange={e => set('price', e.target.value)}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Identity Date</label>
                      <input
                        className="form-input"
                        type="date"
                        value={form.transactionDate}
                        onChange={e => set('transactionDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Liquid Method</label>
                      <select className="form-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                        {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Process Status</label>
                      <select className="form-select" value={form.paymentStatus} onChange={e => set('paymentStatus', e.target.value)}>
                        {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 28 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Syncing…' : editing ? 'Finalize Record' : 'Record Entry'}
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
