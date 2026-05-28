'use client'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'

interface Props {
  c: any
  dark: boolean
}

export function AuthPopup({ c, dark }: Props) {
  const { data: session } = useSession()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) return
    const alreadyDismissed = sessionStorage.getItem('auth_popup_dismissed')
    if (alreadyDismissed) return

    const timer = setTimeout(() => {
      setVisible(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [session])

  function dismiss() {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem('auth_popup_dismissed', '1')
  }

  if (session || dismissed || !visible) return null

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn .3s ease',
        }}
      />

      {/* POPUP */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '100%',
        maxWidth: 420,
        padding: '0 20px',
        animation: 'popUp .35s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{
          background: dark ? '#0f0f0f' : '#ffffff',
          border: `1px solid ${c.border}`,
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: dark ? '0 32px 80px rgba(0,0,0,0.8)' : '0 32px 80px rgba(0,0,0,0.15)',
          position: 'relative',
          textAlign: 'center',
        }}>
          {/* CLOSE */}
          <button onClick={dismiss}
            style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 7, background: c.surface, border: `1px solid ${c.border}`, color: c.muted, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            ×
          </button>

          {/* LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: -.3, color: c.text }}>SceneForge</span>
          </div>

          {/* HEADLINE */}
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -.4, marginBottom: 10, color: c.text, lineHeight: 1.3 }}>
            Start creating for free
          </h2>
          <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Get 10 free episodes. Research, scripts, voice, visuals and SEO — all in one workflow.
          </p>

          {/* FEATURES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28, textAlign: 'left' }}>
            {[
              '🎙 16 AI voices',
              '🌍 12 languages',
              '✍ 5 script variations',
              '🖼 AI thumbnails',
              '📊 SEO package',
              '🎧 Studio audio',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.muted, background: c.surface, padding: '8px 10px', borderRadius: 8, border: `1px solid ${c.border}` }}>
                {f}
              </div>
            ))}
          </div>

          {/* GOOGLE SIGN IN */}
          <button
            onClick={async () => { setLoading(true); await signIn('google', { callbackUrl: '/' }) }}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 14, fontWeight: 500, color: c.text,
              background: 'transparent', border: `1px solid ${c.border2}`,
              padding: '13px 20px', borderRadius: 10, cursor: loading ? 'default' : 'pointer',
              transition: 'all .15s', marginBottom: 12, opacity: loading ? .6 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.background = c.surface } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border2; e.currentTarget.style.background = 'transparent' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* DIVIDER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: c.border }} />
            <span style={{ fontSize: 11, color: c.subtle }}>or</span>
            <div style={{ flex: 1, height: 1, background: c.border }} />
          </div>

          {/* SIGN UP LINK */}
          <a href="/login" style={{ display: 'block', width: '100%', fontSize: 14, fontWeight: 500, color: c.accentFg, background: c.accent, padding: '13px', borderRadius: 10, textAlign: 'center', transition: 'opacity .15s', boxSizing: 'border-box' as const, marginBottom: 16 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Create free account →
          </a>

          <p style={{ fontSize: 11, color: c.subtle }}>
            10 free episodes · No card required · Cancel anytime
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popUp {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}
