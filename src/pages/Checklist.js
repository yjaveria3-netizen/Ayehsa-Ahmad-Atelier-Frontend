import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Checklist() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPhase, setNewPhase] = useState('');
  const [addingPhase, setAddingPhase] = useState(false);
  const [newItems, setNewItems] = useState({});
  const [editingTitle, setEditingTitle] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deletingPhase, setDeletingPhase] = useState(null);

  const fetchChecklist = useCallback(async () => {
    try {
      const res = await api.get('/checklist');
      setData(res.data);
    } catch { toast.error('Failed to load checklist'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const overallPct = data && data.total > 0 ? Math.round((data.totalCompleted / data.total) * 100) : 0;

  /* ── Toggle item ── */
  const toggleItem = async (id) => {
    try {
      const res = await api.patch(`/checklist/${id}/toggle`);
      const updated = res.data.item;
      setData(prev => {
        const grouped = prev.grouped.map(g => ({
          ...g,
          items: g.items.map(i => i._id === id ? updated : i),
          completed: g.items.map(i => i._id === id ? updated : i).filter(i => i.completed).length,
        }));
        return { ...prev, grouped, totalCompleted: grouped.flatMap(g => g.items).filter(i => i.completed).length };
      });
    } catch { toast.error('Failed to update'); }
  };

  /* ── Delete item ── */
  const deleteItem = async (id) => {
    try {
      await api.delete(`/checklist/${id}`);
      toast.success('Task removed');
      fetchChecklist();
    } catch { toast.error('Failed to delete task'); }
  };

  /* ── Add phase ── */
  const addPhase = async () => {
    if (!newPhase.trim()) return;
    setAddingPhase(true);
    try {
      await api.post('/checklist/phase', { phase: newPhase.trim() });
      setNewPhase('');
      toast.success('Phase added');
      fetchChecklist();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add phase'); }
    finally { setAddingPhase(false); }
  };

  /* ── Add item to phase ── */
  const addItem = async (phase) => {
    const text = (newItems[phase] || '').trim();
    if (!text) return;
    try {
      await api.post('/checklist', { phase, task: text, responsible: '' });
      setNewItems(p => ({ ...p, [phase]: '' }));
      fetchChecklist();
    } catch { toast.error('Failed to add task'); }
  };

  /* ── Delete phase (delete all items in phase) ── */
  const deletePhase = async (phase, items) => {
    if (!window.confirm(`Delete the entire "${phase}" phase and all its tasks?`)) return;
    setDeletingPhase(phase);
    try {
      await Promise.all(items.map(i => api.delete(`/checklist/${i._id}`)));
      toast.success('Phase deleted');
      fetchChecklist();
    } catch { toast.error('Failed to delete phase'); }
    finally { setDeletingPhase(null); }
  };

  /* ── Edit task text ── */
  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      await api.put(`/checklist/${id}`, { task: editValue.trim() });
      setEditingTitle(null);
      fetchChecklist();
    } catch { toast.error('Failed to update task'); }
  };

  const PHASE_ACCENT = ['#A78BFA','#38BDF8','#34D399','#FBBF24','#FB7185','#818CF8','#2DD4BF','#F472B6'];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">Checklist</h1>
            <p className="page-subtitle">
              {data ? `${data.totalCompleted} of ${data.total} tasks done` : 'Build your custom launch plan'}
            </p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            {/* Overall progress */}
            {data && data.total > 0 && (
              <div className="card" style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--text-primary)', marginBottom:2 }}>Overall Progress</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{data.totalCompleted} of {data.total} tasks completed</div>
                  </div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'2.2rem', fontWeight:800, color:'var(--text-accent)', lineHeight:1, letterSpacing:'-0.03em' }}>
                    {overallPct}<span style={{ fontSize:'1rem', color:'var(--text-muted)', fontWeight:400 }}>%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${overallPct}%` }} />
                </div>

                {/* Mini phase overview */}
                {data.grouped.length > 0 && (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:14 }}>
                    {data.grouped.map((g, i) => {
                      const pct = g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0;
                      return (
                        <div key={g.phase} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:'var(--bg-layer2)', border:'1px solid var(--border-subtle)', fontSize:'0.65rem', color:'var(--text-muted)' }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background: pct===100 ? 'var(--emerald)' : PHASE_ACCENT[i % PHASE_ACCENT.length], flexShrink:0 }} />
                          {g.phase.length > 20 ? g.phase.slice(0,20)+'…' : g.phase}
                          <span style={{ color:'var(--text-faint)' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Add new phase */}
            <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center' }}>
              <input
                className="form-input"
                value={newPhase}
                onChange={e => setNewPhase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPhase()}
                placeholder="New phase name — e.g. Brand Foundation, Launch Day…"
                style={{ flex:1 }}
              />
              <button className="btn btn-primary" onClick={addPhase} disabled={addingPhase || !newPhase.trim()}>
                {addingPhase ? '…' : '+ Add Phase'}
              </button>
            </div>

            {/* Empty state */}
            {(!data || data.grouped.length === 0) && (
              <div className="card" style={{ textAlign:'center', padding:'48px 32px' }}>
                <div className="empty-ico" style={{ margin:'0 auto 16px' }}>✓</div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:7 }}>
                  No phases yet
                </h3>
                <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>
                  Add your first phase above to start building your checklist. You can create any phases and tasks you need for your brand.
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
                  {['Brand Foundation','Legal & Registration','Product Development','Marketing Setup','Launch Day','Post-Launch Review'].map(s => (
                    <button key={s} onClick={() => setNewPhase(s)} style={{ padding:'4px 11px', borderRadius:99, fontSize:'0.68rem', background:'var(--bg-layer2)', border:'1px solid var(--border-subtle)', color:'var(--text-muted)', cursor:'pointer', fontFamily:'Instrument Sans,sans-serif', transition:'all 0.13s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase groups */}
            {data && data.grouped.map((group, gi) => {
              const accent = PHASE_ACCENT[gi % PHASE_ACCENT.length];
              const pct = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;
              return (
                <div key={group.phase} className="checklist-section">
                  {/* Section header */}
                  <div className="checklist-section-header" style={{ borderLeft:`3px solid ${accent}` }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background: pct===100 ? 'var(--emerald)' : accent, flexShrink:0 }} />
                    <span className="checklist-section-title">{group.phase}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span className="checklist-section-progress">{group.completed}/{group.total}</span>
                      <button
                        onClick={() => deletePhase(group.phase, group.items)}
                        disabled={deletingPhase === group.phase}
                        style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.72rem', padding:'2px 5px', borderRadius:4, transition:'color 0.13s' }}
                        onMouseEnter={e => e.currentTarget.style.color='var(--rose)'}
                        onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                        title="Delete phase"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="checklist-items-wrap">
                    {group.items.map(item => (
                      <div key={item._id} className={`checklist-item${item.completed ? ' done' : ''}`}>
                        {/* Checkbox */}
                        <div className="check-box" onClick={() => toggleItem(item._id)}>
                          {item.completed && <span className="check-tick">✓</span>}
                        </div>

                        {/* Text — editable on double-click */}
                        {editingTitle === item._id ? (
                          <input
                            autoFocus
                            className="add-item-input"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(item._id)}
                            onKeyDown={e => { if (e.key==='Enter') saveEdit(item._id); if (e.key==='Escape') setEditingTitle(null); }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="item-text"
                            onDoubleClick={() => { setEditingTitle(item._id); setEditValue(item.task); }}
                            title="Double-click to edit"
                          >
                            {item.task}
                          </span>
                        )}

                        {/* Assignee input */}
                        {!item.completed && (
                          <input
                            className="add-item-input"
                            style={{ maxWidth:110, fontSize:'0.65rem', color:'var(--text-muted)' }}
                            defaultValue={item.responsible}
                            placeholder="Assignee…"
                            onBlur={async (e) => {
                              if (e.target.value !== item.responsible) {
                                try { await api.put(`/checklist/${item._id}`, { responsible: e.target.value }); }
                                catch {}
                              }
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                        {item.completed && item.responsible && (
                          <span className="item-assignee">{item.responsible}</span>
                        )}

                        {/* Delete */}
                        <button
                          onClick={e => { e.stopPropagation(); deleteItem(item._id); }}
                          style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:'0.72rem', padding:'2px 4px', borderRadius:4, flexShrink:0, transition:'color 0.13s' }}
                          onMouseEnter={e => e.currentTarget.style.color='var(--rose)'}
                          onMouseLeave={e => e.currentTarget.style.color='var(--text-faint)'}
                          title="Delete task"
                        >✕</button>
                      </div>
                    ))}

                    {/* Add task row */}
                    <div className="add-item-row">
                      <span style={{ color:'var(--text-faint)', fontSize:'0.75rem', flexShrink:0 }}>+</span>
                      <input
                        className="add-item-input"
                        value={newItems[group.phase] || ''}
                        onChange={e => setNewItems(p => ({ ...p, [group.phase]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addItem(group.phase)}
                        placeholder="Add task — press Enter"
                      />
                      {(newItems[group.phase] || '').trim() && (
                        <button
                          onClick={() => addItem(group.phase)}
                          style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontSize:'0.7rem', cursor:'pointer', flexShrink:0, fontFamily:'Instrument Sans,sans-serif' }}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phase progress bar */}
                  <div className="progress-bar" style={{ borderRadius:'0 0 10px 10px', height:3, border:'none' }}>
                    <div className="progress-fill" style={{ width:`${pct}%`, background: pct===100 ? 'var(--emerald)' : accent }} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}