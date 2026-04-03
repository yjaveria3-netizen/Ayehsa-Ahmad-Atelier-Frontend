import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Lawn', 'Chiffon', 'Silk', 'Linen', 'Cotton', 'Embroidered', 'Formal', 'Casual', 'Bridal', 'Other'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom', 'Free Size'];
const EMPTY = { name:'', category:'', size:'', color:'', price:'', stockQty:'', imageLink:'' };

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name:p.name, category:p.category, size:p.size||'', color:p.color||'', price:p.price, stockQty:p.stockQty, imageLink:p.imageLink||'' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, form);
        toast.success('Product updated & synced to Sheets!');
      } else {
        await api.post('/products', form);
        toast.success('Product added & synced to Sheets!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">{total} products total{user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing to Google Sheets</>}</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <div className="page-body">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-container">
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◆</div>
                <h3>No products yet</h3>
                <p>Add your first product to get started</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product ID</th><th>Name</th><th>Category</th><th>Size</th><th>Color</th>
                    <th>Price (PKR)</th><th>Stock</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td><code style={{ fontSize:'0.78rem', color:'var(--gold)', background:'rgba(201,169,110,0.08)', padding:'2px 6px', borderRadius:4 }}>{p.productId}</code></td>
                      <td>
                        <div className="cell-primary">{p.name}</div>
                        {p.imageLink && <a href={p.imageLink} target="_blank" rel="noreferrer" style={{ fontSize:'0.72rem', color:'var(--gold)' }}>View image ↗</a>}
                      </td>
                      <td>{p.category}</td>
                      <td>{p.size || '—'}</td>
                      <td>{p.color || '—'}</td>
                      <td className="cell-primary">PKR {Number(p.price).toLocaleString()}</td>
                      <td>
                        <span style={{ color: p.stockQty <= 5 ? 'var(--error)' : p.stockQty <= 15 ? 'var(--warning)' : 'var(--success)' }}>
                          {p.stockQty}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-icon btn-sm" onClick={() => openEdit(p)} title="Edit">✎</button>
                          <button className="btn-icon btn-sm" onClick={() => handleDelete(p._id)} title="Delete" style={{ color:'var(--error)' }}>✕</button>
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
              <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>←</button>
              <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === totalPages}>→</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(p=>({...p, name:e.target.value}))} placeholder="e.g. Embroidered Lawn Suit" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={form.category} onChange={e => setForm(p=>({...p, category:e.target.value}))} required>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Size</label>
                    <select className="form-select" value={form.size} onChange={e => setForm(p=>({...p, size:e.target.value}))}>
                      <option value="">Select size</option>
                      {SIZES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input className="form-input" value={form.color} onChange={e => setForm(p=>({...p, color:e.target.value}))} placeholder="e.g. Ivory, Rose Gold" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (PKR) *</label>
                    <input className="form-input" type="number" value={form.price} onChange={e => setForm(p=>({...p, price:e.target.value}))} placeholder="0" required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input className="form-input" type="number" value={form.stockQty} onChange={e => setForm(p=>({...p, stockQty:e.target.value}))} placeholder="0" min="0" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Image Link</label>
                    <input className="form-input" value={form.imageLink} onChange={e => setForm(p=>({...p, imageLink:e.target.value}))} placeholder="https://drive.google.com/..." />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? '⟳ Saving…' : editing ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
