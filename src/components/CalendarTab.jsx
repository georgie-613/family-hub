import React, { useState } from 'react'
import { useEvents } from '../hooks/useFirebase.js'
import { addEvent, deleteEvent } from '../firebase.js'

const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function memberColor(name, members) {
  const idx = members.indexOf(name)
  const colors = ['var(--jorge)', 'var(--wife)', 'var(--family)']
  return colors[idx] ?? 'var(--text-secondary)'
}

export default function CalendarTab({ members, ready }) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const { events } = useEvents(ready)

  // Build date key
  function dateKey(y, m, d) {
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }

  // Events indexed by dateKey
  const eventMap = {}
  events.forEach(ev => {
    if (!eventMap[ev.dateKey]) eventMap[ev.dateKey] = []
    eventMap[ev.dateKey].push(ev)
  })

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedKey = selectedDay ? dateKey(year, month, selectedDay) : null
  const selectedEvents = selectedKey ? (eventMap[selectedKey] || []) : []

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div style={styles.wrap}>
      {/* Month nav */}
      <div style={styles.nav}>
        <button className="btn btn-icon btn-ghost" onClick={prevMonth} aria-label="Previous month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 style={styles.monthTitle}>{MONTHS[month]} {year}</h2>
        <button className="btn btn-icon btn-ghost" onClick={nextMonth} aria-label="Next month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={styles.dayHeaders}>
        {DAYS.map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} />
          const key  = dateKey(year, month, d)
          const evs  = eventMap[key] || []
          const sel  = selectedDay === d
          const tod  = isToday(d)
          return (
            <button
              key={key}
              onClick={() => { setSelectedDay(d === selectedDay ? null : d); setShowAdd(false) }}
              style={{
                ...styles.cell,
                background: sel ? 'var(--bg-hover)' : 'transparent',
                border: sel
                  ? '1px solid var(--jorge)'
                  : tod
                    ? '1px solid rgba(123,167,212,0.35)'
                    : '1px solid transparent',
              }}
              aria-label={`${MONTHS[month]} ${d}`}
              aria-pressed={sel}
            >
              <span style={{
                ...styles.dayNum,
                color: tod ? 'var(--jorge)' : 'var(--text-primary)',
                fontWeight: tod ? 700 : 500
              }}>{d}</span>
              {/* Event dots */}
              {evs.length > 0 && (
                <div style={styles.dots}>
                  {evs.slice(0,3).map((ev, ei) => (
                    <span key={ei} style={{ ...styles.dot, background: memberColor(ev.member, members) }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div style={styles.detail} className="fade-up">
          <div style={styles.detailHeader}>
            <h3 style={styles.detailTitle}>
              {MONTHS[month]} {selectedDay}
            </h3>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 13, padding: '6px 10px', minHeight: 36 }}
              onClick={() => setShowAdd(v => !v)}
            >
              {showAdd ? 'Cancel' : '+ Add Event'}
            </button>
          </div>

          {showAdd && (
            <AddEventForm
              members={members}
              onSave={async (data) => {
                await addEvent(dateKey(year, month, selectedDay), data)
                setShowAdd(false)
              }}
              onCancel={() => setShowAdd(false)}
            />
          )}

          {selectedEvents.length === 0 && !showAdd && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
              No events — tap + Add Event
            </p>
          )}

          {selectedEvents.map(ev => (
            <div key={ev.id} style={styles.eventRow}>
              <div style={{ ...styles.eventDot, background: memberColor(ev.member, members) }} />
              <div style={styles.eventInfo}>
                <span style={styles.eventTitle}>{ev.title}</span>
                {ev.time && <span style={styles.eventTime}>{ev.time}</span>}
                <span style={{ ...styles.eventMember, color: memberColor(ev.member, members) }}>
                  {ev.member}
                </span>
              </div>
              <button
                className="btn btn-icon btn-ghost"
                onClick={() => deleteEvent(dateKey(year, month, selectedDay), ev.id)}
                aria-label="Delete event"
                style={{ color: 'var(--danger)', minWidth: 36 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddEventForm({ members, onSave, onCancel }) {
  const [title,  setTitle]  = useState('')
  const [time,   setTime]   = useState('')
  const [member, setMember] = useState(members[0] || 'Family')

  async function handleSave(e) {
    e.preventDefault()
    if (!title.trim()) return
    await onSave({ title: title.trim(), time, member })
  }

  return (
    <form onSubmit={handleSave} style={styles.addForm}>
      <input
        type="text"
        placeholder="Event title *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
        required
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          value={member}
          onChange={e => setMember(e.target.value)}
          style={{ flex: 1 }}
        >
          {members.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
      </div>
    </form>
  )
}

const styles = {
  wrap: { padding: '16px' },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16
  },
  monthTitle: { fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600 },
  dayHeaders: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: 4
  },
  dayHeader: {
    textAlign: 'center', fontSize: 11, fontWeight: 600,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.05em', padding: '4px 0'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 3
  },
  cell: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '6px 2px', borderRadius: 8, minHeight: 44,
    cursor: 'pointer', position: 'relative', gap: 2
  },
  dayNum: { fontSize: 14, lineHeight: 1 },
  dots: { display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: '50%' },
  detail: {
    marginTop: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '16px'
  },
  detailHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12
  },
  detailTitle: { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600 },
  eventRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0',
    borderTop: '1px solid var(--border)'
  },
  eventDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  eventInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  eventTitle: { fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' },
  eventTime: { fontSize: 12, color: 'var(--text-secondary)' },
  eventMember: { fontSize: 12, fontWeight: 600 },
  addForm: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }
}
