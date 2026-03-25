import React from 'react'

const TAB_TITLES = {
  calendar: 'Calendar',
  todo:     'To-Do',
  grocery:  'Grocery',
  scrum:    'Scrum Board'
}

export default function Header({ activeTab }) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.left}>
          <h1 style={styles.tabTitle}>{TAB_TITLES[activeTab] || 'Family Hub'}</h1>
        </div>
        <div style={styles.right}>
          <span style={styles.date}>{dateStr}</span>
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 600,
    zIndex: 50,
    paddingTop: 'env(safe-area-inset-top)',
    background: 'var(--bg-base)',
    borderBottom: '1px solid var(--border)'
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 20,
    paddingRight: 20
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  tabTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  date: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontWeight: 500
  }
}
