'use client'
import { useEffect, useState } from 'react'
import { CODE_MIXED, LANGUAGES } from '@isaii/i18n'
import { Nav } from '@/components/ui/Nav'

type Host = { id: 'A' | 'B'; name: string; voiceId: string; personality: string }
type Show = { id: string; name: string; language: string; hosts: Host[]; rssSlug: string | null; episodeCount: number }
type Ep = { id: string; title: string; topic: string; status: string; showId: string | null }

const LANGS = [...LANGUAGES.filter(l => l.region === 'india'), ...CODE_MIXED, ...LANGUAGES.filter(l => l.region !== 'india')]
const VOICE_A = '21m00Tcm4TlvDq8ikWAM'
const VOICE_B = 'AZnzlk1XvdvUeBnXmlld'

export default function ShowsPage() {
  const [dark, setDark] = useState(true)
  const [shows, setShows] = useState<Show[]>([])
  const [episodes, setEpisodes] = useState<Ep[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', language: 'hi', hostA: '', hostB: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const c = dark
    ? { bg: '#0a0a0a', surface: '#141414', surface2: '#1a1a1a', border: '#222', border2: '#2a2a2a', text: '#f5f5f5', muted: '#888', subtle: '#444', accent: '#f5f5f5', accentFg: '#0a0a0a' }
    : { bg: '#ffffff', surface: '#f0f0f0', surface2: '#efefef', border: '#d0d0d0', border2: '#bbb', text: '#0a0a0a', muted: '#444', subtle: '#666', accent: '#0a0a0a', accentFg: '#ffffff' }

  async function load() {
    const [s, e] = await Promise.all([
      fetch('/api/shows').then(r => (r.ok ? r.json() : [])),
      fetch('/api/jobs?limit=50').then(r => (r.ok ? r.json() : { data: [] })),
    ])
    setShows(Array.isArray(s) ? s : [])
    setEpisodes(Array.isArray(e?.data) ? e.data : [])
    setLoading(false)
  }
  useEffect(() => { load().catch(() => setLoading(false)) }, [])

  async function create() {
    setBusy(true); setError('')
    const hosts: Host[] = [{ id: 'A', name: form.hostA.trim() || 'Host A', voiceId: VOICE_A, personality: '' }]
    if (form.hostB.trim()) hosts.push({ id: 'B', name: form.hostB.trim(), voiceId: VOICE_B, personality: '' })
    const res = await fetch('/api/shows', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.name.trim(), language: form.language, hosts, style: {} }) })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(data.error ?? 'Could not create show')
    setForm({ name: '', language: form.language, hostA: '', hostB: '' })
    await load()
  }

  async function toggle(showId: string, ep: Ep) {
    const attach = ep.showId !== showId
    await fetch(`/api/shows/${showId}/episodes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ episodeId: ep.id, attach }) })
    await load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this show? Episodes are kept.')) return
    await fetch(`/api/shows/${id}`, { method: 'DELETE' })
    await load()
  }

  const feedUrl = (slug: string) => `${location.origin}/shows/${encodeURIComponent(slug)}/feed.xml`
  const copy = async (slug: string) => { await navigator.clipboard.writeText(feedUrl(slug)); setCopied(slug); setTimeout(() => setCopied(''), 1500) }

  const input = { background: c.surface, border: `1px solid ${c.border}`, color: c.text, borderRadius: 8, padding: '9px 12px', fontSize: 13 } as const
  const btn = { background: c.accent, color: c.accentFg, border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' } as const
  const ghost = { background: 'transparent', color: c.muted, border: `1px solid ${c.border}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' } as const
  const canCreate = !busy && form.name.trim().length >= 2

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Nav c={c} dark={dark} setDark={setDark} activePath="/shows/manage" />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '120px 16px 64px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>Shows</h1>
        <p style={{ color: c.muted, fontSize: 14, marginTop: 6 }}>
          Group episodes into a recurring show with saved hosts, and publish it as a podcast RSS feed for Spotify, Apple Podcasts, JioSaavn and Amazon Music.
        </p>

        <section style={{ marginTop: 28, padding: 20, borderRadius: 14, border: `1px solid ${c.border}`, background: c.surface2 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>New show</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <input aria-label="Show name" placeholder="Show name, e.g. Chai & Code" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={input} />
            <select aria-label="Language" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} style={input}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.native === l.name ? l.name : `${l.native} · ${l.name}`}</option>)}
            </select>
            <input aria-label="Host A name" placeholder="Host A name" value={form.hostA} onChange={e => setForm({ ...form, hostA: e.target.value })} style={input} />
            <input aria-label="Host B name" placeholder="Host B name (optional)" value={form.hostB} onChange={e => setForm({ ...form, hostB: e.target.value })} style={input} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button onClick={create} disabled={!canCreate} style={{ ...btn, opacity: canCreate ? 1 : 0.5 }}>{busy ? 'Creating…' : 'Create show'}</button>
            {error && <span role="alert" style={{ color: '#ef4444', fontSize: 12 }}>{error}</span>}
          </div>
        </section>

        <section style={{ marginTop: 28, display: 'grid', gap: 12 }}>
          {loading && <p style={{ color: c.muted, fontSize: 13 }}>Loading…</p>}
          {!loading && shows.length === 0 && <p style={{ color: c.muted, fontSize: 13 }}>No shows yet. Create one above, then add finished episodes to it.</p>}
          {shows.map(s => (
            <article key={s.id} style={{ borderRadius: 14, border: `1px solid ${c.border}`, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</h3>
                  <p style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>
                    {LANGS.find(l => l.code === s.language)?.name ?? s.language} · {s.hosts.map(h => h.name).join(' & ')} · {s.episodeCount} episode{s.episodeCount === 1 ? '' : 's'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {s.rssSlug && <button onClick={() => copy(s.rssSlug!)} style={ghost}>{copied === s.rssSlug ? 'Copied ✓' : 'Copy RSS feed'}</button>}
                  <button onClick={() => setOpen(open === s.id ? null : s.id)} style={ghost} aria-expanded={open === s.id}>Episodes</button>
                  <button onClick={() => remove(s.id)} style={{ ...ghost, color: '#ef4444' }}>Delete</button>
                </div>
              </div>
              {open === s.id && (
                <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
                  {episodes.length === 0 && <p style={{ fontSize: 12, color: c.muted }}>No episodes yet.</p>}
                  {episodes.map(ep => (
                    <label key={ep.id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, padding: '6px 8px', borderRadius: 8, background: ep.showId === s.id ? c.surface2 : 'transparent', opacity: ep.showId && ep.showId !== s.id ? 0.5 : 1 }}>
                      <input type="checkbox" checked={ep.showId === s.id} onChange={() => toggle(s.id, ep)} />
                      <span style={{ flex: 1 }}>{ep.title || ep.topic}</span>
                      <span style={{ fontSize: 11, color: c.muted }}>{ep.status === 'complete' ? 'listed in feed' : `${ep.status} — joins feed when complete`}</span>
                    </label>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
