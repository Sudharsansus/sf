'use client'
import { useState, useRef, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'

interface Props {
  c: any
}

export function ProfileMenu({ c }: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState<string>('free')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => {
        setCredits(d.credits ?? null)
        setPlan(d.plan ?? 'free')
      })
    }
  }, [session])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!session) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <a href="/login" style={{ fontSize: 13, color: c.muted, padding: '6px 12px', borderRadius: 6 }}>Sign in</a>
      <a href="/login" style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '7px 16px', borderRadius: 7 }}>Get started</a>
    </div>
  )

  const initials = session.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : session.user?.email?.[0].toUpperCase() || 'U'

  const planColor = plan === 'pro' ? '#a78bfa' : plan === 'studio' ? '#fb923c' : plan === 'agency' ? '#4ade80' : c.subtle

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, border: `1px solid ${open ? c.border2 : c.border}`, background: open ? c.surface : 'transparent', cursor: 'pointer', transition: 'all .15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = c.surface; e.currentTarget.style.borderColor = c.border2 }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = c.border } }}>
        {session.user?.image ? (
          <img src={session.user.image} alt="" referrerPolicy="no-referrer" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.surface2, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: c.text }}>{initials}</div>
        )}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: c.text, lineHeight: 1.2 }}>{session.user?.name?.split(' ')[0] || 'Account'}</div>
          <div style={{ fontSize: 10, color: planColor, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: .3, fontWeight: 600 }}>{plan}</div>
        </div>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: c.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 240, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200, overflow: 'hidden', animation: 'fadeUp .15s ease' }}>

          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {session.user?.image ? (
                <img src={session.user.image} alt="" referrerPolicy="no-referrer" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.surface2, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: c.text }}>{initials}</div>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{session.user?.name || 'User'}</div>
                <div style={{ fontSize: 11, color: c.muted }}>{session.user?.email}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: c.muted }}>Minutes remaining</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: credits === 0 ? '#f87171' : c.text }}>{credits ?? '—'}</span>
            </div>
            <div style={{ height: 3, background: c.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(((credits || 0) / 30) * 100, 100)}%`, background: credits === 0 ? '#f87171' : credits && credits < 5 ? '#fb923c' : '#4ade80', borderRadius: 2, transition: 'width .3s' }} />
            </div>
            {credits === 0 && (
              <a href="/dashboard" onClick={() => setOpen(false)} style={{ display: 'block', marginTop: 8, fontSize: 11, fontWeight: 600, color: '#fb923c', textAlign: 'center', border: '1px solid rgba(251,146,60,0.3)', padding: '5px 0', borderRadius: 6 }}>⚡ Buy credits →</a>
            )}
          </div>

          <div style={{ padding: '6px 0' }}>
            {[
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>, label: 'Studio', href: '/studio' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, label: 'My Work', href: '/episodes' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: 'Analytics', href: '/analytics' },
              { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>, label: 'Dashboard', href: '/dashboard' },
            ].map(item => (
              <a key={item.label} href={item.href} onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: c.text, transition: 'background .12s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = c.surface2)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ color: c.muted, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>

          {plan === 'free' && (
            <div style={{ padding: '0 8px 8px' }}>
              <a href="/dashboard" onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 8, background: c.surface2, border: `1px solid ${c.border}`, fontSize: 12, fontWeight: 600, color: c.text, cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                  Upgrade plan
                </span>
              </a>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${c.border}`, padding: '6px 0' }}>
            <button onClick={() => { setOpen(false); signOut({ callbackUrl: '/login' }) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: c.muted, background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'background .12s, color .12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = c.surface2; e.currentTarget.style.color = c.text }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.muted }}>
              <span style={{ color: c.muted, display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
