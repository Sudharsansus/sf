'use client'

import { useState } from 'react'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim() || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Failed to join waitlist')
        return
      }

      setStatus('success')
      setMessage("You're on the list! We'll be in touch soon.")
      setEmail('')
      setName('')
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#0c0c0c' }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#f0f0f0' }}>Join the Waitlist</h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Be the first to know when SceneForge launches</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>Name (optional)</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'loading'}
              style={{
                width: '100%',
                fontSize: 14,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #333',
                background: '#111',
                color: '#f0f0f0',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              required
              style={{
                width: '100%',
                fontSize: 14,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #333',
                background: '#111',
                color: '#f0f0f0',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {status !== 'idle' && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                textAlign: 'center',
                background: status === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${status === 'success' ? '#4ade80' : '#ef4444'}`,
                color: status === 'success' ? '#4ade80' : '#ef4444'
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '14px 20px',
              borderRadius: 8,
              background: '#f0f0f0',
              color: '#0c0c0c',
              border: 'none',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 14,
              opacity: status === 'loading' ? 0.5 : 1
            }}
          >
            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #222', textAlign: 'center' }}>
          <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 14 }}>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
