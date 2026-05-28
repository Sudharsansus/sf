'use client'
import { useState } from 'react'

export default function NotFound() {
  const [dark] = useState(true)
  const c = dark ? {
    bg: '#0a0a0a', surface: '#141414', border: '#222',
    text: '#f5f5f5', muted: '#888', subtle: '#444',
    accent: '#f5f5f5', accentFg: '#0a0a0a',
  } : {
    bg: '#ffffff', surface: '#f0f0f0', border: '#d0d0d0',
    text: '#0a0a0a', muted: '#444', subtle: '#666',
    accent: '#0a0a0a', accentFg: '#ffffff',
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", color: c.text, padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } a { color: inherit; text-decoration: none; }`}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>SceneForge</span>
        </div>
        <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: -4, lineHeight: 1, marginBottom: 16, color: c.subtle }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -.4, marginBottom: 10 }}>Page not found</h1>
        <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, marginBottom: 36 }}>The page you're looking for doesn't exist or has been moved.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <a href="/" style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '10px 24px', borderRadius: 8 }}>Go home</a>
          <a href="/studio" style={{ fontSize: 13, color: c.muted, border: `1px solid ${c.border}`, padding: '10px 24px', borderRadius: 8 }}>Studio →</a>
        </div>
      </div>
    </div>
  )
}
