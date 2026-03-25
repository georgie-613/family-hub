import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import StoryCard from './StoryCard.jsx'
import StoryModal from './StoryModal.jsx'
import { addStory, updateStory, deleteStory } from '../firebase.js'

const COLUMNS = ['Backlog', 'Sprint Planning', 'In Progress', 'Review', 'Done']

const COL_ACCENT = {
  'Backlog':         'var(--text-muted)',
  'Sprint Planning': 'var(--jorge)',
  'In Progress':     'var(--wife)',
  'Review':          'var(--sprint)',
  'Done':            'var(--family)'
}

// ── Sortable Card wrapper ─────────────────────────────────────────
function SortableCard({ story, members, onEdit, onDelete, columns, isMobile }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: story.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <StoryCard
        story={story}
        members={members}
        onEdit={() => onEdit(story)}
        onDelete={() => onDelete(story.id)}
        dragHandleProps={isMobile ? {} : { ...attributes, ...listeners }}
        columns={isMobile ? columns : null}
        onMove={isMobile ? (id, col) => updateStory(id, { column: col }) : null}
      />
    </div>
  )
}

// ── Column ────────────────────────────────────────────────────────
function BoardColumn({ column, stories, members, onEdit, onDelete, onAddCard, isMobile }) {
  const accent = COL_ACCENT[column]
  const totalPts = stories.reduce((s, c) => s + (c.points || 0), 0)

  return (
    <div
      className="board-column card"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Column header */}
      <div style={{ ...styles.colHeader, borderTop: `3px solid ${accent}` }}>
        <div style={styles.colHeaderLeft}>
          <span style={styles.colTitle}>{column}</span>
          <span style={styles.colMeta}>{stories.length} · {totalPts}pt</span>
        </div>
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => onAddCard(column)}
          style={{ color: accent, minWidth: 32, minHeight: 32, width: 32, height: 32 }}
          aria-label={`Add card to ${column}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Cards */}
      <div style={styles.colCards}>
        <SortableContext items={stories.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {stories.length === 0 ? (
            <div style={styles.emptyCol}>
              <span>Drop cards here</span>
            </div>
          ) : stories.map(story => (
            <SortableCard
              key={story.id}
              story={story}
              members={members}
              onEdit={onEdit}
              onDelete={onDelete}
              columns={COLUMNS}
              isMobile={isMobile}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// ── Main Board ────────────────────────────────────────────────────
export default function ScrumBoard({ stories, members }) {
  const [addingToColumn, setAddingToColumn] = useState(null)
  const [editingStory,   setEditingStory]   = useState(null)
  const [activeId,       setActiveId]       = useState(null)

  // Detect touch-primary device
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  // Group stories by column
  const byColumn = {}
  COLUMNS.forEach(c => { byColumn[c] = [] })
  ;(stories || []).forEach(s => {
    const col = COLUMNS.includes(s.column) ? s.column : 'Backlog'
    byColumn[col].push(s)
  })

  // Sort by createdAt within each column
  COLUMNS.forEach(c => {
    byColumn[c].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  })

  const activeStory = activeId ? stories.find(s => s.id === activeId) : null

  function handleDragStart({ active }) {
    setActiveId(active.id)
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return

    const activeStory = stories.find(s => s.id === active.id)
    if (!activeStory) return

    // Determine target column
    let targetColumn = null
    // Check if dropped on a column container
    if (COLUMNS.includes(over.id)) {
      targetColumn = over.id
    } else {
      // Dropped on another card — find its column
      const overStory = stories.find(s => s.id === over.id)
      if (overStory) targetColumn = overStory.column
    }

    if (targetColumn && targetColumn !== activeStory.column) {
      updateStory(activeStory.id, { column: targetColumn })
    }
  }

  async function handleSave(data) {
    if (editingStory) {
      await updateStory(editingStory.id, data)
    } else {
      await addStory({ ...data, createdAt: Date.now() })
    }
  }

  async function handleDelete(id) {
    await deleteStory(id)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-scroll">
          {COLUMNS.map(col => (
            <BoardColumn
              key={col}
              column={col}
              stories={byColumn[col]}
              members={members}
              onEdit={(story) => setEditingStory(story)}
              onDelete={handleDelete}
              onAddCard={(column) => { setEditingStory(null); setAddingToColumn(column) }}
              isMobile={isMobile}
            />
          ))}
        </div>

        <DragOverlay>
          {activeStory && (
            <div style={{ opacity: 0.9, transform: 'scale(1.03)', boxShadow: 'var(--shadow-modal)' }}>
              <StoryCard story={activeStory} members={members} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {(addingToColumn || editingStory) && (
        <StoryModal
          story={editingStory}
          members={members}
          defaultColumn={addingToColumn || 'Backlog'}
          onSave={handleSave}
          onClose={() => { setAddingToColumn(null); setEditingStory(null) }}
        />
      )}
    </>
  )
}

const styles = {
  colHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 12px 10px',
    background: 'var(--bg-card)'
  },
  colHeaderLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  colTitle: { fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  colMeta: { fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 7px', borderRadius: 100 },
  colCards: { padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 },
  emptyCol: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 80, color: 'var(--text-muted)', fontSize: 12,
    border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)'
  }
}
