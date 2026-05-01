import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, MagneticButton, GlowCard } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const CATEGORIES = [
  'Lawn', 'Chiffon', 'Silk', 'Linen', 'Cotton', 'Embroidered',
  'Formal', 'Casual', 'Bridal', 'Pret', 'Luxury Pret', 'Co-ords',
  'Kurta', 'Shalwar Kameez', 'Abayas', 'Other',
];
const SEASONS = ['SS24', 'AW24', 'SS25', 'AW25', 'SS26', 'AW26', 'Year-Round', 'Limited Edition', 'Custom'];
const STATUSES = ['Active', 'Draft', 'Archived', 'Out of Stock'];

const EMPTY = {
  name: '', description: '', category: '', subcategory: '', collection: '',
  season: 'Year-Round', fabric: '', careInstructions: '', costPrice: '', price: '',
  salePrice: '', currency: 'PKR', sku: '', stockQty: '', lowStockAlert: '5',
  status: 'Active', isFeatured: false, tags: '',
};

/* ── Image Upload Zone ─────────────────────────────────────────── */
function ImageUploadZone({ preview, onFileSelect, onRemove }) {
  const fileRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) onFileSelect(file);
    else toast.error('Please drop an image file');
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label className="form-label">Product Image</label>

      {/* Drop zone */}
      <div
        onClick={() => !preview && fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${drag ? 'var(--accent)' : preview ? 'var(--border-subtle)' : 'var(--border-faint)'}`,
          borderRadius: 12,
          background: drag ? 'var(--accent-soft)' : preview ? 'var(--bg-layer2)' : 'rgba(255,255,255,0.015)',
          transition: 'all 0.2s ease',
          cursor: preview ? 'default' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          minHeight: preview ? 'auto' : 130,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', position: 'relative' }}
            >
              <img
                src={preview}
                alt="Product"
                style={{
                  width: '100%',
                  maxHeight: 260,
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: 10,
                }}
              />
              {/* Overlay buttons */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                gap: 10, background: 'rgba(6,5,14,0.55)',
                borderRadius: 10, opacity: 0, transition: 'opacity 0.2s',
              }}
                className="img-overlay"
              >
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); fileRef.current.click(); }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '7px 14px' }}
                >
                  🔄 Replace
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove(); }}
                  className="btn btn-danger"
                  style={{ fontSize: '0.72rem', padding: '7px 14px' }}
                >
                  🗑️ Remove
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '28px 20px' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 8, opacity: 0.6 }}>🖼️</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                {drag ? 'Drop image here' : 'Click or drag & drop to upload'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                JPG · PNG · WEBP · GIF · Max 10 MB
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }}
      />

      {/* Quick action buttons when no preview */}
      {!preview && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: '0.7rem', padding: '6px 14px', flex: 1 }}
            onClick={() => fileRef.current.click()}
          >
            📁 Browse Files
          </button>
        </div>
      )}

      {/* Preview action buttons when image is set */}
      {preview && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.7rem', padding: '6px 14px', flex: 1 }}
            onClick={() => fileRef.current.click()}
          >
            🔄 Replace Image
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ fontSize: '0.7rem', padding: '6px 14px' }}
            onClick={onRemove}
          >
            🗑️ Remove
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Products Page ─────────────────────────────────────── */
export default function Products() {
  const { user, formatCurrency } = useAuth();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [stats, setStats] = useState(null);

  /* ── Data fetching ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);
      const [res, s] = await Promise.all([
        api.get(`/products?${params}`),
        api.get('/products/stats/summary').catch(() => ({ data: {} })),
      ]);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setStats(s.data);
    } catch {
      setLoadError('Unable to load products right now.');
      toast.error('Failed to load products');
    }
    finally { setLoading(false); }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── Form helpers ── */
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, currency: user?.brand?.currency || 'PKR' });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : '' });
    setImageFile(null);
    setImagePreview(p.imageThumbnailUrl || p.imageViewUrl || null);
    setRemoveImage(false);
    setShowModal(true);
  };

  /* ── Image handlers ── */
  const handleFileSelect = (file) => {
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  /* ── Save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== '') formData.append(k, typeof v === 'boolean' ? String(v) : v);
      });
      if (imageFile) formData.append('image', imageFile);
      if (removeImage) formData.append('removeImage', 'true');

      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        await api.put(`/products/${editing._id}`, formData, cfg);
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, cfg);
        toast.success('Product added!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product and its image?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      console.error('Delete product error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  /* ── Render ── */
  return (
    <div className="products-page animate-vibe">

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Inventory</h1>
              <p className="page-subtitle">
                {total} active items in your fashion catalog
                {user?.storageType === 'google_drive' && user?.driveConnected && (
                  <span style={{ marginLeft: 14, color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700 }}>
                    ● Vault Secured
                  </span>
                )}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <button className="btn btn-primary" onClick={openAdd}>
              + Add Item
            </button>
          </Reveal>
        </div>
      </div>

      <div className="page-body">

        {/* Stats Row */}
        {loading && !stats ? (
          <StatsLoadingGrid count={4} />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {[
                { label: 'Total Items', value: stats.total || 0, color: 'var(--text-primary)' },
                { label: 'Low Stock', value: stats.lowStock || 0, color: '#FBBF24' },
                { label: 'Categories', value: stats.categories || 0, color: 'var(--text-primary)' },
                { label: 'Inventory Value', value: formatCurrency(stats.totalValue), color: 'var(--accent)', isText: true },
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

        {/* Filters & Search */}
        <div className="commerce-toolbar" style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ maxWidth: 380 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input search-input"
              placeholder="Search name, SKU, tag…"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              className="form-select"
              style={{ width: 180, padding: '10px 18px', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              className="form-select"
              style={{ width: 160, padding: '10px 18px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <Reveal delay={0.05}>
          <div className="table-container">
            {loading ? (
              <TableLoadingRows cols={9} rows={7} />
            ) : loadError ? (
              <QueryErrorState message={loadError} onRetry={fetchProducts} />
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👗</div>
                <h3>No products yet</h3>
                <p>Start building your catalog by adding your first item.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Identity</th>
                    <th>Category</th>
                    <th>Season</th>
                    <th>Price</th>
                    <th>Margin</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.35 }}
                    >
                      <td>
                        {p.imageThumbnailUrl || p.imageViewUrl ? (
                          <div className="product-image-cell" style={{ position: 'relative', width: 44, height: 44 }}>
                            <img
                              src={p.imageThumbnailUrl || p.imageViewUrl}
                              alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-glass)' }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: 44, height: 44, borderRadius: 10, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'var(--accent-soft)', fontSize: '1.2rem',
                            border: '1px solid var(--accent-border)',
                          }}>
                            👗
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="cell-primary" style={{ marginBottom: 4 }}>{p.name}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <span className="id-chip">{p.productId}</span>
                          {p.sku && <span className="id-chip" style={{ background: 'var(--bg-layer2)', color: 'var(--text-muted)' }}>{p.sku}</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.category}</td>
                      <td style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>{p.season}</td>
                      <td>
                        <div className="cell-primary" style={{ fontSize: '0.9rem' }}>
                          {formatCurrency(p.isOnSale && p.salePrice ? p.salePrice : p.price)}
                        </div>
                        {p.isOnSale && p.salePrice && (
                          <div style={{ fontSize: '0.7rem', opacity: 0.4, textDecoration: 'line-through' }}>
                            {formatCurrency(p.price)}
                          </div>
                        )}
                      </td>
                      <td>
                        {margin(p.costPrice, p.price) !== null ? (
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: margin(p.costPrice, p.price) > 40 ? '#34D399'
                              : margin(p.costPrice, p.price) > 20 ? '#FBBF24' : '#C97A6D',
                          }}>
                            {margin(p.costPrice, p.price)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        {p.stockQty <= 0 ? (
                          <span style={{ background: 'rgba(201,122,109,0.1)', color: '#C97A6D', padding: '4px 10px', borderRadius: 99, fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', border: '1px solid rgba(201,122,109,0.2)' }}>
                            Sold Out
                          </span>
                        ) : p.stockQty <= (p.lowStockAlert || 5) ? (
                          <span style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', padding: '4px 10px', borderRadius: 99, fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', border: '1px solid rgba(251,191,36,0.2)' }}>
                            Low: {p.stockQty}
                          </span>
                        ) : (
                          <span style={{ color: '#34D399', fontWeight: 800, fontSize: '0.9rem' }}>
                            {p.stockQty}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${(p.status || 'active').toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.6rem' }}>
                          {p.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(p)}
                            style={{
                              width: 32, height: 32, borderRadius: 8,
                              border: '1px solid var(--accent-border)',
                              background: 'var(--accent-soft)', color: 'var(--accent)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: '0.85rem',
                            }}
                          >✏️</motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(p._id)}
                            style={{
                              width: 32, height: 32, borderRadius: 8,
                              border: '1px solid rgba(201,122,109,0.2)',
                              background: 'rgba(201,122,109,0.05)', color: '#C97A6D',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: '0.85rem',
                            }}
                          >🗑️</motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
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
              style={{ border: '1px solid var(--accent-border)', maxWidth: 640 }}
            >
              <div className="modal-header">
                <h2 className="modal-title">
                  {editing ? '✏️ Edit Product' : '+ New Product'}
                </h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSave}>

                  {/* ── Image Upload ── */}
                  <ImageUploadZone
                    preview={imagePreview}
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemoveImage}
                  />

                  {/* ── Identity ── */}
                  <div className="section-label">Identity</div>

                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      required
                      placeholder="e.g. Silk Embroidered Caftan"
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={e => set('category', e.target.value)}
                        required
                      >
                        <option value="">Select category</option>
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
                      <label className="form-label">SKU</label>
                      <input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. SILK-001" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* ── Pricing ── */}
                  <div className="section-label">Pricing &amp; Stock</div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Cost Price</label>
                      <input className="form-input" type="number" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Retail Price *</label>
                      <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required placeholder="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stock Quantity</label>
                      <input className="form-input" type="number" value={form.stockQty} onChange={e => set('stockQty', e.target.value)} placeholder="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Low Stock Alert</label>
                      <input className="form-input" type="number" value={form.lowStockAlert} onChange={e => set('lowStockAlert', e.target.value)} placeholder="5" />
                    </div>
                  </div>

                  {/* ── Tags ── */}
                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <input
                      className="form-input"
                      value={form.tags}
                      onChange={e => set('tags', e.target.value)}
                      placeholder="bridal, embroidered, SS25  (comma separated)"
                    />
                  </div>

                  {/* ── Actions ── */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 28 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} disabled={saving}>
                      <span>{saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}</span>
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover overlay CSS */}
      <style>{`
        .img-overlay { pointer-events: none; }
        div:hover > .img-overlay { opacity: 1 !important; pointer-events: auto; }
      `}</style>
    </div>
  );
}