'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  const c = { bg: '#0a0a0a', surface: '#141414', border: '#222', text: '#f5f5f5', muted: '#888', subtle: '#444', accent: '#f5f5f5', accentFg: '#0a0a0a' }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", color: c.text, padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } a { color: inherit; text-decoration: none; } button { font-family: inherit; cursor: pointer; }`}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>SceneForge</span>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 22 }}>⚠</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -.4, marginBottom: 10 }}>Something went wrong</h1>
        <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, marginBottom: 36 }}>An unexpected error occurred. Our team has been notified. Please try again.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={reset} style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '10px 24px', borderRadius: 8, border: 'none' }}>Try again</button>
          <a href="/" style={{ fontSize: 13, color: c.muted, border: `1px solid ${c.border}`, padding: '10px 24px', borderRadius: 8 }}>Go home</a>
        </div>
      </div>
    </div>
  )
}
