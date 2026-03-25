import React, { useState } from 'react'
import { useFirebase } from '../hooks/useFirebase.js'
import { addTodo, toggleTodo, deleteTodo } from '../firebase.js'

const FILTERS = ['All', 'Active', 'Done']

function memberColor(name, members) {
  const idx = members.indexOf(name)
  const colors = ['var(--jorge)', 'var(--wife)', 'var(--family)']
  return colors[idx] ?? 'var(--text-secondary)'
}

export default function TodoTab({ members, ready }) {
  const { data: todos } = useFirebase('todos', true, ready)
  const [filter, setFilter]     = useState('All')
  const [memberFilter, setMF]   = useState('All')
  const [text, setText]         = useState('')
  const [assignee, setAssignee] = useState(members[0] || 'Family')
  const [adding, setAdding]     = useState(false)

  const todosArr = todos || []

  const filtered = todosArr.filter(t => {
    const statusOk = filter === 'All'
      ? true
      : filter === 'Active' ? !t.done : t.done
    const memberOk = memberFilter === 'All' || t.assignee === memberFilter
    return statusOk && memberOk
  })

  const activeCount    = todosArr.filter(t => !t.done).length
  const completedCount = todosArr.filter(t => t.done).length

  async function handleAdd(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addTodo({ text: text.trim(), assignee, done: false, createdAt: Date.now() })
    setText('')
    setAdding(false)
  }

  async function handleClearDone() {
    const done = todosArr.filter(t => t.done)
    await Promise.all(done.map(t => deleteTodo(t.id)))
  }

  return (
    <div style={styles.wrap}>
      {/* Summary bar */}
      <div style={styles.summaryBar}>
        <span style={styles.summary}>
          <span style={{ color: 'var(--wife)', fontWeight: 700 }}>{activeCount}</span>
          {' '}active · {' '}
          <span style={{ color: 'var(--text-muted)' }}>{completedCount} done</span>
        </span>
        {completedCount > 0 && (
          <button className="btn btn-ghost" style={{ fontSize: 12, minHeight: 36 }} onClick={handleClearDone}>
            Clear done
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterRow}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background: filter === f ? 'var(--bg-hover)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                borderColor: filter === f ? 'var(--border)' : 'transparent'
              }}
            >{f}</button>
          ))}
        </div>
        <div style={styles.filterRow}>
          {['All', ...members].map(m => (
            <button
              key={m}
              onClick={() => setMF(m)}
              style={{
                ...styles.filterBtn,
                background: memberFilter === m ? 'var(--bg-hover)' : 'transparent',
                color: m === 'All'
                  ? (memberFilter === m ? 'var(--text-primary)' : 'var(--text-muted)')
                  : memberColor(m, members),
                borderColor: memberFilter === m ? 'var(--border)' : 'transparent',
                fontWeight: memberFilter === m ? 600 : 500
              }}
            >{m}</button>
          ))}
        </div>
      </div>

      {/* Add task */}
      {adding ? (
        <form onSubmit={handleAdd} style={styles.addForm}>
          <input
            type="text"
            placeholder="Task description *"
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              style={{ flex: 1 }}
            >
              {members.map(m => <option key={m}>{m}</option>)}
            </select>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setAdding(false); setText('') }}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-ghost" style={styles.addBtn} onClick={() => setAdding(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add task
        </button>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          <p>{filter === 'Done' ? 'No completed tasks yet' : 'All clear!'}</p>
        </div>
      ) : (
        <ul style={styles.list}>
          {filtered.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              members={members}
              onToggle={() => toggleTodo(todo.id, !todo.done)}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function TodoItem({ todo, members, onToggle, onDelete }) {
  const color = memberColor(todo.assignee, members)

  return (
    <li style={styles.item}>
      <button
        onClick={onToggle}
        style={{
          ...styles.checkbox,
          borderColor: todo.done ? color : 'var(--border)',
          background: todo.done ? color : 'transparent'
        }}
        aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.done && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg-base)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </button>
      <div style={styles.itemContent}>
        <span style={{
          ...styles.itemText,
          textDecoration: todo.done ? 'line-through' : 'none',
          color: todo.done ? 'var(--text-muted)' : 'var(--text-primary)'
        }}>
          {todo.text}
        </span>
        <span style={{ fontSize: 12, color, fontWeight: 600 }}>{todo.assignee}</span>
      </div>
      <button
        className="btn btn-icon btn-ghost"
        onClick={onDelete}
        style={{ color: 'var(--danger)', minWidth: 36, minHeight: 36 }}
        aria-label="Delete task"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </li>
  )
}

const styles = {
  wrap: { padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 },
  summaryBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  summary: { fontSize: 14, color: 'var(--text-secondary)' },
  filters: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterRow: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  filterBtn: {
    padding: '6px 12px', borderRadius: 100,
    fontSize: 13, fontWeight: 500,
    border: '1px solid transparent',
    cursor: 'pointer', transition: 'all 0.15s',
    minHeight: 36
  },
  addBtn: {
    width: '100%', justifyContent: 'flex-start', gap: 8,
    padding: '12px 16px', borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border)', color: 'var(--text-muted)',
    minHeight: 48
  },
  addForm: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: 16,
    display: 'flex', flexDirection: 'column', gap: 10
  },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)'
  },
  checkbox: {
    width: 24, height: 24, minWidth: 24,
    borderRadius: 6, border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    transition: 'all 0.15s'
  },
  itemContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  itemText: { fontSize: 14, fontWeight: 500, wordBreak: 'break-word' }
}
