'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Nav } from '@/components/ui/Nav'

const PLANS = [
  { id: 'starter', name: 'Starter',  credits: 30,   price: '$19',  desc: 'Great for trying it out',     perEp: '$0.63/ep' },
  { id: 'pro',     name: 'Pro',      credits: 100,  price: '$29',  desc: 'Most popular for creators',   perEp: '$0.29/ep', badge: 'MOST POPULAR' },
  { id: 'studio',  name: 'Studio',   credits: 400,  price: '$79',  desc: 'For serious producers',       perEp: '$0.20/ep' },
  { id: 'agency',  name: 'Agency',   credits: 1500, price: '$199', desc: 'For teams and agencies',      perEp: '$0.13/ep' },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)
  const [data, setData] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/credits').then(r => r.json()),
      fetch('/api/analytics').then(r => r.json())
    ]).then(([cred, analytics]) => {
      setData({ ...cred, connected: analytics?.connected || {} })
      setEpisodes(analytics?.episodes?.slice(0, 5) || [])
    })
  }, [])

  const c = dark ? {
    bg: '#0a0a0a', nav: 'rgba(10,10,10,0.92)', surface: '#141414',
    surface2: '#1a1a1a', border: '#222', border2: '#2a2a2a',
    text: '#f5f5f5', muted: '#888', subtle: '#444',
    accent: '#f5f5f5', accentFg: '#0a0a0a',
  } : {
    bg: '#ffffff', nav: 'rgba(255,255,255,0.92)', surface: '#f0f0f0',
    surface2: '#efefef', border: '#d0d0d0', border2: '#bbb',
    text: '#0a0a0a', muted: '#444', subtle: '#666',
    accent: '#0a0a0a', accentFg: '#ffffff',
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif", transition: 'background .3s, color .3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; outline: none; }
        .nav-link { font-size: 13px; color: ${dark ? c.muted : c.text}; padding: 6px 12px; border-radius: 6px; transition: color .15s, background .15s; }
        .nav-link:hover { color: ${c.text}; background: ${dark ? 'transparent' : c.surface}; }
        .row-item { transition: background .15s; }
        .row-item:hover { background: ${c.surface} !important; }
        @media (max-width: 768px) {
          .ep-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .plans-grid { grid-template-columns: 1fr 1fr !important; }
          .platforms-grid { grid-template-columns: 1fr !important; }
          nav .nav-center { display: none !important; }
        }
        @media (max-width: 480px) {
          .plans-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <Nav c={c} dark={dark} setDark={setDark} activePath="/dashboard" />

      {/* CONTENT */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 24px 80px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Account</p>
          <h1 style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, letterSpacing: -.6, lineHeight: 1.15 }}>Dashboard</h1>
        </div>

        {/* STATS */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 36 }}>
          {[
            [String(data?.credits ?? '—'), 'Credits remaining'],
            [String(episodes.length), 'Episodes generated'],
            [data?.plan?.toUpperCase() || 'Free', 'Current plan'],
          ].map(([v, l], i, arr) => (
            <div key={l} style={{ padding: '28px 24px', borderRight: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
              <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1, marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: 13, color: c.muted }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CONNECT PLATFORMS */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: -.3, marginBottom: 16 }}>Connect platforms</h2>
          <div className="platforms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'youtube', label: '▶ YouTube', href: '/api/youtube' },
              { key: 'instagram', label: '📸 Instagram', href: '/api/instagram' },
            ].map(({ key, label, href }) => (
              <div key={key} style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = c.border2)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: data?.connected?.[key] ? '#4ade80' : c.subtle }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: data?.connected?.[key] ? '#4ade80' : c.subtle, display: 'inline-block' }} />
                    {data?.connected?.[key] ? 'Connected' : 'Not connected'}
                  </div>
                </div>
                {!data?.connected?.[key] && (
                  <a href={href} style={{ fontSize: 12, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '7px 16px', borderRadius: 7, transition: 'opacity .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>Connect</a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: -.3, marginBottom: 16 }}>Get more credits</h2>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ border: `1px solid ${p.badge ? c.border2 : c.border}`, borderRadius: 12, padding: '24px 22px', transition: 'border-color .2s', position: 'relative', background: p.badge ? c.surface : 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = c.border2)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = p.badge ? c.border2 : c.border)}>
                {p.badge && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, letterSpacing: .8, color: '#fb923c', background: c.bg, border: '1px solid rgba(251,146,60,0.4)', padding: '2px 10px', borderRadius: 4, whiteSpace: 'nowrap' }}>{p.badge}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}>
                  <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontSize: 12, color: c.muted }}>/mo</span>
                </div>
                <div style={{ fontSize: 11, color: c.subtle, marginBottom: 4 }}>{p.credits} credits · {p.perEp}</div>
                <div style={{ fontSize: 11, color: c.muted, marginBottom: 16 }}>{p.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  {[
                    `${p.credits} episodes/mo`,
                    'All 16 voices',
                    '12 languages',
                    'Audio + thumbnails',
                    'SEO package',
                    p.id === 'agency' ? 'Team access' : 'YouTube upload',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.muted }}>
                      <span style={{ color: '#4ade80', fontSize: 10, flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', fontSize: 13, fontWeight: 500, color: p.badge ? c.accentFg : c.text, background: p.badge ? c.accent : 'transparent', border: `1px solid ${p.badge ? c.accent : c.border}`, padding: '10px', borderRadius: 7, cursor: 'pointer', transition: 'opacity .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  Buy {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT EPISODES */}
        {episodes.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: -.3, marginBottom: 16 }}>Recent episodes</h2>
            <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {episodes.map((ep: any, i: number) => (
                <div key={ep.id} className="row-item"
                  style={{ background: c.bg, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < episodes.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{ep.title || ep.topic}</div>
                    <div style={{ fontSize: 11, color: c.subtle, fontFamily: 'monospace', display: 'flex', gap: 10 }}>
                      <span>{new Date(ep.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span style={{ color: ep.status === 'complete' ? '#4ade80' : ep.status === 'failed' ? '#f87171' : c.subtle }}>{ep.status}</span>
                      {ep.youtubeUrl && <a href={ep.youtubeUrl} target="_blank" style={{ color: c.muted }}>YouTube ↗</a>}
                    </div>
                  </div>
                  <a href={`/share/${ep.shareId}`} style={{ fontSize: 12, color: c.muted, border: `1px solid ${c.border}`, padding: '5px 12px', borderRadius: 6, transition: 'border-color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = c.border2)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>View →</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Sus</span>
        </div>
        <div style={{ display: 'flex' }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: c.muted, padding: '4px 10px', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = c.text)}
              onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2025 Sus</span>
      </footer>
    </div>
  )
}
