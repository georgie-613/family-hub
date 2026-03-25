import React from 'react'

// Icons — inline SVG for zero bundle overhead
function CalendarIcon({ active }) {
  const col = active ? 'var(--tab-calendar)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function TodoIcon({ active }) {
  const col = active ? 'var(--tab-todo)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}

function GroceryIcon({ active }) {
  const col = active ? 'var(--tab-grocery)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function ScrumIcon({ active }) {
  const col = active ? 'var(--tab-scrum)' : 'var(--text-muted)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"  y="3"  width="7" height="9" rx="1"/>
      <rect x="14" y="3"  width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/>
      <rect x="3"  y="16" width="7" height="5" rx="1"/>
    </svg>
  )
}

const ICON_MAP = {
  calendar: CalendarIcon,
  todo:     TodoIcon,
  grocery:  GroceryIcon,
  scrum:    ScrumIcon
}

const ACCENT_MAP = {
  calendar: 'var(--tab-calendar)',
  todo:     'var(--tab-todo)',
  grocery:  'var(--tab-grocery)',
  scrum:    'var(--tab-scrum)'
}

export default function TabBar({ activeTab, setActiveTab, tabs }) {
  return (
    <nav style={styles.nav} aria-label="Main navigation">
      {tabs.map(tab => {
        const Icon    = ICON_MAP[tab.id]
        const active  = activeTab === tab.id
        const accent  = ACCENT_MAP[tab.id]
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              color: active ? accent : 'var(--text-muted)'
            }}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <span style={styles.iconWrap}>
              {active && <span style={{ ...styles.activeDot, background: accent }} />}
              <Icon active={active} />
            </span>
            <span style={{
              ...styles.label,
              color: active ? accent : 'var(--text-muted)',
              fontWeight: active ? 600 : 500
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 600,
    display: 'flex',
    height: 64,
    paddingBottom: 'env(safe-area-inset-bottom)',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border)',
    zIndex: 50
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 44,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 4px 4px',
    transition: 'color 0.15s',
    WebkitTapHighlightColor: 'transparent'
  },
  iconWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 4, height: 4,
    borderRadius: '50%'
  },
  label: {
    fontSize: 10,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    transition: 'color 0.15s'
  }
}
