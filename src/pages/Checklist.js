import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '../components/Motion';

const PRIORITY_COLOR = {
  High: { color: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)' },
  Medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)' },
  Low: { color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
};

/* ─── Kanban-style Task Card ─────────────────────────────────── */
function TaskCard({ item, onToggle, onEdit, onDelete }) {
  const pri = PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.Medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.25 }}
      className="task-card"
      style={{
        background: item.completed
          ? 'rgba(255,255,255,0.015)'
          : 'linear-gradient(135deg, var(--bg-layer2) 0%, rgba(30,25,60,0.8) 100%)',
        border: `1px solid ${item.completed ? 'rgba(255,255,255,0.04)' : 'var(--border-faint)'}`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        opacity: item.completed ? 0.55 : 1,
        transition: 'all 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar for priority */}
      {!item.completed && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: pri.color, borderRadius: '12px 0 0 12px', opacity: 0.7,
        }} />
      )}

      {/* Checkbox */}
      <motion.button
        className="task-check-btn"
        onClick={() => onToggle(item._id)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        style={{
          width: 22, height: 22, flexShrink: 0, marginTop: 2,
          border: `2px solid ${item.completed ? 'var(--accent)' : 'var(--border-subtle)'}`,
          borderRadius: 6, background: item.completed ? 'var(--accent)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease', cursor: 'pointer',
        }}
      >
        {item.completed && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ color: 'white', fontSize: 12, fontWeight: 900, lineHeight: 1 }}
          >✓</motion.span>
        )}
      </motion.button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
          textDecoration: item.completed ? 'line-through' : 'none',
          lineHeight: 1.4, marginBottom: item.notes ? 6 : 0,
        }}>
          {item.task}
        </div>

        {item.notes && (
          <div style={{
            fontSize: '0.72rem', color: 'var(--text-faint)',
            lineHeight: 1.5, fontStyle: 'italic',
          }}>
            {item.notes}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {/* Priority tag */}
          {item.priority && (
            <span style={{
              fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 99,
              color: pri.color, background: pri.bg, border: `1px solid ${pri.border}`,
            }}>
              {item.priority}
            </span>
          )}

          {/* Responsible */}
          {item.responsible && (
            <span style={{
              fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-soft)',
                border: '1px solid var(--accent-border)', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem',
                fontWeight: 800, color: 'var(--accent)', flexShrink: 0,
              }}>
                {item.responsible.charAt(0).toUpperCase()}
              </span>
              {item.responsible}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="task-card-actions" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <motion.button
          whileHover={{ scale: 1.1, color: 'var(--accent)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEdit(item)}
          style={{
            width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border-faint)',
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', color: 'var(--text-faint)', cursor: 'pointer', transition: 'all 0.15s',
          }}
          title="Edit task"
        >
          ✏️
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, background: 'rgba(248,113,113,0.12)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(item._id)}
          style={{
            width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border-faint)',
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', color: 'var(--text-faint)', cursor: 'pointer', transition: 'all 0.15s',
          }}
          title="Delete task"
        >
          🗑️
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Phase Section ──────────────────────────────────────────── */
function PhaseSection({ group, idx, onToggle, onEdit, onDelete, onAddTask, onDeletePhase }) {
  const [expanded, setExpanded] = useState(true);
  const pct = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;
  const allDone = group.completed === group.total && group.total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      style={{ marginBottom: 32 }}
    >
      {/* Phase header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14,
          padding: '14px 18px', borderRadius: 12,
          background: allDone ? 'rgba(52,211,153,0.06)' : 'var(--bg-layer2)',
          border: `1px solid ${allDone ? 'rgba(52,211,153,0.18)' : 'var(--border-faint)'}`,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(e => !e)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Collapse toggle */}
        <motion.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          style={{ color: 'var(--accent)', fontSize: '0.8rem', flexShrink: 0, userSelect: 'none' }}
        >
          ▾
        </motion.span>

        {/* Phase indicator dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: allDone ? '#34D399' : 'var(--accent)',
          boxShadow: allDone ? '0 0 8px #34D399' : '0 0 8px var(--accent-glow)',
        }} />

        {/* Phase name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
            color: allDone ? '#34D399' : 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {group.phase}
          </div>
        </div>

        {/* Progress bar + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 80, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 99, background: allDone ? '#34D399' : 'var(--accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
            />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 700, minWidth: 36, textAlign: 'right' }}>
            {group.completed}/{group.total}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05, color: 'var(--accent)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddTask(group.phase)}
            style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: 7,
              border: '1px solid var(--accent-border)', color: 'var(--accent)',
              background: 'var(--accent-soft)', cursor: 'pointer', flexShrink: 0,
              letterSpacing: '0.05em', transition: 'all 0.15s',
            }}
          >
            + Task
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, color: '#F87171' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDeletePhase(group.phase)}
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: '1px solid rgba(248,113,113,0.2)', color: '#F87171',
              background: 'rgba(248,113,113,0.05)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem',
            }}
            title="Delete Phase"
          >
            🗑️
          </motion.button>
        </div>
      </div>

      {/* Task list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', paddingLeft: 22 }}
          >
            <AnimatePresence>
              {group.items.map(item => (
                <TaskCard
                  key={item._id}
                  item={item}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
            {group.items.length === 0 && (
              <div style={{
                padding: '16px 0', textAlign: 'center',
                fontSize: '0.8rem', color: 'var(--text-faint)', fontStyle: 'italic',
              }}>
                No tasks yet — add one above
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Task Edit/Add Modal ────────────────────────────────────── */
function TaskModal({ show, onClose, onSave, form, setForm, saving, isEdit }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal glass"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          style={{ border: '1px solid var(--accent-border)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>
              {isEdit ? '✏️ Edit Task' : '+ New Task'}
            </h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            <form onSubmit={onSave}>
              <div className="form-group">
                <label className="form-label">Task Description *</label>
                <textarea
                  className="form-textarea glass"
                  rows={2}
                  style={{ border: '1px solid var(--accent-soft)', resize: 'none', minHeight: 72 }}
                  value={form.task}
                  onChange={e => setForm(p => ({ ...p, task: e.target.value }))}
                  required
                  placeholder="e.g. Capture high-res product campaign shots"
                  autoFocus
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select glass"
                    style={{ border: '1px solid var(--accent-soft)' }}
                    value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <input
                    className="form-input glass"
                    style={{ border: '1px solid var(--accent-soft)' }}
                    value={form.responsible}
                    onChange={e => setForm(p => ({ ...p, responsible: e.target.value }))}
                    placeholder="e.g. Creative Director"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea glass"
                  style={{ border: '1px solid var(--accent-soft)' }}
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Add context or dependencies..."
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button
                  type="submit"
                  className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
                  disabled={saving}
                >
                  <span>{saving ? 'Saving…' : isEdit ? 'Update Task' : 'Add Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Main Checklist Page ────────────────────────────────────── */
export default function Checklist() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [addToPhase, setAddToPhase] = useState('');
  const [form, setForm] = useState({ task: '', responsible: '', priority: 'Medium', notes: '' });
  const [savingTask, setSavingTask] = useState(false);
  const [viewMode, setViewMode] = useState('phases'); // 'phases' | 'board'

  const fetchChecklist = useCallback(async () => {
    try {
      const res = await api.get('/checklist');
      setData(res.data);
    } catch (err) {
      console.error('Fetch checklist error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const initChecklist = async () => {
    setInitializing(true);
    try {
      await api.post('/checklist/init');
      await fetchChecklist();
      toast.success('Checklist initialized!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize');
    } finally {
      setInitializing(false);
    }
  };

  const toggleItem = async (id) => {
    setData(prev => {
      if (!prev) return prev;
      const newGrouped = prev.grouped.map(group => ({
        ...group,
        items: group.items.map(item => item._id === id ? { ...item, completed: !item.completed } : item),
        completed: group.items.filter(i => i._id === id ? !i.completed : i.completed).length,
      }));
      const newTotal = newGrouped.reduce((sum, g) => sum + g.completed, 0);
      return { ...prev, grouped: newGrouped, totalCompleted: newTotal };
    });
    try {
      await api.patch(`/checklist/${id}/toggle`);
    } catch (err) {
      console.error('Toggle checklist item error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to update');
      fetchChecklist();
    }
  };

  const handleOpenAdd = (phase) => {
    setEditingTask(null);
    setAddToPhase(phase);
    setForm({ task: '', responsible: '', priority: 'Medium', notes: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setForm({ task: task.task, responsible: task.responsible || '', priority: task.priority || 'Medium', notes: task.notes || '' });
    setShowModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!form.task.trim()) return toast.error('Task description required');
    setSavingTask(true);
    try {
      if (editingTask) {
        await api.put(`/checklist/${editingTask._id}`, form);
        toast.success('Task updated!');
      } else {
        await api.post('/checklist', { phase: addToPhase, ...form });
        toast.success('Task added!');
      }
      setShowModal(false);
      fetchChecklist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/checklist/${id}`);
      toast.success('Task deleted');
      fetchChecklist();
    } catch (err) {
      console.error('Delete checklist task error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleDeletePhase = async (phaseName) => {
    if (!window.confirm(`Are you sure? This will delete the entire phase "${phaseName}" and all its tasks.`)) return;
    try {
      await api.delete(`/checklist/phase/${encodeURIComponent(phaseName)}`);
      toast.success('Phase deleted');
      fetchChecklist();
    } catch (err) {
      console.error('Delete phase error:', err.message);
      toast.error(err.response?.data?.message || 'Failed to delete phase');
    }
  };

  const handleAddNewPhase = () => {
    const name = window.prompt('Enter name for the new phase (e.g. PHASE 11 · Social Media Blowup)');
    if (name && name.trim()) {
      handleOpenAdd(name.trim());
    }
  };

  const overallProgress = data && data.total > 0
    ? Math.round((data.totalCompleted / data.total) * 100)
    : 0;

  return (
    <div className="checklist-page animate-vibe">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <Reveal delay={0.05} direction="none">
            <div>
              <h1 className="page-title">Launch Checklist</h1>
              <p className="page-subtitle">Track every phase of your brand launch journey</p>
            </div>
          </Reveal>
          <div className="header-actions" style={{ display: 'flex', gap: 12 }}>
            <Reveal delay={0.1} direction="none">
              <button
                className="btn btn-primary"
                onClick={handleAddNewPhase}
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                + New Phase
              </button>
            </Reveal>
            <Reveal delay={0.15} direction="none">
              <button
                className="btn btn-secondary glass"
                onClick={() => window.confirm('Reset checklist to defaults?') && initChecklist()}
                disabled={initializing}
              >
                {initializing ? '⟳ Resetting…' : '↺ Reset Journey'}
              </button>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="page-loader" style={{ height: '40vh' }}>
            <div className="spinner" />
          </div>
        ) : !data || data.total === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
            <h3 style={{ marginBottom: 10 }}>No checklist yet</h3>
            <p style={{ color: 'var(--text-faint)', marginBottom: 28, maxWidth: 400 }}>
              Initialize with 10 pre-built phases covering your entire launch journey — from brand foundation to post-launch growth.
            </p>
            <button
              className="btn btn-primary"
              style={{ padding: '14px 32px' }}
              onClick={initChecklist}
              disabled={initializing}
            >
              {initializing ? 'Initializing…' : 'Begin Your Journey →'}
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── Progress Overview ── */}
            <motion.div
              className="card glass"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 40, border: '1px solid var(--accent-border)', padding: '32px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)',
                    letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    Launch Readiness
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                    fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.2,
                  }}>
                    {data.totalCompleted} of {data.total} tasks secured
                  </h2>
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      style={{
                        height: '100%', borderRadius: 99,
                        background: overallProgress === 100
                          ? 'linear-gradient(90deg, #34D399, #10b981)'
                          : 'linear-gradient(90deg, var(--accent), var(--secondary))',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 4.5rem)',
                    fontWeight: 800, lineHeight: 1,
                    color: overallProgress === 100 ? '#34D399' : 'var(--accent)',
                  }}>
                    {overallProgress}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {overallProgress === 100 ? '🎉 Mission Complete' : 'Momentum'}
                  </div>
                </div>
              </div>

              {/* Phase progress chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-faint)' }}>
                {data.grouped.map((group, i) => {
                  const pct = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;
                  const done = pct === 100;
                  const phaseName = group.phase.split('·')[0].trim() || `Phase ${i + 1}`;
                  return (
                    <div
                      key={group.phase}
                      className="id-chip"
                      style={{
                        background: done ? 'rgba(52,211,153,0.08)' : 'var(--accent-soft)',
                        color: done ? '#34D399' : 'var(--accent)',
                        borderColor: done ? 'rgba(52,211,153,0.2)' : 'var(--accent-border)',
                        padding: '6px 14px', fontSize: '0.7rem',
                      }}
                      title={group.phase}
                    >
                      {done ? '✓' : `${pct}%`} {phaseName}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Phase Sections ── */}
            <div style={{ display: 'grid', gap: 24 }}>
              {data.grouped.map((group, idx) => (
                <PhaseSection
                  key={group.phase}
                  group={group}
                  idx={idx}
                  onToggle={toggleItem}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteTask}
                  onAddTask={handleOpenAdd}
                  onDeletePhase={handleDeletePhase}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Task Modal ── */}
      <TaskModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTask}
        form={form}
        setForm={setForm}
        saving={savingTask}
        isEdit={!!editingTask}
      />
    </div>
  );
}