import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PAYMENT_METHODS = ['Cash','Bank Transfer','EasyPaisa','JazzCash','Card','COD'];
const PAYMENT_STATUSES = ['Pending','Completed','Failed','Refunded'];
const EMPTY = { orderId:'', price:'', paymentMethod:'Cash', paymentStatus:'Pending', transactionDate:'' };

export default function Financial() {
  const { user } = useAuth();
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
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('paymentStatus', statusFilter);
      const [res, statsRes] = await Promise.all([api.get(`/financial?${params}`), api.get('/financial/stats/summary')]);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ orderId:t.orderId, price:t.price, paymentMethod:t.paymentMethod, paymentStatus:t.paymentStatus, transactionDate:t.transactionDate?t.transactionDate.split('T')[0]:'' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await api.put(`/financial/${editing._id}`, form); toast.success('Transaction updated & synced!'); }
      else { await api.post('/financial', form); toast.success('Transaction recorded & synced to Sheets!'); }
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

  const fmt = (n) => `PKR ${Number(n||0).toLocaleString('en-PK')}`;

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Financial Records</h1>
            <p className="page-subtitle">{total} transactions{user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing</>}</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Record Transaction</button>
        </div>
      </div>

      <div className="page-body">
        {stats && (
          <div className="stats-grid" style={{ marginBottom:24 }}>
            <div className="stat-card">
              <div className="stat-icon">◉</div>
              <div className="stat-value" style={{ fontSize:'1.3rem' }}>{fmt(stats.completedRevenue)}</div>
              <div className="stat-label">Collected Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">◎</div>
              <div className="stat-value" style={{ fontSize:'1.3rem', color:'var(--warning)' }}>{fmt(stats.pendingRevenue)}</div>
              <div className="stat-label">Pending Payments</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">○</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Transactions</div>
            </div>
          </div>
        )}

        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search by Transaction ID or Order ID…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
              <option value="">All Statuses</option>
              {PAYMENT_STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◉</div>
                <h3>No transactions yet</h3>
                <p>Record your first transaction to get started</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Transaction ID</th><th>Order ID</th><th>Price (PKR)</th><th>Payment Method</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id}>
                      <td><code style={{ fontSize:'0.78rem', color:'var(--gold)', background:'rgba(201,169,110,0.08)', padding:'2px 6px', borderRadius:4 }}>{t.transactionId}</code></td>
                      <td>{t.orderId}</td>
                      <td className="cell-primary">PKR {Number(t.price).toLocaleString()}</td>
                      <td>{t.paymentMethod}</td>
                      <td><span className={`badge badge-${t.paymentStatus.toLowerCase()}`}>{t.paymentStatus}</span></td>
                      <td>{new Date(t.transactionDate).toLocaleDateString('en-PK')}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-icon btn-sm" onClick={()=>openEdit(t)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={()=>handleDelete(t._id)} style={{ color:'var(--error)' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination" style={{ padding:'16px 20px' }}>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button className="page-btn" onClick={()=>setPage(p=>p-1)} disabled={page===1}>←</button>
              <button className="page-btn" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}>→</button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Transaction' : 'Record Transaction'}</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Order ID *</label>
                    <input className="form-input" value={form.orderId} onChange={e=>setForm(p=>({...p,orderId:e.target.value}))} placeholder="ORD-0001" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (PKR) *</label>
                    <input className="form-input" type="number" min="0" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method *</label>
                    <select className="form-select" value={form.paymentMethod} onChange={e=>setForm(p=>({...p,paymentMethod:e.target.value}))}>
                      {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" value={form.paymentStatus} onChange={e=>setForm(p=>({...p,paymentStatus:e.target.value}))}>
                      {PAYMENT_STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Transaction Date</label>
                    <input className="form-input" type="date" value={form.transactionDate} onChange={e=>setForm(p=>({...p,transactionDate:e.target.value}))} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⟳ Saving…' : editing ? 'Update' : 'Record Transaction'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
