import React, { useState, useEffect } from 'react'

const COLUMNS   = ['Backlog','Sprint Planning','In Progress','Review','Done']
const POINTS    = [1, 2, 3, 5, 8]
const LABELS    = ['Home','Finance','Kids','Health','Errands']
const PRIORITIES = ['Low','Medium','High']

export default function StoryModal({ story, members, defaultColumn, onSave, onClose }) {
  const isEdit = !!story

  const [title,       setTitle]       = useState(story?.title       ?? '')
  const [description, setDescription] = useState(story?.description ?? '')
  const [assignee,    setAssignee]    = useState(story?.assignee    ?? (members[0] || 'Family'))
  const [points,      setPoints]      = useState(story?.points      ?? '')
  const [label,       setLabel]       = useState(story?.label       ?? '')
  const [priority,    setPriority]    = useState(story?.priority    ?? 'Medium')
  const [column,      setColumn]      = useState(story?.column      ?? defaultColumn ?? 'Backlog')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    await onSave({
      title: title.trim(),
      description: description.trim(),
      assignee,
      points: points || null,
      label: label || null,
      priority,
      column,
      ...(isEdit ? {} : { createdAt: Date.now() })
    })
    onClose()
  }

  // Trap focus inside modal
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit story' : 'Add story'}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Story' : 'Add Story'}</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div className="form-group">
            <label className="label">Title *</label>
            <input
              type="text"
              placeholder="e.g. Fix the leaky faucet"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              placeholder="Optional details…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={styles.textarea}
            />
          </div>

          {/* Assignee + Column */}
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Assignee</label>
              <select value={assignee} onChange={e => setAssignee(e.target.value)}>
                {members.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Column</label>
              <select value={column} onChange={e => setColumn(e.target.value)}>
                {COLUMNS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Points + Priority */}
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Points</label>
              <select value={points} onChange={e => setPoints(e.target.value ? Number(e.target.value) : '')}>
                <option value="">—</option>
                {POINTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Label */}
          <div className="form-group">
            <label className="label">Label</label>
            <div style={styles.labelGrid}>
              <button
                type="button"
                onClick={() => setLabel('')}
                style={{
                  ...styles.labelBtn,
                  background: !label ? 'var(--bg-hover)' : 'transparent',
                  border: `1px solid ${!label ? 'var(--border)' : 'transparent'}`,
                  color: 'var(--text-muted)'
                }}
              >None</button>
              {LABELS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLabel(l)}
                  style={{
                    ...styles.labelBtn,
                    background: label === l ? 'var(--bg-hover)' : 'transparent',
                    border: `1px solid ${label === l ? 'var(--jorge)' : 'transparent'}`,
                    color: label === l ? 'var(--jorge)' : 'var(--text-secondary)'
                  }}
                >{l}</button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={styles.row}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              {isEdit ? 'Save Changes' : 'Add Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  textarea: {
    resize: 'vertical', minHeight: 80,
    fontFamily: 'var(--font-body)'
  },
  labelGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  labelBtn: {
    padding: '6px 12px', borderRadius: 100,
    fontSize: 13, fontWeight: 500,
    cursor: 'pointer', minHeight: 36,
    transition: 'all 0.15s'
  }
}
