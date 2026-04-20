import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
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
    } catch {
      setLoadError('Unable to load transactions right now.');
      toast.error('Failed to load transactions');
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
    try { await api.delete(`/financial/${id}`); toast.success('Transaction deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="financial-page animate-vibe">
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Accounts</h1>
              <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>
                {total} recorded movements in your balance
                {user?.storageType === 'google_drive' && user?.driveConnected && (
                    <span className="sync-status-indicator" style={{ color: 'var(--accent)' }}>
                      <motion.span className="sync-dot active" style={{ background: 'var(--accent)' }} animate={{ scale:[1,1.5,1], opacity:[0.8,0.3,0.8] }} transition={{ duration:2, repeat:Infinity }} />
                      Vault Secured
                    </span>
                )}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <MagneticButton className="btn" onClick={openAdd} style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }}>+ Record Cashflow</MagneticButton>
          </Reveal>
        </div>
      </div>

      <div className="page-body">
        {loading && !stats ? (
          <StatsLoadingGrid count={3} />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid">
              <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Realized Revenue</div>
                <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: '#34D399' }}>{formatCurrency(stats.completedRevenue)}</div>
              </GlowCard></StaggerItem>
              <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Receivables</div>
                <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: '#FBBF24' }}>{formatCurrency(stats.pendingRevenue)}</div>
              </GlowCard></StaggerItem>
              <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Total Volume</div>
                <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>{stats.total}</div>
              </GlowCard></StaggerItem>
            </div>
          </StaggerContainer>
        )}

        {/* Analytics Section */}
        {stats?.byMethod?.length > 0 && (
          <div className="financial-analytics-grid" style={{ marginTop: 32 }}>
            <div className="method-cards">
              {stats.byMethod.map(m => (
                <div key={m._id} className="card method-stat-box glass" style={{ border: '1px solid var(--accent-soft)' }}>
                  <div className="label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{m._id}</div>
                  <div className="val" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{m.count} <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Txns</span></div>
                  <div className="amount cell-primary" style={{ color: 'var(--accent)', fontWeight: 800 }}>{formatCurrency(m.total)}</div>
                </div>
              ))}
            </div>
            <div className="card glass chart-card-mini" style={{ border: '1px solid var(--accent-soft)' }}>
              <div className="chart-container-mini">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byMethod}
                      dataKey="total"
                      nameKey="_id"
                      cx="50%" cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {stats.byMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => formatCurrency(val)}
                      contentStyle={{ background: 'var(--bg-popover)', border: '1px solid var(--accent-soft)', borderRadius: '12px', color: 'white', boxShadow: 'var(--shadow-lg)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="table-toolbar" style={{ marginTop: 32 }}>
           <div className="filter-group">
            <div className="search-input-wrapper glass" style={{ border: '1px solid var(--accent-soft)' }}>
              <span className="search-icon" style={{ color: 'var(--accent)' }}>⌕</span>
              <input className="form-input search-input" style={{ background: 'transparent', border: 'none' }} placeholder="Search Reference, Order ID..." value={searchInput} onChange={e => { setSearchInput(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">Status: All Payments</option>
              {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <Reveal delay={0.05}>
          <div className="card glass overflow-hidden" style={{ border: '1px solid var(--accent-soft)', marginTop: 24 }}>
            <div className="table-container">
              {loading ? (
                <TableLoadingRows cols={7} rows={6} />
              ) : loadError ? (
                <QueryErrorState message={loadError} onRetry={fetchData} />
              ) : transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ color: 'var(--accent)' }}>$</div>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>No transactions recorded</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Maintain your atelier's cashflow by adding payments here.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th>Identity</th><th>Reference</th><th>Value</th><th>Method</th><th>Process Status</th><th>Date</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, idx) => (
                      <motion.tr 
                        key={t._id} 
                        initial={{ opacity:0, y:8 }} 
                        animate={{ opacity:1, y:0 }} 
                        transition={{ delay: idx * 0.03, duration:0.4 }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      >
                        <td><span className="id-chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{t.transactionId}</span></td>
                        <td><span className="id-chip" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{t.orderId}</span></td>
                        <td className="cell-primary" style={{ fontWeight: 800 }}>{formatCurrency(t.price)}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{t.paymentMethod}</td>
                        <td><span className={`badge badge-${t.paymentStatus.toLowerCase()}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{t.paymentStatus}</span></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(t.transactionDate).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon-sm" onClick={() => openEdit(t)} style={{ color: 'var(--accent)' }}>✎</button>
                            <button className="btn-icon-sm" onClick={() => handleDelete(t._id)} style={{ color: '#F87171' }}>✕</button>
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
                <span className="page-info">Page {page} of {totalPages}</span>
                <button className="page-btn glass" onClick={() => setPage(p => p-1)} disabled={page===1}>←</button>
                <button className="page-btn glass" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>→</button>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal glass sm animate-vibe" style={{ border: '1px solid var(--accent-border)' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{editing ? 'Optimize Transaction' : 'Record New Entry'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-grid-1">
                  <div className="form-group">
                    <label className="form-label">Reference (Order ID) *</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.orderId} onChange={e => set('orderId', e.target.value)} placeholder="ORD-XXXX" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Value *</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Liquid Method</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                      {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Status</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.paymentStatus} onChange={e => set('paymentStatus', e.target.value)}>
                      {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Identity Date</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} type="date" value={form.transactionDate} onChange={e => set('transactionDate', e.target.value)} />
                  </div>
                </div>
                <div className="form-actions" style={{ marginTop:24 }}>
                  <button type="button" className="btn btn-secondary glass" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn" style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }} disabled={saving}>{saving ? 'Syncing...' : 'Finalize Entry'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
