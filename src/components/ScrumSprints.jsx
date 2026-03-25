import React, { useState } from 'react'
import { useFirebase } from '../hooks/useFirebase.js'
import { addSprint, updateSprint, deleteSprint, updateStory } from '../firebase.js'

function daysLeft(endDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  return diff
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ScrumSprints({ stories, ready }) {
  const { data: sprints } = useFirebase('sprints', true, ready)
  const [showForm, setShowForm] = useState(false)
  const [name,      setName]    = useState('')
  const [startDate, setStart]   = useState('')
  const [endDate,   setEnd]     = useState('')

  const sprintsArr = (sprints || []).sort((a, b) => {
    // Active first, then by start date desc
    if (a.status === 'active' && b.status !== 'active') return -1
    if (b.status === 'active' && a.status !== 'active') return 1
    return new Date(b.startDate || 0) - new Date(a.startDate || 0)
  })

  const activeSprint = sprintsArr.find(s => s.status === 'active')

  // Velocity = points of Done stories in active sprint
  const activeVelocity = activeSprint
    ? (stories || [])
        .filter(s => s.sprintId === activeSprint.id && s.column === 'Done')
        .reduce((sum, s) => sum + (s.points || 0), 0)
    : 0

  // Sprint stories stats
  const sprintStories = activeSprint
    ? (stories || []).filter(s => s.sprintId === activeSprint.id)
    : []
  const sprintTotal = sprintStories.reduce((s, c) => s + (c.points || 0), 0)
  const sprintDone  = sprintStories
    .filter(s => s.column === 'Done')
    .reduce((s, c) => s + (c.points || 0), 0)

  async function handleCreateSprint(e) {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) return
    await addSprint({
      name: name.trim(),
      startDate,
      endDate,
      status: 'active',
      velocity: 0
    })
    setName(''); setStart(''); setEnd('')
    setShowForm(false)
  }

  async function handleCloseSprint(sprint) {
    // Archive Done cards, record velocity
    await updateSprint(sprint.id, { status: 'done', velocity: activeVelocity })
    // Clear column for Done stories in this sprint
    const doneStories = (stories || []).filter(s => s.sprintId === sprint.id && s.column === 'Done')
    await Promise.all(doneStories.map(s => updateStory(s.id, { column: 'Backlog', sprintId: null })))
  }

  return (
    <div style={styles.wrap}>
      {/* Active sprint */}
      {activeSprint ? (
        <div style={styles.activeCard}>
          <div style={styles.activeHeader}>
            <div>
              <div style={styles.activeTag}>ACTIVE SPRINT</div>
              <h3 style={styles.activeName}>{activeSprint.name}</h3>
              <p style={styles.activeDates}>
                {formatDate(activeSprint.startDate)} → {formatDate(activeSprint.endDate)}
              </p>
            </div>
            <div style={styles.activeStat}>
              <span style={styles.statNum}>{daysLeft(activeSprint.endDate)}</span>
              <span style={styles.statLabel}>days left</span>
            </div>
          </div>

          {/* Progress */}
          <div style={{ margin: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Velocity: <strong style={{ color: 'var(--sprint)' }}>{activeVelocity} pts</strong>
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {sprintDone} / {sprintTotal} pts done
              </span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: sprintTotal > 0 ? `${(sprintDone / sprintTotal) * 100}%` : '0%', background: 'var(--sprint)' }}
              />
            </div>
          </div>

          <button
            className="btn btn-danger"
            onClick={() => handleCloseSprint(activeSprint)}
            style={{ width: '100%' }}
          >
            Close Sprint & Archive Done Cards
          </button>
        </div>
      ) : (
        <div style={styles.noSprint}>
          <p>No active sprint</p>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create one below to start tracking</span>
        </div>
      )}

      {/* Create sprint */}
      {showForm ? (
        <form onSubmit={handleCreateSprint} style={styles.form}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600 }}>New Sprint</h3>
          <input
            type="text" placeholder="Sprint name (e.g. Sprint 1 — March)"
            value={name} onChange={e => setName(e.target.value)}
            autoFocus required
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Start</label>
              <input type="date" value={startDate} onChange={e => setStart(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">End</label>
              <input type="date" value={endDate} onChange={e => setEnd(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Sprint</button>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-ghost" style={styles.createBtn} onClick={() => setShowForm(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Sprint
        </button>
      )}

      {/* Past sprints */}
      {sprintsArr.filter(s => s.status === 'done').length > 0 && (
        <div style={styles.pastSection}>
          <h3 style={styles.pastTitle}>Past Sprints</h3>
          {sprintsArr.filter(s => s.status === 'done').map(sprint => (
            <div key={sprint.id} style={styles.pastCard}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{sprint.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                </p>
              </div>
              <div style={styles.pastVelocity}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--sprint)' }}>{sprint.velocity || 0}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { padding: 16, display: 'flex', flexDirection: 'column', gap: 16 },
  activeCard: {
    background: 'var(--bg-card)', border: '1px solid var(--sprint)',
    borderRadius: 'var(--radius-md)', padding: 16
  },
  activeHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  activeTag: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--sprint)', marginBottom: 4 },
  activeName: { fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 4 },
  activeDates: { fontSize: 13, color: 'var(--text-secondary)' },
  activeStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum: { fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  noSprint: {
    background: 'var(--bg-card)', border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-md)', padding: 24,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    color: 'var(--text-secondary)', fontWeight: 600
  },
  form: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: 16,
    display: 'flex', flexDirection: 'column', gap: 12
  },
  createBtn: {
    width: '100%', gap: 8, padding: '12px 16px',
    border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)', justifyContent: 'flex-start', minHeight: 48
  },
  pastSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  pastTitle: { fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  pastCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
  },
  pastVelocity: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }
}
