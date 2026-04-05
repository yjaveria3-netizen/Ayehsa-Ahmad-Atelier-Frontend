import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const REASONS = ['Wrong Size', 'Wrong Item', 'Defective/Damaged', 'Not as Described', 'Changed Mind', 'Duplicate Order', 'Late Delivery', 'Quality Issue', 'Other'];
const STATUSES = ['Requested', 'Approved', 'Item Received', 'Inspected', 'Refund Issued', 'Exchange Dispatched', 'Completed', 'Rejected'];
const TYPES = ['Refund', 'Exchange', 'Store Credit'];
const REFUND_METHODS = ['Original Payment Method', 'Bank Transfer', 'Cash', 'EasyPaisa', 'JazzCash', 'Store Credit', 'Other'];
const EMPTY = { orderId:'', customerId:'', customerName:'', productId:'', productName:'', quantity:1, reason:'Defective/Damaged', type:'Refund', status:'Requested', refundAmount:'', refundMethod:'Original Payment Method', notes:'', requestDate:'' };

export default function Returns() {
  const { user, formatCurrency } = useAuth();
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const [res, s] = await Promise.all([
        api.get(`/returns?${params}`),
        api.get('/returns/stats/summary').catch(() => ({ data:{} })),
      ]);
      setReturns(res.data.returns || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setStats(s.data);
    } catch { toast.error('Failed to load returns'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ ...EMPTY, ...r, requestDate: r.requestDate ? r.requestDate.split('T')[0] : '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.orderId) return toast.error('Order ID is required');
    setSaving(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) || 1, refundAmount: Number(form.refundAmount) || 0 };
      if (editing) { await api.put(`/returns/${editing._id}`, payload); toast.success('Return updated!'); }
      else { await api.post('/returns', payload); toast.success('Return recorded!'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this return record?')) return;
    try { await api.delete(`/returns/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const STATUS_CHIPS = ['', 'Requested', 'Approved', 'Item Received', 'Refund Issued', 'Completed', 'Rejected'];
  const TYPE_CHIPS = ['', 'Refund', 'Exchange', 'Store Credit'];

  const getBadgeClass = (s) => {
    s = (s||'').toLowerCase().replace(/ /g,'-');
    if (['completed','refund-issued','exchange-dispatched'].includes(s)) return 'badge-completed';
    if (['requested'].includes(s)) return 'badge-pending';
    if (['approved','item-received','inspected'].includes(s)) return 'badge-confirmed';
    if (['rejected'].includes(s)) return 'badge-cancelled';
    return 'badge-draft';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Returns & Refunds</h1>
            <p className="page-subtitle">
              {total} records
              {user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:8 }} />Syncing</>}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Return</button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        {stats && (
          <div className="stats-grid" style={{ marginBottom:20 }}>
            <div className="stat-card">
              <div className="stat-card-icon">↩</div>
              <div className="stat-label">Total Returns</div>
              <div className="stat-value">{stats.total || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ color:'var(--amber)' }}>⏳</div>
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color:'var(--amber)' }}>{stats.pending || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ color:'var(--emerald)' }}>✓</div>
              <div className="stat-label">Completed</div>
              <div className="stat-value" style={{ color:'var(--emerald)' }}>{stats.completed || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ color:'var(--rose)' }}>$</div>
              <div className="stat-label">Refunds Issued</div>
              <div className="stat-value large">{formatCurrency(stats.totalRefunded || 0)}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filter-chips" style={{ marginBottom:8 }}>
          {STATUS_CHIPS.map(s => (
            <button key={s} className={`chip${statusFilter===s?' active':''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s || 'All Statuses'}
            </button>
          ))}
        </div>
        <div className="filter-chips">
          {TYPE_CHIPS.map(t => (
            <button key={t} className={`chip${typeFilter===t?' active':''}`} onClick={() => { setTypeFilter(t); setPage(1); }}>
              {t || 'All Types'}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-ico">⌕</span>
            <input className="form-input search-input" placeholder="Search by order ID, customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-wrap">
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : returns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-ico">↩</div>
                <h3>No returns yet</h3>
                <p>Record a return request to start tracking</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop:14 }} onClick={openAdd}>+ New Return</button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Return ID</th><th>Order</th><th>Customer</th><th>Product</th>
                    <th>Reason</th><th>Type</th><th>Amount</th><th>Status</th>
                    <th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map(r => (
                    <tr key={r._id}>
                      <td><span className="id-chip">{r.returnId || '—'}</span></td>
                      <td><span className="id-chip">{r.orderId}</span></td>
                      <td>
                        <div className="cell-main">{r.customerName || r.customerId || '—'}</div>
                      </td>
                      <td style={{ fontSize:'0.76rem' }}>
                        <div>{r.productName || r.productId || '—'}</div>
                        {r.quantity > 1 && <div style={{ color:'var(--text-muted)', fontSize:'0.68rem' }}>Qty: {r.quantity}</div>}
                      </td>
                      <td style={{ fontSize:'0.73rem' }}>{r.reason}</td>
                      <td>
                        <span className={`badge badge-${(r.type||'').toLowerCase().replace(' ','-')}`}>{r.type}</span>
                      </td>
                      <td className="cell-main">
                        {r.refundAmount > 0 ? formatCurrency(r.refundAmount) : '—'}
                      </td>
                      <td><span className={`badge ${getBadgeClass(r.status)}`}>{r.status}</span></td>
                      <td style={{ fontSize:'0.73rem' }}>
                        {r.requestDate ? new Date(r.requestDate).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon" onClick={() => openEdit(r)} title="Edit">✎</button>
                          <button className="btn-icon danger" onClick={() => handleDelete(r._id)} title="Delete">✕</button>
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
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Return' : 'New Return / Refund'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="section-label">Order & Customer</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Order ID *</label>
                    <input className="form-input" value={form.orderId} onChange={e => set('orderId', e.target.value)} placeholder="ORD-0001" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer ID</label>
                    <input className="form-input" value={form.customerId} onChange={e => set('customerId', e.target.value)} placeholder="CUS-0001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input className="form-input" value={form.customerName} onChange={e => set('customerName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Request Date</label>
                    <input className="form-input" type="date" value={form.requestDate} onChange={e => set('requestDate', e.target.value)} />
                  </div>
                </div>

                <div className="section-label">Product</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Product ID / Name</label>
                    <input className="form-input" value={form.productName || form.productId} onChange={e => set('productName', e.target.value)} placeholder="Product name or ID" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input className="form-input" type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} min="1" />
                  </div>
                </div>

                <div className="section-label">Return Details</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Reason *</label>
                    <select className="form-select" value={form.reason} onChange={e => set('reason', e.target.value)}>
                      {REASONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="section-label">Refund / Settlement</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Refund Amount</label>
                    <input className="form-input" type="number" value={form.refundAmount} onChange={e => set('refundAmount', e.target.value)} placeholder="0" min="0" />
                    <span className="form-hint">Leave 0 for exchanges or store credit</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Refund Method</label>
                    <select className="form-select" value={form.refundMethod} onChange={e => set('refundMethod', e.target.value)}>
                      {REFUND_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any additional details…" />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Record Return'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}