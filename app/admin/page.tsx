'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  plan: string
  credits: number
  role: string
  createdAt: string
}

interface WaitlistEntry {
  id: string
  email: string
  name?: string
  createdAt: string
}

interface Episode {
  id: string
  title: string
  email: string
  status: string
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'episodes' | 'waitlist' | 'stats'>('users')

  const [users, setUsers] = useState<User[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin')
      if (!res.ok) {
        router.push('/studio')
        return
      }
      setIsAdmin(true)
      loadData()
    } catch {
      router.push('/studio')
    } finally {
      setLoading(false)
    }
  }

  async function loadData() {
    try {
      const [usersRes, episodesRes, waitlistRes] = await Promise.all([
        fetch('/api/admin?view=users'),
        fetch('/api/admin?view=episodes'),
        fetch('/api/admin?view=waitlist')
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (episodesRes.ok) setEpisodes(await episodesRes.json())
      if (waitlistRes.ok) setWaitlist(await waitlistRes.json())
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0c0c0c', padding: '20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#f0f0f0' }}>Admin Panel</h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Manage users, episodes, and waitlist</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #222', paddingBottom: 16 }}>
          {['users', 'episodes', 'waitlist', 'stats'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: tab === t ? '#1a1a1a' : 'transparent',
                color: tab === t ? '#f0f0f0' : '#555',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div>
            <div style={{ marginBottom: 16, color: '#888', fontSize: 13 }}>Total users: {users.length}</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Plan</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Credits</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Role</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 16px', color: '#f0f0f0' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{u.plan}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{u.credits}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>
                        <span style={{ background: u.role === 'admin' ? '#4ade80' : '#555', color: '#000', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Episodes Tab */}
        {tab === 'episodes' && (
          <div>
            <div style={{ marginBottom: 16, color: '#888', fontSize: 13 }}>Total episodes: {episodes.length}</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Title</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>User Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {episodes.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 16px', color: '#f0f0f0' }}>{e.title}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{e.email}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>
                        <span style={{ background: e.status === 'complete' ? '#4ade80' : '#666', color: '#000', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Waitlist Tab */}
        {tab === 'waitlist' && (
          <div>
            <div style={{ marginBottom: 16, color: '#888', fontSize: 13 }}>Waitlist entries: {waitlist.length}</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((w) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 16px', color: '#f0f0f0' }}>{w.email}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{w.name || '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ background: '#111', border: '1px solid #222', padding: 20, borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Total Users</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f0f0f0' }}>{users.length}</div>
              </div>
              <div style={{ background: '#111', border: '1px solid #222', padding: 20, borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Total Episodes</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f0f0f0' }}>{episodes.length}</div>
              </div>
              <div style={{ background: '#111', border: '1px solid #222', padding: 20, borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Waitlist</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f0f0f0' }}>{waitlist.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
