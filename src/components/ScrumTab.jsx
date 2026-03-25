import React, { useState } from 'react'
import { useFirebase } from '../hooks/useFirebase.js'
import ScrumBoard from './ScrumBoard.jsx'
import ScrumSprints from './ScrumSprints.jsx'

const VIEWS = [
  { id: 'board',   label: 'Board'   },
  { id: 'sprints', label: 'Sprints' }
]

export default function ScrumTab({ members, ready }) {
  const [view, setView] = useState('board')
  const { data: stories } = useFirebase('stories', true, ready)

  return (
    <div style={styles.wrap}>
      {/* View toggle */}
      <div style={styles.toggle}>
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              ...styles.toggleBtn,
              background:   view === v.id ? 'var(--sprint)' : 'var(--bg-input)',
              color:        view === v.id ? 'var(--bg-base)' : 'var(--text-secondary)',
              fontWeight:   view === v.id ? 700 : 500
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'board' && (
        <ScrumBoard stories={stories} members={members} />
      )}
      {view === 'sprints' && (
        <ScrumSprints stories={stories} ready={ready} />
      )}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 0 },
  toggle: {
    display: 'flex', gap: 6,
    padding: '12px 16px 0',
    background: 'var(--bg-base)'
  },
  toggleBtn: {
    padding: '8px 20px',
    borderRadius: 100,
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
    minHeight: 36
  }
}
