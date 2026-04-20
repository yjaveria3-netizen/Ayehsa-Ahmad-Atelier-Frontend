import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Reveal, StaggerContainer, StaggerItem, MagneticButton, GlowCard, ease } from '../components/Motion';
import useDebounce from '../hooks/useDebounce';
import { QueryErrorState, StatsLoadingGrid, TableLoadingRows } from '../components/QueryState';

const REASONS = ['Wrong Size','Wrong Item','Defective/Damaged','Not as Described','Changed Mind','Duplicate Order','Late Delivery','Quality Issue','Other'];
const TYPES = ['Refund','Exchange','Store Credit'];
const STATUSES = ['Requested','Approved','Item Received','Inspected','Refund Issued','Exchange Dispatched','Completed','Rejected'];
const EMPTY = { orderId:'', customerId:'', reason:'Defective/Damaged', type:'Refund', status:'Requested', refundAmount:'', notes:'' };

const STATUS_CLASSES = {
  'Requested': 'badge-pending',
  'Approved': 'badge-active',
  'Item Received': 'badge-active',
  'Inspected': 'badge-rose',
  'Refund Issued': 'badge-success',
  'Exchange Dispatched': 'badge-success',
  'Completed': 'badge-success',
  'Rejected': 'badge-archived',
};

export default function Returns() {
  const { user, formatCurrency } = useAuth();
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/returns/stats/summary');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const res = await api.get(`/returns?${params.toString()}`);
      setReturns(res.data.returns);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setLoadError('Unable to load returns right now.');
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchReturns();
    fetchStats();
  }, [fetchReturns, fetchStats]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({ orderId:r.orderId, customerId:r.customerId, reason:r.reason, type:r.type, status:r.status, refundAmount:r.refundAmount, notes:r.notes }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/returns/${editing._id}`, form);
        toast.success('Return updated');
      } else {
        await api.post('/returns', form);
        toast.success('Return created');
      }
      setShowModal(false);
      fetchReturns();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this return?')) return;
    try {
      await api.delete(`/returns/${id}`);
      toast.success('Return deleted');
      fetchReturns();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="returns-page animate-vibe">
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Returns</h1>
              <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>{total} cases requiring attention</p>
            </div>
          </Reveal>
          <Reveal delay={0.15} direction="left">
            <MagneticButton className="btn" onClick={openAdd} style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }}>+ Log Return</MagneticButton>
          </Reveal>
        </div>
      </div>

      <div className="page-body">
        {loading && !stats ? (
          <StatsLoadingGrid count={3} />
        ) : stats && (
          <StaggerContainer staggerDelay={0.06} delayStart={0.1}>
            <div className="stats-grid">
               <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                 <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Total Volume</div>
                 <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>{stats.total}</div>
               </GlowCard></StaggerItem>
               <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                 <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Awaiting Resolution</div>
                 <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#FBBF24' }}>{stats.pending}</div>
               </GlowCard></StaggerItem>
               <StaggerItem><GlowCard className="stat-card glass hover-glow" style={{ border: '1px solid var(--accent-soft)' }}>
                 <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>Adjusted Value</div>
                 <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: '#F87171' }}>{formatCurrency(stats.totalRefunded || 0)}</div>
               </GlowCard></StaggerItem>
            </div>
          </StaggerContainer>
        )}

        <div className="table-toolbar" style={{ marginTop: 32 }}>
          <div className="filter-group">
            <div className="search-input-wrapper glass" style={{ border: '1px solid var(--accent-soft)' }}>
              <span className="search-icon" style={{ color: 'var(--accent)' }}>⌕</span>
              <input className="form-input search-input" style={{ background: 'transparent', border: 'none' }} placeholder="Search Reference, Order ID..." value={searchInput} onChange={e=>{setSearchInput(e.target.value);setPage(1);}} />
            </div>
            <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
              <option value="">Status: All Phases</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <Reveal delay={0.05}>
          <div className="card glass overflow-hidden" style={{ border: '1px solid var(--accent-soft)', marginTop: 24 }}>
            <div className="table-container">
              {loading ? (
                <TableLoadingRows cols={8} rows={6} />
              ) : loadError ? (
                <QueryErrorState message={loadError} onRetry={fetchReturns} />
              ) : returns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ color: 'var(--accent)' }}>↩</div>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>No active returns</h3>
                  <p style={{ color: 'var(--text-muted)' }}>When a client requests an exchange or refund, it will appear here.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th>Reference</th><th>Order</th><th>Client</th><th>Reasoning</th><th>Resolution</th><th>Phase</th><th>Refund</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((r, idx) => (
                      <motion.tr 
                        key={r._id} 
                        initial={{ opacity:0, y:8 }} 
                        animate={{ opacity:1, y:0 }} 
                        transition={{ delay: idx * 0.03, duration:0.4 }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      >
                        <td><span className="id-chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{r.returnId}</span></td>
                        <td><span className="id-chip" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{r.orderId}</span></td>
                        <td>
                           <div className="cell-primary" style={{ fontWeight: 600 }}>{r.customerName || r.customerId}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem', opacity: 0.6 }}>{r.reason}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>{r.type}</td>
                        <td><span className={`badge badge-${(r.status||'requested').toLowerCase().replace(' ','-')}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{r.status}</span></td>
                        <td className="cell-primary" style={{ fontWeight: 800 }}>{formatCurrency(r.refundAmount || 0)}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon-sm" onClick={()=>openEdit(r)} style={{ color: 'var(--accent)' }}>✎</button>
                            <button className="btn-icon-sm" onClick={()=>handleDelete(r._id)} style={{ color: '#F87171' }}>✕</button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {totalPages > 1 && (
              <div className="pagination" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <span className="page-info">Page {page} / {totalPages}</span>
                <button className="page-btn glass" onClick={()=>setPage(p=>p-1)} disabled={page===1}>←</button>
                <button className="page-btn glass" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}>→</button>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal glass md animate-vibe" style={{ border: '1px solid var(--accent-border)' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{editing ? 'Optimize Return' : 'Log New Return Case'}</h2>
              <button className="modal-close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="section-label" style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>Case Identity</div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Order Reference *</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.orderId} onChange={e=>setForm(p=>({...p,orderId:e.target.value}))} placeholder="ORD-XXXX" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client Reference</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.customerId} onChange={e=>setForm(p=>({...p,customerId:e.target.value}))} placeholder="CUS-XXXX" />
                  </div>
                </div>

                <div className="section-label" style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>Reasoning & Status</div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Primary Reason</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} required>
                      {REASONS.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resolution Path</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} required>
                      {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Phase</label>
                    <select className="form-select glass" style={{ border: '1px solid var(--accent-soft)' }} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} required>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Adjustment Amount</label>
                    <input className="form-input glass" style={{ border: '1px solid var(--accent-soft)' }} type="number" min="0" value={form.refundAmount} onChange={e=>setForm(p=>({...p,refundAmount:e.target.value}))} />
                  </div>
                </div>

                <div className="form-group full-width" style={{ marginTop: 16 }}>
                  <label className="form-label">Internal Analysis / Notes</label>
                  <textarea className="form-textarea glass" style={{ border: '1px solid var(--accent-soft)' }} rows="2" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
                </div>

                <div className="form-actions" style={{ marginTop:32, borderTop:'1px solid rgba(255,255,255,0.03)', paddingTop:24 }}>
                   <button type="button" className="btn btn-secondary glass" onClick={()=>setShowModal(false)}>Discard</button>
                   <button type="submit" className="btn" style={{ background: 'var(--accent)', color: 'white', fontWeight: 700 }} disabled={saving}>{saving ? 'Syncing...' : 'Finalize Case'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
