import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fabric', 'Embroidery', 'Stitching', 'Packaging', 'Printing', 'Accessories', 'Wholesale', 'Other'];
const COUNTRIES = ['Pakistan', 'China', 'India', 'Bangladesh', 'Turkey', 'UAE', 'Other'];
const EMPTY = { name:'', contactPerson:'', email:'', phone:'', whatsapp:'', address:'', city:'', country:'Pakistan', category:'Fabric', materials:'', rating:'', leadTimeDays:'', minimumOrder:'', paymentTerms:'', notes:'' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
      if (categoryFilter) params.set('category', categoryFilter);
      const [res, statsRes] = await Promise.all([
        api.get(`/suppliers?${params}`),
        api.get('/suppliers/stats/summary'),
      ]);
      setSuppliers(res.data.suppliers);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ ...EMPTY, ...s, materials: Array.isArray(s.materials) ? s.materials.join(', ') : '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, materials: form.materials ? form.materials.split(',').map(m => m.trim()).filter(Boolean) : [], rating: form.rating ? Number(form.rating) : undefined, leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : undefined };
      if (editing) { await api.put(`/suppliers/${editing._id}`, payload); toast.success('Supplier updated!'); }
      else { await api.post('/suppliers', payload); toast.success('Supplier added!'); }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try { await api.delete(`/suppliers/${id}`); toast.success('Supplier deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const stars = (r) => r ? '★'.repeat(r) + '☆'.repeat(5 - r) : '—';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Suppliers</h1>
            <p className="page-subtitle">{total} suppliers · manage your supply chain</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Supplier</button>
        </div>
      </div>

      <div className="page-body">
        {stats && (
          <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', marginBottom:24 }}>
            <div className="stat-card">
              <div className="stat-label">Total Suppliers</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active</div>
              <div className="stat-value" style={{ color:'var(--success)' }}>{stats.active}</div>
            </div>
          </div>
        )}

        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search suppliers…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : suppliers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⊞</div>
                <h3>No suppliers yet</h3>
                <p>Add your fabric, embroidery, and stitching vendors</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Supplier</th><th>Category</th><th>Contact</th>
                    <th>Location</th><th>Lead Time</th><th>Rating</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(s => (
                    <tr key={s._id}>
                      <td><span className="id-chip">{s.supplierId}</span></td>
                      <td>
                        <div className="cell-primary">{s.name}</div>
                        {s.contactPerson && <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{s.contactPerson}</div>}
                      </td>
                      <td><span className="badge badge-draft">{s.category}</span></td>
                      <td>
                        <div style={{ fontSize:'0.78rem' }}>{s.phone || '—'}</div>
                        {s.email && <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{s.email}</div>}
                      </td>
                      <td style={{ fontSize:'0.78rem' }}>{[s.city, s.country].filter(Boolean).join(', ') || '—'}</td>
                      <td style={{ fontSize:'0.78rem' }}>{s.leadTimeDays ? `${s.leadTimeDays}d` : '—'}</td>
                      <td style={{ color:'var(--warning)', fontSize:'0.8rem', letterSpacing:1 }}>{stars(s.rating)}</td>
                      <td><span className={`badge badge-${s.isActive ? 'active' : 'archived'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon btn-sm" onClick={() => openEdit(s)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={() => handleDelete(s._id)} style={{ color:'var(--error)' }}>✕</button>
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
              <h2 className="modal-title">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="section-label">Basic Info</div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Supplier Name *</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Ali Fabrics, Master Embroidery" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-input" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="Name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 0000000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input className="form-input" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+92 300 0000000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
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
                </div>

                <div className="section-label">Terms & Performance</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Lead Time (days)</label>
                    <input className="form-input" type="number" value={form.leadTimeDays} onChange={e => set('leadTimeDays', e.target.value)} placeholder="7" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minimum Order</label>
                    <input className="form-input" value={form.minimumOrder} onChange={e => set('minimumOrder', e.target.value)} placeholder="e.g. 10 meters, PKR 5000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <input className="form-input" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} placeholder="e.g. 50% advance, net 30" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating (1–5)</label>
                    <input className="form-input" type="number" value={form.rating} onChange={e => set('rating', e.target.value)} min="1" max="5" placeholder="5" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Materials Supplied (comma-separated)</label>
                    <input className="form-input" value={form.materials} onChange={e => set('materials', e.target.value)} placeholder="e.g. Lawn, Chiffon, Silk" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.isActive === false ? 'false' : 'true'} onChange={e => set('isActive', e.target.value === 'true')}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Supplier'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
