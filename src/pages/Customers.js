import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { fullName:'', email:'', phone:'', address:'', dateJoined:'' };

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const res = await api.get(`/customers?${params}`);
      setCustomers(res.data.customers);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ fullName:c.fullName, email:c.email||'', phone:c.phone||'', address:c.address||'', dateJoined: c.dateJoined ? c.dateJoined.split('T')[0] : '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await api.put(`/customers/${editing._id}`, form); toast.success('Customer updated & synced!'); }
      else { await api.post('/customers', form); toast.success('Customer added & synced to Sheets!'); }
      setShowModal(false);
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await api.delete(`/customers/${id}`); toast.success('Customer deleted'); fetchCustomers(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">{total} customers registered{user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing</>}</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <span className="search-icon">⌕</span>
            <input className="form-input search-input" placeholder="Search by name, email, phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : customers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">○</div>
                <h3>No customers yet</h3>
                <p>Add your first customer to get started</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Customer ID</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Date Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id}>
                      <td><code style={{ fontSize:'0.78rem', color:'var(--gold)', background:'rgba(201,169,110,0.08)', padding:'2px 6px', borderRadius:4 }}>{c.customerId}</code></td>
                      <td className="cell-primary">{c.fullName}</td>
                      <td>{c.email || '—'}</td>
                      <td>{c.phone || '—'}</td>
                      <td style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.address || '—'}</td>
                      <td>{c.dateJoined ? new Date(c.dateJoined).toLocaleDateString('en-PK') : '—'}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
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
            <div className="pagination" style={{ padding:'16px 20px' }}>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===1}>←</button>
              <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page===totalPages}>→</button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.fullName} onChange={e=>setForm(p=>({...p,fullName:e.target.value}))} placeholder="e.g. Sara Khan" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="sara@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+92 300 0000000" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Address</label>
                    <textarea className="form-textarea" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} placeholder="Full address…" rows={2} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Joined</label>
                    <input className="form-input" type="date" value={form.dateJoined} onChange={e=>setForm(p=>({...p,dateJoined:e.target.value}))} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⟳ Saving…' : editing ? 'Update' : 'Add Customer'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
