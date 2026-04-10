import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('paymentStatus', statusFilter);
      const [res, s] = await Promise.all([api.get(`/financial?${params}`), api.get('/financial/stats/summary')]);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch { toast.error('Failed to load transactions'); }
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
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Financial</h1>
            <p className="page-subtitle">{total} transactions{user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing</>}</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Record Transaction</button>
        </div>
      </div>

      <div className="page-body">
        {stats && (
          <div className="stats-grid" style={{ marginBottom:20 }}>
            <div className="stat-card">
              <div className="stat-label">Revenue Collected</div>
              <div className="stat-value" style={{ fontSize:'1.4rem', color:'var(--success)' }}>{formatCurrency(stats.completedRevenue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Payments</div>
              <div className="stat-value" style={{ fontSize:'1.4rem', color:'var(--warning)' }}>{formatCurrency(stats.pendingRevenue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </div>
        )}

        {/* Method breakdown */}
        {stats?.byMethod?.length > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            {stats.byMethod.map(m => (
              <div key={m._id} style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'10px 14px', minWidth:120 }}>
                <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600, marginBottom:4 }}>{m._id}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--cream)', letterSpacing:'0.04em' }}>{m.count}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)' }}>{formatCurrency(m.total)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search by Transaction or Order ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">$</div>
                <h3>No transactions yet</h3>
                <p>Record your first payment to start financial tracking</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>TXN ID</th><th>Order ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id}>
                      <td><span className="id-chip">{t.transactionId}</span></td>
                      <td><span className="id-chip">{t.orderId}</span></td>
                      <td className="cell-primary">{formatCurrency(t.price)}</td>
                      <td style={{ fontSize:'0.78rem' }}>{t.paymentMethod}</td>
                      <td><span className={`badge badge-${t.paymentStatus.toLowerCase()}`}>{t.paymentStatus}</span></td>
                      <td style={{ fontSize:'0.75rem' }}>{new Date(t.transactionDate).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon btn-sm" onClick={() => openEdit(t)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={() => handleDelete(t._id)} style={{ color:'var(--error)' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <span className="page-info">Page {page} of {totalPages}</span>
              <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page===1}>←</button>
              <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>→</button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Transaction' : 'Record Transaction'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Order ID *</label>
                    <input className="form-input" value={form.orderId} onChange={e => set('orderId', e.target.value)} placeholder="ORD-0001" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount *</label>
                    <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method *</label>
                    <select className="form-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                      {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.paymentStatus} onChange={e => set('paymentStatus', e.target.value)}>
                      {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Transaction Date</label>
                    <input className="form-input" type="date" value={form.transactionDate} onChange={e => set('transactionDate', e.target.value)} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Record'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
