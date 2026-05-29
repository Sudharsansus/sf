'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [dark] = useState(true)

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

  return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", color: c.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; outline: none; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 380, padding: '0 24px' }}>
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: -.3 }}>SUS</span>
          </a>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -.4, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: c.muted }}>AI creator production studio</p>
        </div>

        {/* CARD */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 13, color: c.muted, textAlign: 'center', marginBottom: 20 }}>Sign in to your account</p>
          <button
            onClick={async () => { setLoading(true); await signIn('google', { callbackUrl: '/' }) }}
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: c.text, background: 'transparent', border: `1px solid ${c.border}`, padding: '11px 20px', borderRadius: 7, cursor: loading ? 'default' : 'pointer', transition: 'border-color .15s', opacity: loading ? .6 : 1 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = c.border2 }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: c.muted, marginTop: 20 }}>
          10 free credits on sign up · No card required
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: c.subtle, marginTop: 8 }}>
          By signing in you agree to our{' '}
          <a href="/terms" style={{ color: c.muted, borderBottom: `1px solid ${c.border}` }}>Terms</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: c.muted, borderBottom: `1px solid ${c.border}` }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
