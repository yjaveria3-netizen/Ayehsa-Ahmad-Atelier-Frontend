import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const REASONS = ['Wrong Size','Wrong Item','Defective/Damaged','Not as Described','Changed Mind','Duplicate Order','Late Delivery','Quality Issue','Other'];
const TYPES = ['Refund','Exchange','Store Credit'];
const STATUSES = ['Requested','Approved','Item Received','Inspected','Refund Issued','Exchange Dispatched','Completed','Rejected'];
const EMPTY = { orderId:'', customerId:'', reason:'Defective/Damaged', type:'Refund', status:'Requested', refundAmount:'', notes:'' };

export default function Returns() {
  const { user } = useAuth();
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [fetchReturns]);

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

  const badgeClass = (status) => {
    const base = 'badge badge-';
    if (status === 'Completed' || status === 'Refund Issued') return base + 'success';
    if (status === 'Rejected') return base + 'error';
    if (status === 'Approved' || status === 'Item Received') return base + 'info';
    return base + 'neutral';
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Returns & Refunds</h1>
            <p className="page-subtitle">{total} returns total</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Return</button>
        </div>
      </div>

      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12, marginBottom:20 }}>
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:4 }}>Total Returns</div>
            <div style={{ fontSize:'1.8rem', fontWeight:600, color:'var(--text-primary)' }}>{stats.total}</div>
          </div>
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:4 }}>Pending</div>
            <div style={{ fontSize:'1.8rem', fontWeight:600, color:'#ff9800' }}>{stats.pending}</div>
          </div>
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:4 }}>Completed</div>
            <div style={{ fontSize:'1.8rem', fontWeight:600, color:'#4caf50' }}>{stats.completed}</div>
          </div>
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:4 }}>Total Refunded</div>
            <div style={{ fontSize:'1.8rem', fontWeight:600, color:'#2196f3' }}>PKR {Number(stats.totalRefunded || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="page-body">
        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search by Return ID, Order ID, or Customer…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width:'auto' }} value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(1);}}>
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-container">
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : returns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">↩</div>
                <h3>No returns yet</h3>
                <p>Track your returns and refunds here</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Return ID</th><th>Order ID</th><th>Customer</th><th>Reason</th><th>Type</th><th>Status</th><th>Refund (PKR)</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {returns.map(r => (
                    <tr key={r._id}>
                      <td><code style={{ fontSize:'0.78rem', color:'var(--gold)', background:'rgba(201,169,110,0.08)', padding:'2px 6px', borderRadius:4 }}>{r.returnId}</code></td>
                      <td>{r.orderId}</td>
                      <td>{r.customerName || r.customerId}</td>
                      <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{r.reason}</td>
                      <td><span className={`badge badge-${r.type.toLowerCase()}`}>{r.type}</span></td>
                      <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                      <td className="cell-primary">PKR {Number(r.refundAmount).toLocaleString()}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-icon btn-sm" onClick={()=>openEdit(r)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={()=>handleDelete(r._id)} style={{ color:'var(--error)' }}>✕</button>
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
              <h2 className="modal-title">{editing ? 'Edit Return' : 'New Return'}</h2>
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
                    <label   className="form-label">Customer ID</label>
                    <input className="form-input" value={form.customerId} onChange={e=>setForm(p=>({...p,customerId:e.target.value}))} placeholder="CUST-0001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason *</label>
                    <select className="form-select" value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} required>
                      {REASONS.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} required>
                      {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select className="form-select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} required>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Refund Amount (PKR)</label>
                    <input className="form-input" type="number" min="0" value={form.refundAmount} onChange={e=>setForm(p=>({...p,refundAmount:e.target.value}))} />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                    <label className="form-label">Notes</label>
                    <textarea className="form-input" rows="3" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⟳ Saving…' : editing ? 'Update Return' : 'Create Return'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
