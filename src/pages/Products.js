import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Lawn','Chiffon','Silk','Linen','Cotton','Embroidered','Formal','Casual','Bridal','Other'];
const SIZES = ['XS','S','M','L','XL','XXL','Custom','Free Size'];
const EMPTY = { name:'', category:'', size:'', color:'', price:'', stockQty:'' };

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

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

  const openAdd = () => {
    setEditing(null); setForm(EMPTY);
    setImageFile(null); setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name:p.name, category:p.category, size:p.size||'', color:p.color||'', price:p.price, stockQty:p.stockQty });
    setImageFile(null);
    setImagePreview(p.imageThumbnailUrl || p.imageViewUrl || null);
    setShowModal(true);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageChange(file);
    else toast.error('Please drop an image file');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Use FormData to send image + fields together
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editing) {
        await api.put(`/products/${editing._id}`, formData, config);
        toast.success('Product updated & synced to Sheets!');
      } else {
        await api.post('/products', formData, config);
        toast.success(imageFile
          ? 'Product added! Image saved to Drive & synced to Sheets!'
          : 'Product added & synced to Sheets!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? Its image will also be removed from Drive.')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">
              {total} products total
              {user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Images sync to Drive → Images/Product</>}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-toolbar">
          <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input className="form-input search-input" placeholder="Search products…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
            </div>
            <select className="form-select" style={{ width:'auto' }} value={categoryFilter} onChange={e=>{setCategoryFilter(e.target.value);setPage(1);}}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
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
                  <tr><th>Image</th><th>Product ID</th><th>Name</th><th>Category</th><th>Size</th><th>Color</th><th>Price (PKR)</th><th>Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>
                        {p.imageThumbnailUrl || p.imageViewUrl ? (
                          <a href={p.imageViewUrl} target="_blank" rel="noreferrer">
                            <img
                              src={p.imageThumbnailUrl || p.imageViewUrl}
                              alt={p.name}
                              style={{ width:44, height:44, objectFit:'cover', borderRadius:6, border:'1px solid var(--border)', display:'block' }}
                              onError={e => { e.target.style.display='none'; }}
                            />
                          </a>
                        ) : (
                          <div style={{ width:44, height:44, borderRadius:6, background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:'1.1rem' }}>◆</div>
                        )}
                      </td>
                      <td><code style={{ fontSize:'0.78rem', color:'var(--gold-dark)', background:'rgba(157,110,42,0.08)', padding:'2px 6px', borderRadius:4 }}>{p.productId}</code></td>
                      <td className="cell-primary">{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.size || '—'}</td>
                      <td>{p.color || '—'}</td>
                      <td className="cell-primary">PKR {Number(p.price).toLocaleString()}</td>
                      <td>
                        <span style={{ color: p.stockQty<=5?'var(--error)':p.stockQty<=15?'var(--warning)':'var(--success)', fontWeight:500 }}>
                          {p.stockQty}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-icon btn-sm" onClick={()=>openEdit(p)} title="Edit">✎</button>
                          <button className="btn-icon btn-sm" onClick={()=>handleDelete(p._id)} title="Delete" style={{ color:'var(--error)' }}>✕</button>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal" style={{ maxWidth:680 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>

                {/* Image Upload Area */}
                <div className="form-group" style={{ marginBottom:20 }}>
                  <label className="form-label">Product Image</label>
                  <div
                    onClick={()=>fileInputRef.current.click()}
                    onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--border-light)'}`,
                      borderRadius: 8,
                      padding: imagePreview ? 0 : '32px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? 'rgba(157,110,42,0.04)' : 'var(--bg-secondary)',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      position: 'relative',
                      minHeight: imagePreview ? 200 : 'auto',
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ width:'100%', maxHeight:240, objectFit:'cover', display:'block' }}
                        />
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'all 0.2s' }}
                          onMouseEnter={e=>e.currentTarget.style.opacity=1}
                          onMouseLeave={e=>e.currentTarget.style.opacity=0}
                        >
                          <div style={{ background:'rgba(0,0,0,0.55)', color:'#fff', padding:'8px 16px', borderRadius:6, fontSize:'0.8rem', backdropFilter:'blur(4px)' }}>
                            Click or drop to change image
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize:'2rem', marginBottom:10, opacity:0.4 }}>◆</div>
                        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', marginBottom:4 }}>
                          <strong>Click to upload</strong> or drag & drop
                        </p>
                        <p style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>
                          JPEG, PNG, WEBP, GIF — max 10MB
                        </p>
                        {user?.driveConnected && (
                          <p style={{ color:'var(--gold-dark)', fontSize:'0.75rem', marginTop:8 }}>
                            ✓ Image will be saved to Drive → Images/Product
                          </p>
                        )}
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display:'none' }}
                      onChange={e=>handleImageChange(e.target.files[0])}
                    />
                  </div>
                  {imageFile && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8, padding:'6px 10px', background:'rgba(46,125,82,0.06)', border:'1px solid rgba(46,125,82,0.2)', borderRadius:6 }}>
                      <span style={{ fontSize:'0.78rem', color:'var(--success)' }}>✓ {imageFile.name} ({(imageFile.size/1024/1024).toFixed(1)}MB)</span>
                      <button type="button" onClick={()=>{setImageFile(null);setImagePreview(editing?.imageThumbnailUrl||null);}} style={{ background:'none', color:'var(--text-muted)', fontSize:'0.85rem', cursor:'pointer' }}>✕</button>
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Embroidered Lawn Suit" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} required>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Size</label>
                    <select className="form-select" value={form.size} onChange={e=>setForm(p=>({...p,size:e.target.value}))}>
                      <option value="">Select size</option>
                      {SIZES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input className="form-input" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} placeholder="e.g. Ivory, Rose Gold" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (PKR) *</label>
                    <input className="form-input" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input className="form-input" type="number" value={form.stockQty} onChange={e=>setForm(p=>({...p,stockQty:e.target.value}))} placeholder="0" min="0" />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving
                      ? (imageFile ? '⟳ Uploading image…' : '⟳ Saving…')
                      : (editing ? 'Update Product' : 'Add Product')}
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