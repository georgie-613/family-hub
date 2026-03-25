import React from 'react'

const PRIORITY_COLOR = {
  High:   'var(--priority-high)',
  Medium: 'var(--priority-medium)',
  Low:    'var(--priority-low)'
}

const LABEL_COLORS = {
  Home:     '#7BA7D4',
  Finance:  '#C4956A',
  Kids:     '#7DB87D',
  Health:   '#D4829A',
  Errands:  '#A89880',
  default:  '#6B5F52'
}

function memberColor(name, members) {
  const idx = members.indexOf(name)
  const colors = ['var(--jorge)', 'var(--wife)', 'var(--family)']
  return colors[idx] ?? 'var(--text-secondary)'
}

export default function StoryCard({
  story,
  members,
  onEdit,
  onDelete,
  onMove,         // mobile-only: open move dropdown
  columns,
  dragHandleProps // from dnd-kit (desktop)
}) {
  const priColor = PRIORITY_COLOR[story.priority] || 'transparent'
  const lblColor = LABEL_COLORS[story.label] || LABEL_COLORS.default

  return (
    <div
      {...dragHandleProps}
      style={{
        ...styles.card,
        borderLeft: `3px solid ${priColor}`
      }}
    >
      {/* Header row */}
      <div style={styles.cardHeader}>
        <div style={styles.meta}>
          {story.label && (
            <span style={{ ...styles.badge, color: lblColor, borderColor: `${lblColor}44`, background: `${lblColor}15` }}>
              {story.label}
            </span>
          )}
          {story.points && (
            <span style={styles.points}>{story.points}pt</span>
          )}
        </div>
        <div style={styles.actions}>
          {onMove && columns && (
            <MoveDropdown story={story} columns={columns} onMove={onMove} />
          )}
          <button
            className="btn btn-icon btn-ghost"
            onClick={onEdit}
            style={{ minWidth: 32, minHeight: 32, width: 32, height: 32 }}
            aria-label="Edit story"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={onDelete}
            style={{ color: 'var(--danger)', minWidth: 32, minHeight: 32, width: 32, height: 32 }}
            aria-label="Delete story"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <p style={styles.title}>{story.title}</p>

      {/* Description preview */}
      {story.description && (
        <p style={styles.desc}>{story.description}</p>
      )}

      {/* Footer */}
      <div style={styles.cardFooter}>
        <span style={{ ...styles.assignee, color: memberColor(story.assignee, members) }}>
          {story.assignee}
        </span>
        {story.priority && (
          <span style={{ ...styles.priority, color: priColor }}>
            {story.priority}
          </span>
        )}
      </div>
    </div>
  )
}

function MoveDropdown({ story, columns, onMove }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-icon btn-ghost"
        onClick={() => setOpen(v => !v)}
        style={{ minWidth: 32, minHeight: 32, width: 32, height: 32 }}
        aria-label="Move to column"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
      </button>
      {open && (
        <div style={styles.dropdown}>
          <p style={styles.dropdownLabel}>Move to…</p>
          {columns.filter(c => c !== story.column).map(col => (
            <button
              key={col}
              className="btn btn-ghost"
              style={{ ...styles.dropdownItem, textAlign: 'left', justifyContent: 'flex-start' }}
              onClick={() => { onMove(story.id, col); setOpen(false) }}
            >
              {col}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 12px 12px 10px',
    display: 'flex', flexDirection: 'column', gap: 8,
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none'
  },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  meta: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  badge: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
    textTransform: 'uppercase', padding: '2px 6px',
    borderRadius: 100, border: '1px solid'
  },
  points: {
    fontSize: 11, fontWeight: 700, color: 'var(--sprint)',
    background: 'rgba(196,149,106,0.12)', padding: '2px 6px',
    borderRadius: 100, border: '1px solid rgba(196,149,106,0.3)'
  },
  actions: { display: 'flex', gap: 2 },
  title: { fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 },
  desc: {
    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden'
  },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  assignee: { fontSize: 12, fontWeight: 600 },
  priority: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  dropdown: {
    position: 'absolute', right: 0, top: '100%', zIndex: 10,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: 8, minWidth: 160,
    boxShadow: 'var(--shadow-modal)'
  },
  dropdownLabel: { fontSize: 11, color: 'var(--text-muted)', padding: '4px 8px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  dropdownItem: { width: '100%', padding: '8px 10px', borderRadius: 6, fontSize: 13, minHeight: 36 }
}
