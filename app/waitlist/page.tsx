'use client'
import { useState } from 'react'

export default function WaitlistPage() {
  const [dark] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const c = dark ? {
    bg: '#0a0a0a', surface: '#141414', surface2: '#1a1a1a',
    border: '#222', border2: '#2a2a2a',
    text: '#f5f5f5', muted: '#888', subtle: '#444',
    accent: '#f5f5f5', accentFg: '#0a0a0a',
  } : {
    bg: '#ffffff', surface: '#f0f0f0', surface2: '#efefef',
    border: '#d0d0d0', border2: '#bbb',
    text: '#0a0a0a', muted: '#444', subtle: '#666',
    accent: '#0a0a0a', accentFg: '#ffffff',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setStatus('error'); setMessage('Please enter a valid email'); return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setMessage(data.error || 'Failed to join waitlist'); return }
      setStatus('success')
      setMessage("You're on the list! We'll be in touch soon.")
      setEmail(''); setName('')
    } catch {
      setStatus('error'); setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif", color: c.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button, input { font-family: inherit; outline: none; }
        input::placeholder { color: ${c.subtle}; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: -.3 }}>Sus</span>
          </a>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -.5, marginBottom: 8 }}>Join the Waitlist</h1>
          <p style={{ fontSize: 13, color: c.muted }}>Be the first to know when Sus launches</p>
        </div>

        {/* FORM */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: c.muted, marginBottom: 6, fontWeight: 500 }}>Name (optional)</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={status === 'loading'}
                style={{ width: '100%', fontSize: 13, padding: '10px 14px', borderRadius: 7, border: `1px solid ${c.border}`, background: c.bg, color: c.text, transition: 'border-color .15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = c.border2)}
                onBlur={e => (e.currentTarget.style.borderColor = c.border)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: c.muted, marginBottom: 6, fontWeight: 500 }}>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status === 'loading'}
                required
                style={{ width: '100%', fontSize: 13, padding: '10px 14px', borderRadius: 7, border: `1px solid ${c.border}`, background: c.bg, color: c.text, transition: 'border-color .15s' }}
                onFocus={e => (e.currentTarget.style.borderColor = c.border2)}
                onBlur={e => (e.currentTarget.style.borderColor = c.border)}
              />
            </div>

            {status !== 'idle' && (
              <div style={{ padding: '10px 14px', borderRadius: 7, fontSize: 13, textAlign: 'center', background: status === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${status === 'success' ? '#4ade80' : '#f87171'}`, color: status === 'success' ? '#4ade80' : '#f87171' }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '11px 20px', borderRadius: 7, background: c.accent, color: c.accentFg, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: 13, opacity: status === 'loading' ? .5 : 1, transition: 'opacity .15s' }}
              onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.opacity = '.8' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = status === 'loading' ? '.5' : '1' }}>
              {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: c.subtle }}>
          <a href="/" style={{ color: c.muted, transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = c.text)}
            onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  )
}
