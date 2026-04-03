import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Checklist() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  const fetchChecklist = async () => {
    try {
      const res = await api.get('/checklist');
      setData(res.data);
    } catch { toast.error('Failed to load checklist'); }
    finally { setLoading(false); }
  };

  const initChecklist = async () => {
    setInitializing(true);
    try {
      await api.post('/checklist/init');
      await fetchChecklist();
      toast.success('Checklist initialized!');
    } catch { toast.error('Failed to initialize'); }
    finally { setInitializing(false); }
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  const toggleItem = async (id) => {
    try {
      const res = await api.patch(`/checklist/${id}/toggle`);
      setData(prev => ({
        ...prev,
        grouped: prev.grouped.map(group => ({
          ...group,
          items: group.items.map(item => item._id === id ? res.data.item : item),
          completed: group.items.filter(i => (i._id === id ? res.data.item.completed : i.completed)).length,
        })),
        totalCompleted: prev.grouped.flatMap(g => g.items).filter(i => i._id === id ? res.data.item.completed : i.completed).length,
      }));
    } catch { toast.error('Failed to update'); }
  };

  const overallProgress = data ? Math.round((data.totalCompleted / data.total) * 100) : 0;

  const PHASE_COLORS = [
    'var(--accent-rose)', 'var(--accent-slate)', 'var(--gold)',
    'var(--accent-sage)', 'var(--accent-rose)', 'var(--accent-slate)',
    'var(--gold)', 'var(--accent-sage)', 'var(--accent-rose)', 'var(--gold)'
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">Launch Checklist</h1>
            <p className="page-subtitle">Track every phase of your atelier launch — from brand foundation to post-launch growth.</p>
          </div>
          <button className="btn btn-secondary" onClick={initChecklist} disabled={initializing}>
            {initializing ? '⟳ Initializing…' : '↺ Reset Checklist'}
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : !data || data.total === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">☐</div>
            <h3>Checklist not initialized</h3>
            <p>Initialize to load all 10 launch phases with tasks</p>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={initChecklist} disabled={initializing}>
              {initializing ? '⟳ Initializing…' : 'Initialize Checklist'}
            </button>
          </div>
        ) : (
          <>
            {/* Overall progress */}
            <div className="card" style={{ marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--text-primary)' }}>Overall Progress</h3>
                  <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>{data.totalCompleted} of {data.total} tasks completed</p>
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'2.5rem', color:'var(--gold)', lineHeight:1 }}>
                  {overallProgress}<span style={{ fontSize:'1rem', color:'var(--text-muted)' }}>%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${overallProgress}%` }} />
              </div>
            </div>

            {/* Phase overview */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12, marginBottom:28 }}>
              {data.grouped.map((group, idx) => {
                const pct = Math.round((group.completed / group.total) * 100);
                return (
                  <div key={group.phase} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px', borderTop:`2px solid ${PHASE_COLORS[idx % PHASE_COLORS.length]}` }}>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:6, lineHeight:1.3 }}>{group.phase.replace('PHASE ', 'P')}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color: pct === 100 ? 'var(--success)' : PHASE_COLORS[idx % PHASE_COLORS.length] }}>{pct}%</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{group.completed}/{group.total} done</div>
                    <div className="progress-bar" style={{ marginTop:8, height:3 }}>
                      <div className="progress-fill" style={{ width:`${pct}%`, background: pct === 100 ? 'var(--success)' : PHASE_COLORS[idx % PHASE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed checklist */}
            {data.grouped.map((group, idx) => (
              <div key={group.phase} className="checklist-phase">
                <div className="phase-header">
                  <h3 className="phase-title" style={{ color: PHASE_COLORS[idx % PHASE_COLORS.length] }}>{group.phase}</h3>
                  <span className="phase-progress">{group.completed}/{group.total} complete</span>
                </div>
                {group.items.map(item => (
                  <div key={item._id} className={`checklist-item${item.completed ? ' done' : ''}`} onClick={() => toggleItem(item._id)}>
                    <div className="check-circle">
                      {item.completed && <span style={{ color:'white', fontSize:'0.7rem' }}>✓</span>}
                    </div>
                    <div className="item-task">{item.task}</div>
                    <div className="item-responsible">{item.responsible}</div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
