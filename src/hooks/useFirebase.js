import { useState, useEffect } from 'react'
import { subscribe } from '../firebase.js'

/**
 * Generic Firebase realtime listener hook.
 * Converts Firebase object maps → arrays automatically.
 *
 * @param {string}   path       Firebase path (e.g. 'todos')
 * @param {boolean}  asArray    If true, convert object → array (default true)
 * @param {boolean}  ready      Delay subscription until Firebase is initialised
 */
export function useFirebase(path, asArray = true, ready = true) {
  const [data, setData] = useState(asArray ? [] : null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    setLoading(true)
    const unsub = subscribe(path, (val) => {
      if (asArray) {
        if (val && typeof val === 'object') {
          setData(Object.values(val))
        } else {
          setData([])
        }
      } else {
        setData(val)
      }
      setLoading(false)
    })
    return unsub
  }, [path, ready])

  return { data, loading }
}

/**
 * Events are stored nested: events/<dateKey>/<id>
 * Returns a flat array of events with dateKey attached.
 */
export function useEvents(ready = true) {
  const { data: rawMap, loading } = useFirebase('events', false, ready)

  const [events, setEvents] = useState([])

  useEffect(() => {
    if (!rawMap) { setEvents([]); return }
    const flat = []
    Object.entries(rawMap).forEach(([dateKey, dayEvents]) => {
      if (dayEvents && typeof dayEvents === 'object') {
        Object.values(dayEvents).forEach(ev => {
          flat.push({ ...ev, dateKey })
        })
      }
    })
    setEvents(flat)
  }, [rawMap])

  return { events, loading }
}
