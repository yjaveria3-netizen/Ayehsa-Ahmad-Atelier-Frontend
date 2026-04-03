import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Pending','Processing','Shipped','Delivered','Cancelled','Returned'];
const EMPTY = { customerId:'', productId:'', quantity:'', total:'', status:'Pending', orderDate:'' };

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
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
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadDropdowns = async () => {
    try {
      const [c, p] = await Promise.all([api.get('/customers?limit=100'), api.get('/products?limit=100')]);
      setCustomers(c.data.customers);
      setProducts(p.data.products);
    } catch {}
  };

  const openAdd = () => { loadDropdowns(); setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (o) => { loadDropdowns(); setEditing(o); setForm({ customerId:o.customerId, productId:o.productId, quantity:o.quantity, total:o.total, status:o.status, orderDate:o.orderDate?o.orderDate.split('T')[0]:'' }); setShowModal(true); };

  const autoTotal = (qty, productId) => {
    const product = products.find(p => p.productId === productId);
    if (product && qty) setForm(f => ({ ...f, total: product.price * qty }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await api.put(`/orders/${editing._id}`, form); toast.success('Order updated & synced!'); }
      else { await api.post('/orders', form); toast.success('Order created & synced to Sheets!'); }
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

  const badgeClass = (status) => `badge badge-${status.toLowerCase()}`;

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-subtitle">{total} orders total{user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing</>}</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Order</button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search by Order ID or Customer ID…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◇</div>
                <h3>No orders yet</h3>
                <p>Record your first order to get started</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Customer ID</th><th>Product ID</th><th>Qty</th><th>Total (PKR)</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td><code style={{ fontSize:'0.78rem', color:'var(--gold)', background:'rgba(201,169,110,0.08)', padding:'2px 6px', borderRadius:4 }}>{o.orderId}</code></td>
                      <td>{o.customerId}</td>
                      <td>{o.productId}</td>
                      <td className="cell-primary">{o.quantity}</td>
                      <td className="cell-primary">PKR {Number(o.total).toLocaleString()}</td>
                      <td><span className={badgeClass(o.status)}>{o.status}</span></td>
                      <td>{new Date(o.orderDate).toLocaleDateString('en-PK')}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-icon btn-sm" onClick={()=>openEdit(o)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={()=>handleDelete(o._id)} style={{ color:'var(--error)' }}>✕</button>
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
              <h2 className="modal-title">{editing ? 'Edit Order' : 'New Order'}</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer ID *</label>
                    {customers.length > 0 ? (
                      <select className="form-select" value={form.customerId} onChange={e=>setForm(p=>({...p,customerId:e.target.value}))} required>
                        <option value="">Select customer</option>
                        {customers.map(c => <option key={c._id} value={c.customerId}>{c.customerId} — {c.fullName}</option>)}
                      </select>
                    ) : (
                      <input className="form-input" value={form.customerId} onChange={e=>setForm(p=>({...p,customerId:e.target.value}))} placeholder="CUS-0001" required />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product ID *</label>
                    {products.length > 0 ? (
                      <select className="form-select" value={form.productId} onChange={e=>{setForm(p=>({...p,productId:e.target.value}));autoTotal(form.quantity,e.target.value);}} required>
                        <option value="">Select product</option>
                        {products.map(p => <option key={p._id} value={p.productId}>{p.productId} — {p.name} (PKR {p.price})</option>)}
                      </select>
                    ) : (
                      <input className="form-input" value={form.productId} onChange={e=>setForm(p=>({...p,productId:e.target.value}))} placeholder="PRD-0001" required />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input className="form-input" type="number" min="1" value={form.quantity} onChange={e=>{setForm(p=>({...p,quantity:e.target.value}));autoTotal(e.target.value,form.productId);}} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total (PKR) *</label>
                    <input className="form-input" type="number" min="0" value={form.total} onChange={e=>setForm(p=>({...p,total:e.target.value}))} placeholder="Auto-calculated" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order Date</label>
                    <input className="form-input" type="date" value={form.orderDate} onChange={e=>setForm(p=>({...p,orderDate:e.target.value}))} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⟳ Saving…' : editing ? 'Update Order' : 'Create Order'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
