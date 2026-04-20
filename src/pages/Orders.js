import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, MagneticButton, GlowCard } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Stitching', 'Quality Check', 'Ready', 'Dispatched', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
const CHANNELS = ['Website', 'Instagram', 'WhatsApp', 'In-store', 'Phone', 'Facebook', 'TikTok', 'Other'];
const SHIPPING = ['Standard', 'Express', 'Same Day', 'Self Pickup', 'International'];
const PRIORITIES = ['Normal', 'Urgent', 'VIP'];

const STATUS_STYLE = {
  'Pending': { color: '#FBBF24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)' },
  'Confirmed': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'Processing': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'Stitching': { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  'Quality Check': { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  'Ready': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'Dispatched': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'Shipped': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'Out for Delivery': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'Delivered': { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
  'Cancelled': { color: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)' },
  'Returned': { color: '#64748b', bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.20)' },
  'Refunded': { color: '#64748b', bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.20)' },
};

const EMPTY = {
  customerId: '', customerName: '', customerPhone: '', items: '',
  subtotal: '', discountAmount: 0, discountCode: '', shippingCost: 0,
  total: '', status: 'Pending', shippingMethod: 'Standard',
  courierName: '', trackingNumber: '', shippingAddress: '',
  channel: 'Other', notes: '', priority: 'Normal', orderDate: '',
};

export default function Orders() {
  const { user, formatCurrency } = useAuth();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter) params.set('channel', channelFilter);
      const [res, s] = await Promise.all([
        api.get(`/orders?${params}`),
        api.get('/orders/stats/summary').catch(() => ({ data: {} })),
      ]);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch {
      setLoadError('Unable to load orders right now.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, channelFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadDropdowns = async () => {
    try {
      const res = await api.get('/customers?limit=200');
      setCustomers(res.data.customers || []);
    } catch {}
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => {
    loadDropdowns();
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

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
      const payload = {
        ...form,
        subtotal: Number(form.subtotal) || Number(form.total),
        total: Number(form.total),
        shippingCost: Number(form.shippingCost) || 0,
        discountAmount: Number(form.discountAmount) || 0,
      };
      if (editing) {
        await api.put(`/orders/${editing._id}`, payload);
        toast.success('Order updated!');
      } else {
        await api.post('/orders', payload);
        toast.success('Order created!');
      }
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted');
      fetchOrders();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDownloadInvoice = async (o) => {
    try {
      toast.loading('Generating invoice...', { id: 'invoice' });
      const res = await api.get(`/orders/${o._id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${o.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Invoice downloaded!', { id: 'invoice' });
    } catch {
      toast.error('Failed to generate invoice', { id: 'invoice' });
    }
  };

  return (
    <div className="orders-page animate-vibe">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Order pipeline</h1>
              <p className="page-subtitle">
                {total} entries in fulfillment pipeline
                {user?.storageType === 'google_drive' && user?.driveConnected && (
                  <span style={{ marginLeft: 14, color: 'var(--accent)', fontSize: '0.75rem' }}>
                    ● Vault Secured
                  </span>
                )}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <MagneticButton className="btn btn-primary" onClick={openAdd}>
              + New Order
            </MagneticButton>
          </Reveal>
        </div>
      </div>

      <div className="page-body">

        {/* ── Stats row ── */}
        {loading && !stats ? (
          <StatsLoadingGrid />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {[
                { label: 'Total Volume', value: stats.total || 0, color: 'var(--text-primary)' },
                { label: 'Pending Action', value: stats.pending || 0, color: '#FBBF24' },
                { label: 'Fulfillment', value: stats.delivered || 0, color: '#34D399' },
                { label: 'Net Sales', value: formatCurrency(stats.revenue), color: 'var(--accent)', isText: true },
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

        {/* ── Status filters ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['', 'Pending', 'Processing', 'Stitching', 'Ready', 'Shipped', 'Delivered', 'Cancelled'].map(s => {
            const active = statusFilter === s;
            const st = s ? STATUS_STYLE[s] : null;
            return (
              <button
                key={s || 'all'}
                onClick={() => { setStatusFilter(s); setPage(1); }}
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
                {s || 'All States'}
              </button>
            );
          })}
        </div>

        {/* ── Search & Canal selection ── */}
        <div className="table-toolbar" style={{ marginTop: 0, marginBottom: 24, display: 'flex', gap: 16 }}>
          <div className="search-input-wrapper" style={{ maxWidth: 380, flex: 1 }}>
            <span className="search-icon" style={{ color: 'var(--text-faint)' }}>🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search reference, customer…"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="form-select status-filter"
            style={{ maxWidth: 180 }}
            value={channelFilter}
            onChange={e => { setChannelFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Channels</option>
            {CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <Reveal delay={0.05}>
          <div className="table-container">
            {loading ? (
              <TableLoadingRows cols={9} rows={7} />
            ) : loadError ? (
              <QueryErrorState message={loadError} onRetry={fetchOrders} />
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📦</div>
                <h3>No orders yet</h3>
                <p>Start building your catalog of sales here.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer</th>
                    <th>Value</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Tracking</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, idx) => {
                    const st = STATUS_STYLE[o.status] || STATUS_STYLE['Pending'];
                    return (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.35 }}
                        className="hover-lift"
                      >
                        <td>
                          <span className="id-chip">{o.orderId}</span>
                        </td>
                        <td>
                          <div className="cell-primary">{o.customerName || o.customerId}</div>
                          {o.customerPhone && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 2 }}>
                              {o.customerPhone}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="cell-primary" style={{ fontWeight: 700 }}>
                            {formatCurrency(o.total)}
                          </div>
                          {o.discountAmount > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#34D399', marginTop: 2 }}>
                              -{formatCurrency(o.discountAmount)}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {o.channel || '—'}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '3px 10px', borderRadius: 99,
                            fontSize: '0.62rem', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            color: st.color, background: st.bg,
                            border: `1px solid ${st.border}`,
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          {o.priority !== 'Normal' ? (
                            <span className={`priority-flag ${o.priority.toLowerCase()}`} style={{
                              fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
                              padding: '2px 8px', borderRadius: 4,
                              background: o.priority === 'Urgent' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                              color: o.priority === 'Urgent' ? '#F87171' : '#FBBF24',
                              border: `1px solid ${o.priority === 'Urgent' ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)'}`,
                            }}>
                              {o.priority}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.2, fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                        <td>
                          {o.trackingNumber ? (
                            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.82rem' }}>
                              #{o.trackingNumber}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.2, fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>
                          {o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownloadInvoice(o)}
                              style={{
                                width: 30, height: 30, borderRadius: 7,
                                border: '1px solid rgba(52,211,153,0.3)',
                                background: 'rgba(52,211,153,0.1)', color: '#34D399',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '0.78rem',
                              }}
                              title="Download Invoice"
                            >📄</motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(o)}
                              style={{
                                width: 30, height: 30, borderRadius: 7,
                                border: '1px solid var(--accent-border)',
                                background: 'var(--accent-soft)', color: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '0.78rem',
                              }}
                              title="Edit Order"
                            >✏️</motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(o._id)}
                              style={{
                                width: 30, height: 30, borderRadius: 7,
                                border: '1px solid rgba(248,113,113,0.25)',
                                background: 'rgba(248,113,113,0.08)', color: '#F87171',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '0.78rem',
                              }}
                              title="Delete Order"
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
              style={{ border: '1px solid var(--accent-border)', maxWidth: 620 }}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editing ? '✏️ Edit Order' : '+ New Order'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: 10 }}>
                <form onSubmit={handleSave}>

                  {/* Customer Identity */}
                  <div className="section-label">Client identity</div>
                  <div className="form-group">
                    <label className="form-label">Client Account *</label>
                    {customers.length > 0 ? (
                      <select
                        className="form-select"
                        value={form.customerId}
                        onChange={e => {
                          const c = customers.find(x => x.customerId === e.target.value);
                          set('customerId', e.target.value);
                          if (c) {
                            set('customerName', c.fullName);
                            set('customerPhone', c.phone || '');
                            set('shippingAddress', c.address || '');
                          }
                        }}
                        required
                      >
                        <option value="">Selection required</option>
                        {customers.map(c => (
                          <option key={c._id} value={c.customerId}>
                            {c.customerId} — {c.fullName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="form-input"
                        value={form.customerId}
                        onChange={e => set('customerId', e.target.value)}
                        placeholder="e.g. CUS-1001"
                        required
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipping Address</label>
                    <textarea
                      className="form-textarea"
                      value={form.shippingAddress}
                      onChange={e => set('shippingAddress', e.target.value)}
                      rows={2}
                      placeholder="Full delivery address…"
                    />
                  </div>

                  {/* Commercials */}
                  <div className="section-label">Commercial parameters</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Order Subtotal</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.subtotal}
                        onChange={e => {
                          const sub = Number(e.target.value);
                          set('subtotal', e.target.value);
                          set('total', (sub - Number(form.discountAmount || 0) + Number(form.shippingCost || 0)).toString());
                        }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount Applied</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.discountAmount}
                        onChange={e => {
                          const disc = Number(e.target.value);
                          set('discountAmount', e.target.value);
                          set('total', (Number(form.subtotal || 0) - disc + Number(form.shippingCost || 0)).toString());
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shipping Handling</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.shippingCost}
                        onChange={e => {
                          const ship = Number(e.target.value);
                          set('shippingCost', e.target.value);
                          set('total', (Number(form.subtotal || 0) - Number(form.discountAmount || 0) + ship).toString());
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Grand Total</label>
                      <input
                        className="form-input"
                        style={{ border: '1px solid var(--accent-border)', color: 'var(--accent)', fontWeight: 800 }}
                        type="number"
                        value={form.total}
                        onChange={e => set('total', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Logistics */}
                  <div className="section-label">Logistics & fulfillment</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Fulfillment Phase</label>
                      <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority Level</label>
                      <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Acquisition Channel</label>
                      <select className="form-select" value={form.channel} onChange={e => set('channel', e.target.value)}>
                        {CHANNELS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Waybill Tracking</label>
                      <input
                        className="form-input"
                        value={form.trackingNumber}
                        onChange={e => set('trackingNumber', e.target.value)}
                        placeholder="e.g. TCS-78291..."
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                      Discard
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Syncing…' : editing ? 'Update Order' : 'Capture Order'}
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
