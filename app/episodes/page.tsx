'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ProfileMenu } from '@/components/ui/ProfileMenu'

export default function EpisodesPage() {
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(d => {
      setEpisodes(d.data || [])
      setLoading(false)
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
        .nav-link { font-size: 13px; color: ${c.muted}; padding: 6px 12px; border-radius: 6px; transition: color .15s; }
        .nav-link:hover { color: ${c.text}; }
        .ep-row { transition: background .15s; border-bottom: 1px solid ${c.border}; }
        .ep-row:hover { background: ${c.surface} !important; }
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
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${c.border}`, backdropFilter: 'blur(16px)', background: c.nav }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.3 }}>SceneForge</span>
          </a>
          <div className="nav-center" style={{ display: 'flex', gap: 0 }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} className="nav-link" style={{ color: h === '/episodes' ? c.text : c.muted }}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setDark(!dark)} style={{ width: 30, height: 30, borderRadius: 6, background: 'transparent', border: `1px solid ${c.border}`, color: c.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -.5, marginBottom: 4 }}>Your Work</h1>
            <p style={{ fontSize: 13, color: c.muted }}>All episodes you've generated</p>
          </div>
          <a href="/" style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '9px 20px', borderRadius: 8 }}>
            + Create episode
          </a>
        </div>

        {/* EMPTY STATE */}
        {!loading && episodes.length === 0 && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🎙</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No episodes yet</h2>
            <p style={{ fontSize: 13, color: c.muted, marginBottom: 24 }}>Create your first episode and it'll show up here.</p>
            <a href="/" style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, padding: '10px 24px', borderRadius: 8, display: 'inline-block' }}>
              Create your first episode →
            </a>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center', color: c.muted, fontSize: 13 }}>
            Loading episodes…
          </div>
        )}

        {/* EPISODE LIST */}
        {!loading && episodes.length > 0 && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {episodes.map((ep: any, i: number) => (
              <div key={ep.id} className="ep-row ep-grid" style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 20, background: 'transparent' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{ep.title || ep.topic}</div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11, color: c.muted, fontFamily: 'monospace' }}>
                    <span>{new Date(ep.createdAt).toLocaleDateString()}</span>
                    <span style={{ color: ep.status === 'complete' ? '#4ade80' : ep.status === 'failed' ? '#f87171' : c.muted }}>
                      {ep.status === 'complete' ? '● Ready' : ep.status === 'failed' ? '✕ Failed' : '◌ ' + ep.status}
                    </span>
                    {ep.youtubeUrl && <a href={ep.youtubeUrl} target="_blank" style={{ color: c.muted }}>YouTube ↗</a>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {ep.audioUrl && <audio controls src={ep.audioUrl} style={{ height: 28, width: 160, opacity: 0.7 }} />}
                  <a href={`/share/${ep.shareId}`} target="_blank" style={{ fontSize: 12, color: c.muted, border: `1px solid ${c.border}`, padding: '5px 12px', borderRadius: 6, whiteSpace: 'nowrap', transition: 'border-color .15s' }}>
                    Share ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>SceneForge</span>
        <div style={{ display: 'flex', gap: 0 }}>
          {[['Terms','/terms'],['Privacy','/privacy']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: c.muted, padding: '4px 10px' }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2025 SceneForge</span>
      </footer>
    </div>
  )
}
