'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Nav } from '@/components/ui/Nav'

interface User { id: string; email: string; plan: string; credits: number; role: string; createdAt: string }
interface WaitlistEntry { id: string; email: string; name?: string; createdAt: string }
interface Episode { id: string; title: string; email: string; status: string; createdAt: string }

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'episodes' | 'waitlist' | 'stats'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin')
      if (!res.ok) { router.push('/studio'); return }
      setIsAdmin(true)
      const [usersRes, episodesRes, waitlistRes] = await Promise.all([
        fetch('/api/admin?view=users'),
        fetch('/api/admin?view=episodes'),
        fetch('/api/admin?view=waitlist')
      ])
      if (usersRes.ok) setUsers(await usersRes.json())
      if (episodesRes.ok) setEpisodes(await episodesRes.json())
      if (waitlistRes.ok) setWaitlist(await waitlistRes.json())
    } catch { router.push('/studio') }
    finally { setLoading(false) }
  }

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

  const thTd = { padding: '11px 16px', textAlign: 'left' as const, fontSize: 12 }

  if (loading) return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", color: c.subtle, fontSize: 13 }}>
      Loading…
    </div>
  )
  if (!isAdmin) return null

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif", transition: 'background .3s, color .3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; border: none; outline: none; }
        .nav-link { font-size: 13px; color: ${dark ? c.muted : c.text}; padding: 6px 12px; border-radius: 6px; transition: color .15s, background .15s; }
        .nav-link:hover { color: ${c.text}; background: ${dark ? 'transparent' : c.surface}; }
        .trow { transition: background .15s; }
        .trow:hover { background: ${c.surface} !important; }
      `}</style>

      {/* NAV */}
      <Nav c={c} dark={dark} setDark={setDark} activePath="/admin" />

      {/* CONTENT */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Internal</p>
          <h1 style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, letterSpacing: -.6 }}>Admin Panel</h1>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: `1px solid ${c.border}`, paddingBottom: 0 }}>
          {(['users', 'episodes', 'waitlist', 'stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 16px', borderRadius: '6px 6px 0 0', border: 'none', background: tab === t ? c.surface : 'transparent', color: tab === t ? c.text : c.muted, fontSize: 13, fontWeight: 500, textTransform: 'capitalize', borderBottom: tab === t ? `2px solid ${c.text}` : '2px solid transparent', transition: 'all .15s', cursor: 'pointer' }}>
              {t}
            </button>
          ))}
        </div>

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <p style={{ fontSize: 12, color: c.muted, marginBottom: 16 }}>Total users: {users.length}</p>
            <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}`, background: c.surface }}>
                    {['Email', 'Plan', 'Credits', 'Role', 'Created'].map(h => (
                      <th key={h} style={{ ...thTd, color: c.muted, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="trow" style={{ borderBottom: `1px solid ${c.border}`, background: c.bg }}>
                      <td style={{ ...thTd, color: c.text }}>{u.email}</td>
                      <td style={{ ...thTd, color: c.muted }}>{u.plan}</td>
                      <td style={{ ...thTd, color: c.muted, fontFamily: 'monospace' }}>{u.credits}</td>
                      <td style={thTd}>
                        <span style={{ background: u.role === 'admin' ? '#4ade80' : c.surface2, color: u.role === 'admin' ? '#000' : c.muted, padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ ...thTd, color: c.subtle, fontFamily: 'monospace', fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EPISODES */}
        {tab === 'episodes' && (
          <div>
            <p style={{ fontSize: 12, color: c.muted, marginBottom: 16 }}>Total episodes: {episodes.length}</p>
            <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}`, background: c.surface }}>
                    {['Title', 'User', 'Status', 'Created'].map(h => (
                      <th key={h} style={{ ...thTd, color: c.muted, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {episodes.map(e => (
                    <tr key={e.id} className="trow" style={{ borderBottom: `1px solid ${c.border}`, background: c.bg }}>
                      <td style={{ ...thTd, color: c.text }}>{e.title}</td>
                      <td style={{ ...thTd, color: c.muted, fontSize: 12 }}>{e.email}</td>
                      <td style={thTd}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: e.status === 'complete' ? '#4ade80' : e.status === 'failed' ? '#f87171' : c.subtle, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: e.status === 'complete' ? '#4ade80' : e.status === 'failed' ? '#f87171' : c.muted }}>{e.status}</span>
                        </span>
                      </td>
                      <td style={{ ...thTd, color: c.subtle, fontFamily: 'monospace', fontSize: 11 }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WAITLIST */}
        {tab === 'waitlist' && (
          <div>
            <p style={{ fontSize: 12, color: c.muted, marginBottom: 16 }}>Waitlist entries: {waitlist.length}</p>
            <div style={{ border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}`, background: c.surface }}>
                    {['Email', 'Name', 'Joined'].map(h => (
                      <th key={h} style={{ ...thTd, color: c.muted, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map(w => (
                    <tr key={w.id} className="trow" style={{ borderBottom: `1px solid ${c.border}`, background: c.bg }}>
                      <td style={{ ...thTd, color: c.text }}>{w.email}</td>
                      <td style={{ ...thTd, color: c.muted }}>{w.name || '—'}</td>
                      <td style={{ ...thTd, color: c.subtle, fontFamily: 'monospace', fontSize: 11 }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[['Total Users', users.length], ['Total Episodes', episodes.length], ['Waitlist', waitlist.length]].map(([label, val]) => (
              <div key={String(label)} style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: '24px 22px' }}>
                <div style={{ fontSize: 12, color: c.muted, marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.2 }}>{val}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '18px 24px', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 8.5L5 1.5L8.5 8.5" stroke={c.bg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>SUS</span>
        </div>
        <span style={{ fontSize: 11, color: c.muted }}>© 2026 SUS · Admin</span>
      </footer>
    </div>
  )
}
