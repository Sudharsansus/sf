'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Nav } from '@/components/ui/Nav'

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
      <Nav c={c} dark={dark} setDark={setDark} activePath="/episodes" />

      {/* CONTENT */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 24px' }}>
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
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ padding: '18px 24px', borderBottom: i < 3 ? `1px solid ${c.border}` : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: c.surface2, flexShrink: 0, animation: 'shimmer 1.5s ease-in-out infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, width: '45%', background: c.surface2, borderRadius: 4, marginBottom: 8, animation: 'shimmer 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 10, width: '25%', background: c.surface, borderRadius: 4, animation: 'shimmer 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ height: 28, width: 160, background: c.surface2, borderRadius: 6, animation: 'shimmer 1.5s ease-in-out infinite' }} />
              </div>
            ))}
            <style>{`@keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
          </div>
        )}

        {/* EPISODE LIST */}
        {!loading && episodes.length > 0 && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {episodes.map((ep: any, i: number) => (
              <div key={ep.id} className="ep-row" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, background: 'transparent' }}>
                {ep.thumbnailUrls?.[0] ? (
                  <img src={ep.thumbnailUrls[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: `1px solid ${c.border}`, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: c.surface2, border: `1px solid ${c.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎙</div>
                )}
                <div style={{ flex: 1 }}>
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
