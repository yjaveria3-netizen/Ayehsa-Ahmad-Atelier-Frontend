import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Lawn','Chiffon','Silk','Linen','Cotton','Embroidered','Formal','Casual','Bridal','Pret','Luxury Pret','Co-ords','Kurta','Shalwar Kameez','Abayas','Other'];
const SIZES = ['XS','S','M','L','XL','XXL','XXXL','Custom','Free Size','6','8','10','12','14','16'];
const SEASONS = ['SS24','AW24','SS25','AW25','SS26','AW26','Year-Round','Limited Edition','Custom'];
const STATUSES = ['Active','Draft','Archived','Out of Stock'];
const EMPTY = { name:'', description:'', category:'', subcategory:'', collection:'', season:'Year-Round', fabric:'', careInstructions:'', costPrice:'', price:'', salePrice:'', currency:'PKR', sku:'', stockQty:'', lowStockAlert:'5', status:'Active', isFeatured:false, tags:'' };

export default function Products() {
  const { user, formatCurrency } = useAuth();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [stats, setStats] = useState(null);
  const fileRef = useRef();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:15 });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);
      const [res, s] = await Promise.all([
        api.get(`/products?${params}`),
        api.get('/products/stats/summary').catch(() => ({ data:{} })),
      ]);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, currency: user?.brand?.currency || 'PKR' }); setImageFile(null); setImagePreview(null); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : '' });
    setImageFile(null);
    setImagePreview(p.imageThumbnailUrl || p.imageViewUrl || null);
    setShowModal(true);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (file.size > 10*1024*1024) { toast.error('Image must be under 10MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      Object.entries(payload).forEach(([k,v]) => { if (v !== undefined && v !== '') formData.append(k, typeof v === 'boolean' ? String(v) : v); });
      if (imageFile) formData.append('image', imageFile);
      const cfg = { headers:{ 'Content-Type':'multipart/form-data' } };
      if (editing) { await api.put(`/products/${editing._id}`, formData, cfg); toast.success('Product updated!'); }
      else { await api.post('/products', formData, cfg); toast.success('Product added!'); }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product and its image?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  const margin = (cost, price) => cost && price ? Math.round(((price - cost) / price) * 100) : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">
              {total} products
              {user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Syncing to Sheets</>}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <div className="page-body">
        {stats && (
          <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', marginBottom:20 }}>
            <div className="stat-card"><div className="stat-label">Total Products</div><div className="stat-value">{stats.total || 0}</div></div>
            <div className="stat-card"><div className="stat-label">Low Stock</div><div className="stat-value" style={{ color:'var(--warning)' }}>{stats.lowStock || 0}</div></div>
            <div className="stat-card"><div className="stat-label">Categories</div><div className="stat-value">{stats.categories || 0}</div></div>
            <div className="stat-card"><div className="stat-label">Inventory Value</div><div className="stat-value" style={{ fontSize:'1.3rem' }}>{formatCurrency(stats.totalValue)}</div></div>
          </div>
        )}

        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search products, SKU…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{ width:'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="table-container">
            {loading ? <div className="page-loader"><div className="spinner" /></div> : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">▣</div>
                <h3>No products yet</h3>
                <p>Add your first product to start tracking inventory</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Image</th><th>Product</th><th>Category</th><th>Season</th><th>Price</th><th>Margin</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>
                        {p.imageThumbnailUrl || p.imageViewUrl ? (
                          <a href={p.imageViewUrl} target="_blank" rel="noreferrer">
                            <img src={p.imageThumbnailUrl || p.imageViewUrl} alt={p.name} style={{ width:40, height:40, objectFit:'cover', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', display:'block' }} onError={e => e.target.style.display='none'} />
                          </a>
                        ) : (
                          <div style={{ width:40, height:40, borderRadius:'var(--radius-sm)', background:'var(--bg-raised)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:'0.9rem' }}>▣</div>
                        )}
                      </td>
                      <td>
                        <div className="cell-primary">{p.name}</div>
                        <div style={{ display:'flex', gap:5, marginTop:3, flexWrap:'wrap' }}>
                          <span className="id-chip">{p.productId}</span>
                          {p.sku && <span className="id-chip">{p.sku}</span>}
                          {p.isFeatured && <span style={{ fontSize:'0.6rem', color:'var(--warning)', background:'rgba(245,166,35,0.1)', padding:'1px 5px', borderRadius:3 }}>Featured</span>}
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{p.season}</td>
                      <td>
                        <div className="cell-primary">{formatCurrency(p.isOnSale && p.salePrice ? p.salePrice : p.price)}</div>
                        {p.isOnSale && p.salePrice && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', textDecoration:'line-through' }}>{formatCurrency(p.price)}</div>}
                      </td>
                      <td style={{ fontSize:'0.78rem' }}>
                        {margin(p.costPrice, p.price) !== null
                          ? <span style={{ color: margin(p.costPrice, p.price) > 40 ? 'var(--success)' : margin(p.costPrice, p.price) > 20 ? 'var(--warning)' : 'var(--error)' }}>
                              {margin(p.costPrice, p.price)}%
                            </span>
                          : <span style={{ color:'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <span style={{ color: p.stockQty <= 0 ? 'var(--error)' : p.stockQty <= (p.lowStockAlert || 5) ? 'var(--warning)' : 'var(--success)', fontWeight:500 }}>
                          {p.stockQty}
                        </span>
                        {p.stockQty <= (p.lowStockAlert || 5) && p.stockQty > 0 && <div style={{ fontSize:'0.62rem', color:'var(--warning)' }}>Low stock</div>}
                      </td>
                      <td><span className={`badge badge-${(p.status||'active').toLowerCase().replace(' ','-')}`}>{p.status || 'Active'}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon btn-sm" onClick={() => openEdit(p)}>✎</button>
                          <button className="btn-icon btn-sm" onClick={() => handleDelete(p._id)} style={{ color:'var(--error)' }}>✕</button>
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
          <div className="modal" style={{ maxWidth:720 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                {/* Image upload */}
                <div className="form-group" style={{ marginBottom:18 }}>
                  <label className="form-label">Product Image</label>
                  <div
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleImageChange(f); }}
                    style={{ border:`1px dashed ${dragOver ? 'var(--teal)' : 'var(--border-mid)'}`, borderRadius:'var(--radius)', overflow:'hidden', cursor:'pointer', background: dragOver ? 'var(--teal-soft)' : 'var(--bg-raised)', transition:'all 0.15s', minHeight: imagePreview ? 180 : 100, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }} />
                      : <div style={{ textAlign:'center', padding:'24px 20px' }}>
                          <div style={{ fontSize:'1.5rem', marginBottom:8, opacity:0.3 }}>▣</div>
                          <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>Click to upload or drag & drop</div>
                          <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:4 }}>JPEG, PNG, WEBP — max 10MB</div>
                          {user?.driveConnected && <div style={{ fontSize:'0.68rem', color:'var(--teal)', marginTop:6 }}>Image saves to Google Drive</div>}
                        </div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleImageChange(e.target.files[0])} />
                  {imageFile && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6, fontSize:'0.72rem', color:'var(--success)', background:'var(--success-bg)', padding:'5px 10px', borderRadius:'var(--radius-sm)' }}>
                      <span>✓ {imageFile.name}</span>
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(editing?.imageThumbnailUrl || null); }} style={{ background:'none', color:'var(--text-muted)' }}>✕</button>
                    </div>
                  )}
                </div>

                <div className="section-label">Product Details</div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Embroidered Chiffon Kurta" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Product description…" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                      <option value="">Select</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Season</label>
                    <select className="form-select" value={form.season} onChange={e => set('season', e.target.value)}>
                      {SEASONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Collection</label>
                    <input className="form-input" value={form.collection} onChange={e => set('collection', e.target.value)} placeholder="e.g. Eid 2025" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric</label>
                    <input className="form-input" value={form.fabric} onChange={e => set('fabric', e.target.value)} placeholder="e.g. Pure Lawn, Chiffon" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="section-label">Pricing & Inventory</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Cost Price</label>
                    <input className="form-input" type="number" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Retail Price *</label>
                    <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sale Price</label>
                    <input className="form-input" type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} placeholder="Optional" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input className="form-input" type="number" value={form.stockQty} onChange={e => set('stockQty', e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low Stock Alert At</label>
                    <input className="form-input" type="number" value={form.lowStockAlert} onChange={e => set('lowStockAlert', e.target.value)} placeholder="5" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. eid, luxury, printed" />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? (imageFile ? 'Uploading…' : 'Saving…') : editing ? 'Update Product' : 'Add Product'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
