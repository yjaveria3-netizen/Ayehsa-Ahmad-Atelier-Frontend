import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Pending','Confirmed','Processing','Stitching','Quality Check','Ready','Dispatched','Shipped','Out for Delivery','Delivered','Cancelled','Returned','Refunded'];
const CHANNELS = ['Website','Instagram','WhatsApp','In-store','Phone','Facebook','TikTok','Other'];
const SHIPPING = ['Standard','Express','Same Day','Self Pickup','International'];
const PRIORITIES = ['Normal','Urgent','VIP'];
const EMPTY = { customerId:'', customerName:'', customerPhone:'', items:'', subtotal:'', discountAmount:0, discountCode:'', shippingCost:0, total:'', status:'Pending', shippingMethod:'Standard', courierName:'', trackingNumber:'', shippingAddress:'', channel:'Other', notes:'', priority:'Normal', orderDate:'' };

export default function Orders() {
  const { user, formatCurrency } = useAuth();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter) params.set('channel', channelFilter);
      const [res, s] = await Promise.all([
        api.get(`/orders?${params}`),
        api.get('/orders/stats/summary').catch(() => ({ data:{} })),
      ]);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, channelFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadDropdowns = async () => {
    try {
      const [c, p] = await Promise.all([api.get('/customers?limit=200'), api.get('/products?limit=200')]);
      setCustomers(c.data.customers || []);
      setProducts(p.data.products || []);
    } catch {}
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { loadDropdowns(); setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (o) => {
    loadDropdowns();
    setEditing(o);
    setForm({ ...EMPTY, ...o, orderDate: o.orderDate ? o.orderDate.split('T')[0] : '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build items array if single-item shortcut used
      const payload = {
        ...form,
        subtotal: Number(form.subtotal) || Number(form.total),
        total: Number(form.total),
        shippingCost: Number(form.shippingCost) || 0,
        discountAmount: Number(form.discountAmount) || 0,
      };
      if (editing) { await api.put(`/orders/${editing._id}`, payload); toast.success('Order updated!'); }
      else { await api.post('/orders', payload); toast.success('Order created!'); }
      setShowModal(false);
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try { await api.delete(`/orders/${id}`); toast.success('Order deleted'); fetchOrders(); }
    catch { toast.error('Failed to delete'); }
  };

  const STATUS_COLORS = {
    'Pending':'var(--warning)','Confirmed':'var(--info)','Processing':'var(--info)',
    'Stitching':'#9B64FF','Quality Check':'#9B64FF','Ready':'var(--teal)',
    'Dispatched':'var(--teal)','Shipped':'var(--teal)','Out for Delivery':'var(--teal)',
    'Delivered':'var(--success)','Cancelled':'var(--error)','Returned':'var(--error)','Refunded':'var(--error)',
  };
  const PRIORITY_COLORS = { Normal:'var(--text-muted)', Urgent:'var(--warning)', VIP:'var(--warning)' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-subtitle">
              {total} orders
              {user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing</>}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Order</button>
        </div>
      </div>

      <div className="page-body">
        {stats && (
          <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', marginBottom:20 }}>
            <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-value">{stats.total||0}</div></div>
            <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value" style={{ color:'var(--warning)' }}>{stats.pending||0}</div></div>
            <div className="stat-card"><div className="stat-label">Delivered</div><div className="stat-value" style={{ color:'var(--success)' }}>{stats.delivered||0}</div></div>
            <div className="stat-card"><div className="stat-label">Revenue</div><div className="stat-value" style={{ fontSize:'1.3rem' }}>{formatCurrency(stats.revenue)}</div></div>
          </div>
        )}

        {/* Status pipeline chips */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {['','Pending','Processing','Stitching','Ready','Shipped','Delivered','Cancelled'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
              padding:'4px 12px', borderRadius:999, fontSize:'0.68rem', fontWeight:600, cursor:'pointer',
              background: statusFilter===s ? 'var(--teal)' : 'var(--bg-raised)',
              color: statusFilter===s ? 'var(--bg-void)' : 'var(--text-muted)',
              border: `1px solid ${statusFilter===s ? 'var(--teal)' : 'var(--border)'}`,
              transition:'all 0.15s',
            }}>{s || 'All'}</button>
          ))}
        </div>

        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search by Order ID, customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1); }}>
              <option value="">All Channels</option>
              {CHANNELS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◫</div>
                <h3>No orders yet</h3>
                <p>Start recording sales to track your order pipeline</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Channel</th><th>Status</th><th>Priority</th><th>Tracking</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td><span className="id-chip">{o.orderId}</span></td>
                      <td>
                        <div className="cell-primary">{o.customerName || o.customerId}</div>
                        {o.customerPhone && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{o.customerPhone}</div>}
                      </td>
                      <td>
                        <div className="cell-primary">{formatCurrency(o.total)}</div>
                        {o.discountAmount > 0 && <div style={{ fontSize:'0.68rem', color:'var(--success)' }}>-{formatCurrency(o.discountAmount)} off</div>}
                      </td>
                      <td style={{ fontSize:'0.75rem' }}>{o.channel || '—'}</td>
                      <td>
                        <span className={`badge badge-${(o.status||'pending').toLowerCase().replace(/ /g,'-')}`} style={{ borderColor: STATUS_COLORS[o.status] ? STATUS_COLORS[o.status]+'33' : undefined }}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        {o.priority !== 'Normal'
                          ? <span style={{ fontSize:'0.65rem', fontWeight:700, color: PRIORITY_COLORS[o.priority], textTransform:'uppercase', letterSpacing:'0.08em' }}>{o.priority}</span>
                          : <span style={{ color:'var(--text-muted)', fontSize:'0.7rem' }}>—</span>}
                      </td>
                      <td style={{ fontSize:'0.72rem', color: o.trackingNumber ? 'var(--teal)' : 'var(--text-muted)' }}>
                        {o.trackingNumber || '—'}
                      </td>
                      <td style={{ fontSize:'0.75rem' }}>{o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon btn-sm" onClick={() => openEdit(o)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={() => handleDelete(o._id)} style={{ color:'var(--error)' }}>✕</button>
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
          <div className="modal" style={{ maxWidth:700 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Order' : 'New Order'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="section-label">Customer</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer ID *</label>
                    {customers.length > 0 ? (
                      <select className="form-select" value={form.customerId} onChange={e => {
                        const c = customers.find(x => x.customerId === e.target.value);
                        set('customerId', e.target.value);
                        if (c) { set('customerName', c.fullName); set('customerPhone', c.phone || ''); set('shippingAddress', c.address || ''); }
                      }} required>
                        <option value="">Select customer</option>
                        {customers.map(c => <option key={c._id} value={c.customerId}>{c.customerId} — {c.fullName}</option>)}
                      </select>
                    ) : (
                      <input className="form-input" value={form.customerId} onChange={e => set('customerId', e.target.value)} placeholder="CUS-0001" required />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input className="form-input" value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Auto-fills from customer" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer Phone</label>
                    <input className="form-input" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Shipping Address</label>
                    <textarea className="form-textarea" value={form.shippingAddress} onChange={e => set('shippingAddress', e.target.value)} rows={2} />
                  </div>
                </div>

                <div className="section-label">Pricing</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Subtotal *</label>
                    <input className="form-input" type="number" value={form.subtotal} onChange={e => { set('subtotal', e.target.value); set('total', (Number(e.target.value) - Number(form.discountAmount||0) + Number(form.shippingCost||0)).toString()); }} required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Amount</label>
                    <input className="form-input" type="number" value={form.discountAmount} onChange={e => { set('discountAmount', e.target.value); set('total', (Number(form.subtotal||0) - Number(e.target.value||0) + Number(form.shippingCost||0)).toString()); }} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shipping Cost</label>
                    <input className="form-input" type="number" value={form.shippingCost} onChange={e => { set('shippingCost', e.target.value); set('total', (Number(form.subtotal||0) - Number(form.discountAmount||0) + Number(e.target.value||0)).toString()); }} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total *</label>
                    <input className="form-input" type="number" value={form.total} onChange={e => set('total', e.target.value)} required min="0" style={{ fontWeight:600, color:'var(--teal)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Code</label>
                    <input className="form-input" value={form.discountCode} onChange={e => set('discountCode', e.target.value)} placeholder="Optional" />
                  </div>
                </div>

                <div className="section-label">Order Details</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Channel</label>
                    <select className="form-select" value={form.channel} onChange={e => set('channel', e.target.value)}>
                      {CHANNELS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shipping Method</label>
                    <select className="form-select" value={form.shippingMethod} onChange={e => set('shippingMethod', e.target.value)}>
                      {SHIPPING.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Courier Name</label>
                    <input className="form-input" value={form.courierName} onChange={e => set('courierName', e.target.value)} placeholder="e.g. TCS, Leopard" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tracking Number</label>
                    <input className="form-input" value={form.trackingNumber} onChange={e => set('trackingNumber', e.target.value)} placeholder="Tracking #" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order Date</label>
                    <input className="form-input" type="date" value={form.orderDate} onChange={e => set('orderDate', e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any special instructions…" />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Order' : 'Create Order'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
