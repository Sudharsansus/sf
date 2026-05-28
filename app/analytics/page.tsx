'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ProfileMenu } from '@/components/ui/ProfileMenu'

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData)
  }, [])

  const episodes = data?.episodes || []
  const channelStats = data?.channelStats || {}

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
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${c.border}`, backdropFilter: 'blur(16px)', background: c.nav, transition: 'background .3s' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.3 }}>SceneForge</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} className="nav-link">{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setDark(!dark)} style={{ width: 30, height: 30, borderRadius: 6, background: 'transparent', border: `1px solid ${c.border}`, color: c.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.text; e.currentTarget.style.color = c.text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.muted }}>
              {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
            </button>
            <ProfileMenu c={c} />
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Analytics</p>
          <h1 style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, letterSpacing: -.6, lineHeight: 1.15 }}>Channel stats</h1>
        </div>

        {/* CHANNEL STATS */}
        {channelStats.viewCount && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 36 }}>
            {[
              [Number(channelStats.viewCount).toLocaleString(), 'Total views'],
              [Number(channelStats.subscriberCount).toLocaleString(), 'Subscribers'],
              [Number(channelStats.videoCount).toLocaleString(), 'Videos uploaded'],
              [String(episodes.length), 'Episodes generated'],
            ].map(([v, l], i, arr) => (
              <div key={String(l)} style={{ padding: '24px 22px', borderRight: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -1, lineHeight: 1, marginBottom: 6 }}>{v}</div>
                <div style={{ fontSize: 12, color: c.muted }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* EPISODES TABLE */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: -.3, marginBottom: 16 }}>Episodes</h2>
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {episodes.length === 0 ? (
              <div style={{ padding: '40px 28px', textAlign: 'center', color: c.subtle, fontSize: 13 }}>
                No episodes yet.{' '}
                <a href="/" style={{ color: c.muted, borderBottom: `1px solid ${c.border}` }}>Generate your first →</a>
              </div>
            ) : (
              episodes.map((ep: any, i: number) => (
                <div key={ep.id} className="row-item"
                  style={{ background: c.bg, padding: '16px 22px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16, borderBottom: i < episodes.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 5 }}>{ep.title || ep.topic}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: c.subtle, fontFamily: 'monospace', alignItems: 'center' }}>
                      <span>{new Date(ep.createdAt).toLocaleDateString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: ep.status === 'complete' ? '#4ade80' : ep.status === 'failed' ? '#f87171' : c.subtle, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: ep.status === 'complete' ? '#4ade80' : ep.status === 'failed' ? '#f87171' : c.muted }}>
                          {ep.status === 'complete' ? 'Ready' : ep.status === 'failed' ? 'Failed' : ep.status}
                        </span>
                      </span>
                      {ep.youtubeUrl && <a href={ep.youtubeUrl} target="_blank" style={{ color: c.muted }}>YouTube ↗</a>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {ep.audioUrl && <audio controls src={ep.audioUrl} style={{ height: 28, width: 160, opacity: 0.8 }} />}
                    <a href={`/share/${ep.shareId}`} target="_blank"
                      style={{ fontSize: 12, color: c.muted, border: `1px solid ${c.border}`, padding: '5px 12px', borderRadius: 6, whiteSpace: 'nowrap', transition: 'border-color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = c.border2)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
                      Share ↗
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>SceneForge</span>
        </div>
        <div style={{ display: 'flex' }}>
          {[['Terms','/terms'],['Privacy','/privacy'],['GitHub','https://github.com/Sudharsansus/sf']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: c.muted, padding: '4px 10px', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = c.text)}
              onMouseLeave={e => (e.currentTarget.style.color = c.muted)}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2025 SceneForge</span>
      </footer>
    </div>
  )
}
