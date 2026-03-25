import React, { useState } from 'react'

export default function SetupScreen({ onComplete }) {
  const [apiKey, setApiKey]         = useState('')
  const [projectId, setProjectId]   = useState('')
  const [name, setName]             = useState('')
  const [spouseName, setSpouseName] = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!apiKey.trim() || !projectId.trim() || !name.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      const testUrl = `https://${projectId.trim()}-default-rtdb.firebaseio.com/.json?auth=${apiKey.trim()}&shallow=true`
      const res = await fetch(testUrl)
      if (!res.ok && res.status !== 404) throw new Error(`Firebase returned ${res.status}`)
    } catch (err) { console.warn('Firebase check skipped:', err.message) }
    setLoading(false)
    onComplete({ apiKey: apiKey.trim(), projectId: projectId.trim(), name: name.trim(), spouseName: spouseName.trim() || 'Wife' })
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--jorge)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <h1 style={styles.title}>Family Hub</h1>
          <p style={styles.subtitle}>Set up your family command center</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Names</h2>
            <div style={styles.field}><label style={styles.label} htmlFor="name">Your Name *</label><input id="name" type="text" placeholder="e.g. Jorge" value={name} onChange={e => setName(e.target.value)} autoCapitalize="words" autoComplete="given-name" required /></div>
            <div style={styles.field}><label style={styles.label} htmlFor="spouse">Partner's Name</label><input id="spouse" type="text" placeholder="e.g. Maria (default: Wife)" value={spouseName} onChange={e => setSpouseName(e.target.value)} autoCapitalize="words" autoComplete="off" /></div>
          </section>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Firebase Config</h2>
            <p style={styles.hint}>Firebase Console → Project Settings → Web app → SDK setup</p>
            <div style={styles.field}><label style={styles.label} htmlFor="apiKey">APIKey *</label><input id="apiKey" type="text" placeholder="AIzaSy..." value={apiKey} onChange={e => setApiKey(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck="false" required /></div>
            <div style={styles.field}><label style={styles.label} htmlFor="projectId">Project ID *</label><input id="projectId" type="text" placeholder="my-family-hub-abc123" value={projectId} onChange={e => setProjectId(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck="false" required /></div>
          </section>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>{loading ? 'Connecting…' : 'Connect & Launch →'}</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  wrap: { minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', paddingTop: 'calc(24px + env(safe-area-inset-top))', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 24px', width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-modal)' },
  logo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoIcon: { width: 64, height: 64, borderRadius: 16, background: 'var(--bg-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  section: { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionTitle: { fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' },
  hint: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--bg-input)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' },
  error: { fontSize: 13, color: 'var(--danger)', background: 'rgba(196,122,106,0.1)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(196,122,106,0.25)' }
}
