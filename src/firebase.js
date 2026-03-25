import { initializeApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  off
} from 'firebase/database'

let app = null
let db = null

// ── Init ──────────────────────────────────────────────────────────
export function initFirebase(apiKey, projectId) {
  if (app) return db
  app = initializeApp({
    apiKey,
    authDomain: `${projectId}.firebaseapp.com`,
    databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
    projectId,
    storageBucket: `${projectId}.appspot.com`,
    messagingSenderId: '',
    appId: ''
  })
  db = getDatabase(app)
  return db
}

export function getDb() { return db }

// ── Generic helpers ───────────────────────────────────────────────

/** Subscribe to a path. Returns unsubscribe fn. */
export function subscribe(path, callback) {
  if (!db) return () => {}
  const r = ref(db, path)
  const handler = (snap) => callback(snap.val())
  onValue(r, handler)
  return () => off(r, 'value', handler)
}

/** Push a new item (auto-ID). Returns the new key. */
export async function pushItem(path, data) {
  if (!db) return null
  const newRef = push(ref(db, path))
  await set(newRef, { ...data, id: newRef.key })
  return newRef.key
}

/** Overwrite a specific path. */
export async function setItem(path, data) {
  if (!db) return
  await set(ref(db, path), data)
}

/** Partial update on a path. */
export async function updateItem(path, data) {
  if (!db) return
  await update(ref(db, path), data)
}

/** Delete a path. */
export async function removeItem(path) {
  if (!db) return
  await remove(ref(db, path))
}

// ── Domain helpers ────────────────────────────────────────────────

// EVENTS
export const addEvent     = (dateKey, data)       => pushItem(`events/${dateKey}`, data)
export const deleteEvent  = (dateKey, id)         => removeItem(`events/${dateKey}/${id}`)
export const watchEvents  = (cb)                  => subscribe('events', cb)

// TODOS
export const addTodo      = (data)                => pushItem('todos', data)
export const toggleTodo   = (id, done)            => updateItem(`todos/${id}`, { done })
export const deleteTodo   = (id)                  => removeItem(`todos/${id}`)
export const watchTodos   = (cb)                  => subscribe('todos', cb)

// GROCERY
export const addGrocery   = (data)                => pushItem('grocery', data)
export const toggleGrocery= (id, checked)         => updateItem(`grocery/${id}`, { checked })
export const deleteGrocery= (id)                  => removeItem(`grocery/${id}`)
export const watchGrocery = (cb)                  => subscribe('grocery', cb)

// STORIES
export const addStory     = (data)                => pushItem('stories', data)
export const updateStory  = (id, data)            => updateItem(`stories/${id}`, data)
export const deleteStory  = (id)                  => removeItem(`stories/${id}`)
export const watchStories = (cb)                  => subscribe('stories', cb)

// SPRINTS
export const addSprint    = (data)                => pushItem('sprints', data)
export const updateSprint = (id, data)            => updateItem(`sprints/${id}`, data)
export const deleteSprint = (id)                  => removeItem(`sprints/${id}`)
export const watchSprints = (cb)                  => subscribe('sprints', cb)
