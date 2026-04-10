import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SEGMENTS = ['VIP','Loyal','Regular','New','At Risk','Inactive'];
const SOURCES = ['Instagram','Website','WhatsApp','Walk-in','Referral','Facebook','TikTok','Other'];
const GENDERS = ['Female','Male','Non-binary','Prefer not to say'];
const COUNTRIES = ['Pakistan','United States','United Kingdom','UAE','Saudi Arabia','India','Bangladesh','Other'];
const EMPTY = { fullName:'', email:'', phone:'', whatsapp:'', address:'', city:'', country:'Pakistan', gender:'Female', segment:'New', source:'Instagram', isSubscribed:true, notes:'', tags:'', dateJoined:'' };

export default function Customers() {
  const { user, formatCurrency } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
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
      if (segmentFilter) params.set('segment', segmentFilter);
      const [res, s] = await Promise.all([
        api.get(`/customers?${params}`),
        api.get('/customers/stats/summary').catch(() => ({ data:{} })),
      ]);
      setCustomers(res.data.customers);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [page, search, segmentFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ ...EMPTY, ...c, tags: Array.isArray(c.tags) ? c.tags.join(', ') : '', dateJoined: c.dateJoined ? c.dateJoined.split('T')[0] : '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editing) { await api.put(`/customers/${editing._id}`, payload); toast.success('Customer updated!'); }
      else { await api.post('/customers', payload); toast.success('Customer added!'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await api.delete(`/customers/${id}`); toast.success('Customer deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const SEGMENT_COLORS = { VIP:'var(--warning)', Loyal:'var(--teal)', Regular:'var(--info)', New:'var(--success)', 'At Risk':'var(--error)', Inactive:'var(--text-muted)' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">
              {total} customers
              {user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing</>}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
        </div>
      </div>

      <div className="page-body">
        {stats && (
          <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', marginBottom:20 }}>
            <div className="stat-card"><div className="stat-label">Total Customers</div><div className="stat-value">{stats.total||0}</div></div>
            <div className="stat-card"><div className="stat-label">New This Month</div><div className="stat-value" style={{ color:'var(--success)' }}>+{stats.thisMonth||0}</div></div>
          </div>
        )}

        {/* Segment filter pills */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {['', ...SEGMENTS].map(s => (
            <button key={s} onClick={() => { setSegmentFilter(s); setPage(1); }} style={{
              padding:'4px 12px', borderRadius:999, fontSize:'0.68rem', fontWeight:600, cursor:'pointer',
              background: segmentFilter===s ? (SEGMENT_COLORS[s] || 'var(--teal)') : 'var(--bg-raised)',
              color: segmentFilter===s ? 'var(--bg-void)' : 'var(--text-muted)',
              border: `1px solid ${segmentFilter===s ? (SEGMENT_COLORS[s]||'var(--teal)') : 'var(--border)'}`,
              transition:'all 0.15s',
            }}>{s || 'All Segments'}</button>
          ))}
        </div>

        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <span className="search-icon">⌕</span>
            <input className="form-input search-input" placeholder="Search name, email, phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : customers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⊕</div>
                <h3>No customers yet</h3>
                <p>Start building your customer database</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>ID</th><th>Customer</th><th>Contact</th><th>Location</th><th>Segment</th><th>Source</th><th>Spent</th><th>Orders</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id}>
                      <td><span className="id-chip">{c.customerId}</span></td>
                      <td>
                        <div className="cell-primary">{c.fullName}</div>
                        {c.email && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{c.email}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize:'0.78rem' }}>{c.phone || '—'}</div>
                        {c.whatsapp && c.whatsapp !== c.phone && <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>WA: {c.whatsapp}</div>}
                      </td>
                      <td style={{ fontSize:'0.78rem' }}>{[c.city, c.country].filter(Boolean).join(', ') || '—'}</td>
                      <td>
                        <span className={`badge badge-${(c.segment||'new').toLowerCase().replace(' ','-')}`}>
                          {c.segment || 'New'}
                        </span>
                      </td>
                      <td style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{c.source || '—'}</td>
                      <td className="cell-primary" style={{ fontSize:'0.8rem' }}>{c.totalSpent > 0 ? formatCurrency(c.totalSpent) : '—'}</td>
                      <td style={{ textAlign:'center' }}>{c.totalOrders || 0}</td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon btn-sm" onClick={() => openEdit(c)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={() => handleDelete(c._id)} style={{ color:'var(--error)' }}>✕</button>
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
          <div className="modal" style={{ maxWidth:680 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="section-label">Personal Info</div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} required placeholder="e.g. Sara Ahmed" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 0000000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input className="form-input" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <select className="form-select" value={form.country} onChange={e => set('country', e.target.value)}>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Address</label>
                    <textarea className="form-textarea" value={form.address} onChange={e => set('address', e.target.value)} rows={2} />
                  </div>
                </div>

                <div className="section-label">CRM</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Segment</label>
                    <select className="form-select" value={form.segment} onChange={e => set('segment', e.target.value)}>
                      {SEGMENTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Acquisition Source</label>
                    <select className="form-select" value={form.source} onChange={e => set('source', e.target.value)}>
                      {SOURCES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Joined</label>
                    <input className="form-input" type="date" value={form.dateJoined} onChange={e => set('dateJoined', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Newsletter Subscribed</label>
                    <select className="form-select" value={form.isSubscribed ? 'true' : 'false'} onChange={e => set('isSubscribed', e.target.value === 'true')}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. vip, bridal, repeat-buyer" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Customer'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
