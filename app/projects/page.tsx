'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ProfileMenu } from '@/components/ui/ProfileMenu'

interface Project {
  id: string
  name: string
  description?: string
  episodeCount: number
  createdAt: string
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

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

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => {
      setProjects(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() })
      })
      const p = await res.json()
      setProjects(prev => [p, ...prev])
      setNewName(''); setNewDesc(''); setShowForm(false)
    } catch (e) { console.error(e) }
    finally { setCreating(false) }
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif", transition: 'background .3s, color .3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button, input, textarea { font-family: inherit; outline: none; }
        .nav-link { font-size: 13px; color: ${c.muted}; padding: 6px 12px; border-radius: 6px; transition: color .15s; }
        .nav-link:hover { color: ${c.text}; }
        .proj-card { transition: border-color .2s, background .15s; }
        .proj-card:hover { border-color: ${c.border2} !important; background: ${c.surface} !important; }
        @media (max-width: 768px) { .nav-center { display: none !important; } }
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
          <div className="nav-center" style={{ display: 'flex' }}>
            {[['Studio','/studio'],['Work','/episodes'],['Dashboard','/dashboard']].map(([l,h]) => (
              <a key={l} href={h} className="nav-link">{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setDark(!dark)} style={{ width: 30, height: 30, borderRadius: 6, background: 'transparent', border: `1px solid ${c.border}`, color: c.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {dark ? '○' : '●'}
            </button>
            <ProfileMenu c={c} />
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Workspace</p>
            <h1 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 600, letterSpacing: -.6 }}>Projects</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', transition: 'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            + New project
          </button>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: 24, marginBottom: 24, background: c.surface }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>New project</h3>
            <input type="text" placeholder="Project name" value={newName} onChange={e => setNewName(e.target.value)}
              style={{ width: '100%', fontSize: 13, padding: '10px 14px', borderRadius: 7, border: `1px solid ${c.border}`, background: c.bg, color: c.text, marginBottom: 10 }}
              onFocus={e => (e.currentTarget.style.borderColor = c.border2)}
              onBlur={e => (e.currentTarget.style.borderColor = c.border)} />
            <textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2}
              style={{ width: '100%', fontSize: 13, padding: '10px 14px', borderRadius: 7, border: `1px solid ${c.border}`, background: c.bg, color: c.text, marginBottom: 14, resize: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = c.border2)}
              onBlur={e => (e.currentTarget.style.borderColor = c.border)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreate} disabled={!newName.trim() || creating}
                style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, border: 'none', padding: '9px 20px', borderRadius: 7, cursor: 'pointer', opacity: !newName.trim() || creating ? .5 : 1 }}>
                {creating ? 'Creating…' : 'Create project'}
              </button>
              <button onClick={() => { setShowForm(false); setNewName(''); setNewDesc('') }}
                style={{ fontSize: 13, color: c.muted, background: 'transparent', border: `1px solid ${c.border}`, padding: '9px 20px', borderRadius: 7, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: c.subtle, fontSize: 13 }}>Loading…</div>
        )}

        {/* EMPTY */}
        {!loading && projects.length === 0 && !showForm && (
          <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>📁</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No projects yet</h2>
            <p style={{ fontSize: 13, color: c.muted, marginBottom: 24 }}>Organize your episodes into projects to keep things tidy.</p>
            <button onClick={() => setShowForm(true)}
              style={{ fontSize: 13, fontWeight: 500, background: c.accent, color: c.accentFg, border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer' }}>
              Create first project →
            </button>
          </div>
        )}

        {/* PROJECTS GRID */}
        {!loading && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {projects.map(p => (
              <a key={p.id} href={`/studio?projectId=${p.id}`}
                className="proj-card"
                style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: '20px 22px', background: 'transparent', display: 'block', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 22 }}>📁</div>
                  <span style={{ fontSize: 11, color: c.subtle }}>{p.episodeCount} episodes</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5, marginBottom: 8 }}>{p.description}</div>}
                <div style={{ fontSize: 11, color: c.subtle, fontFamily: 'monospace' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>SceneForge</span>
        <div style={{ display: 'flex' }}>
          {[['Terms','/terms'],['Privacy','/privacy']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: c.muted, padding: '4px 10px' }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2025 SceneForge</span>
      </footer>
    </div>
  )
}
