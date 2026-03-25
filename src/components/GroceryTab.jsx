import React, { useState } from 'react'
import { useFirebase } from '../hooks/useFirebase.js'
import { addGrocery, toggleGrocery, deleteGrocery } from '../firebase.js'

const CATEGORIES = ['Produce','Dairy','Meat','Pantry','Frozen','Beverages','Household','Other']

const CAT_ICONS = {
  Produce:    '🥦',
  Dairy:      '🥛',
  Meat:       '🥩',
  Pantry:     '🫙',
  Frozen:     '🧊',
  Beverages:  '🥤',
  Household:  '🧹',
  Other:      '📦'
}

export default function GroceryTab({ ready }) {
  const { data: items } = useFirebase('grocery', true, ready)
  const [collapsed, setCollapsed] = useState({})
  const [adding, setAdding]       = useState(false)
  const [name, setName]           = useState('')
  const [qty, setQty]             = useState('')
  const [cat, setCat]             = useState('Produce')

  const itemsArr = items || []
  const checked  = itemsArr.filter(i => i.checked).length
  const total    = itemsArr.length
  const pct      = total > 0 ? Math.round((checked / total) * 100) : 0

  // Group by category
  const grouped = {}
  CATEGORIES.forEach(c => { grouped[c] = [] })
  itemsArr.forEach(item => {
    const key = CATEGORIES.includes(item.cat) ? item.cat : 'Other'
    grouped[key].push(item)
  })

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    await addGrocery({ text: name.trim(), qty: qty.trim(), cat, checked: false, createdAt: Date.now() })
    setName('')
    setQty('')
    setAdding(false)
  }

  async function clearChecked() {
    const done = itemsArr.filter(i => i.checked)
    await Promise.all(done.map(i => deleteGrocery(i.id)))
  }

  function toggleCollapse(cat) {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div style={styles.wrap}>
      {/* Progress bar */}
      {total > 0 && (
        <div style={styles.progressWrap}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>{checked} / {total} items</span>
            <span style={{ ...styles.progressLabel, color: 'var(--family)', fontWeight: 600 }}>{pct}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" style={styles.addBtn} onClick={() => setAdding(v => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add item
        </button>
        {checked > 0 && (
          <button className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--danger)', minHeight: 44 }} onClick={clearChecked}>
            Clear checked
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} style={styles.addForm}>
          <input
            type="text" placeholder="Item name *"
            value={name} onChange={e => setName(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" placeholder="Qty (e.g. 2, 1 lb)"
              value={qty} onChange={e => setQty(e.target.value)}
              style={{ flex: 1 }}
            />
            <select value={cat} onChange={e => setCat(e.target.value)} style={{ flex: 2 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setAdding(false); setName('') }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Category groups */}
      {total === 0 && !adding && (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <p>No items yet — tap Add item</p>
        </div>
      )}

      {CATEGORIES.map(cat => {
        const catItems = grouped[cat]
        if (catItems.length === 0) return null
        const isCollapsed = collapsed[cat]
        const catChecked  = catItems.filter(i => i.checked).length

        return (
          <div key={cat} style={styles.group}>
            <button
              onClick={() => toggleCollapse(cat)}
              style={styles.groupHeader}
              aria-expanded={!isCollapsed}
            >
              <span style={styles.groupLeft}>
                <span style={styles.catIcon}>{CAT_ICONS[cat]}</span>
                <span style={styles.catName}>{cat}</span>
                <span style={styles.catCount}>{catChecked}/{catItems.length}</span>
              </span>
              <svg
                width="16" height="16"
                viewBox="0 0 24 24" fill="none"
                stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {!isCollapsed && (
              <ul style={styles.catList}>
                {catItems.map(item => (
                  <GroceryItem
                    key={item.id}
                    item={item}
                    onToggle={() => toggleGrocery(item.id, !item.checked)}
                    onDelete={() => deleteGrocery(item.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

function GroceryItem({ item, onToggle, onDelete }) {
  return (
    <li style={styles.item}>
      <button
        onClick={onToggle}
        style={{
          ...styles.checkbox,
          borderColor: item.checked ? 'var(--family)' : 'var(--border)',
          background: item.checked ? 'var(--family)' : 'transparent'
        }}
        aria-label={item.checked ? 'Uncheck' : 'Check'}
      >
        {item.checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg-base)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </button>
      <div style={styles.itemInfo}>
        <span style={{
          fontSize: 14, fontWeight: 500,
          color: item.checked ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: item.checked ? 'line-through' : 'none'
        }}>
          {item.text}
        </span>
        {item.qty && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.qty}</span>
        )}
      </div>
      <button
        className="btn btn-icon btn-ghost"
        onClick={onDelete}
        style={{ color: 'var(--danger)', minWidth: 36, minHeight: 36 }}
        aria-label="Delete item"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </li>
  )
}

const styles = {
  wrap: { padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  progressWrap: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 16px',
    display: 'flex', flexDirection: 'column', gap: 8
  },
  progressHeader: { display: 'flex', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 },
  addBtn: {
    flex: 1, justifyContent: 'flex-start', gap: 8,
    padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border)', color: 'var(--text-muted)', minHeight: 44
  },
  addForm: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: 16,
    display: 'flex', flexDirection: 'column', gap: 10
  },
  group: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', overflow: 'hidden'
  },
  groupHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '12px 14px', background: 'none',
    border: 'none', cursor: 'pointer', minHeight: 48
  },
  groupLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  catIcon: { fontSize: 16 },
  catName: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  catCount: { fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 7px', borderRadius: 100 },
  catList: { listStyle: 'none', borderTop: '1px solid var(--border)' },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px', borderBottom: '1px solid var(--border)'
  },
  checkbox: {
    width: 24, height: 24, minWidth: 24,
    borderRadius: 6, border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
  },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }
}
