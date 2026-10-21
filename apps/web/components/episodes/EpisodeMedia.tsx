'use client'
import { useState } from 'react'

type Theme = { border: string; muted: string; surface2: string; text: string }
type Ep = { id: string; status: string; audioUrl?: string | null; videoUrl?: string | null; shortUrls?: string[] | null; thumbnailUrls?: string[] | null }

/** YouTube video (16:9) and Shorts/Reels (9:16) for one episode, or a button to render them. */
export function EpisodeMedia({ ep, c }: { ep: Ep; c: Theme }) {
  const [state, setState] = useState<'idle' | 'sending' | 'queued' | 'error'>('idle')
  const [error, setError] = useState('')
  const shorts = Array.isArray(ep.shortUrls) ? ep.shortUrls : []
  const canRender = !!ep.audioUrl && !!ep.thumbnailUrls?.length

  async function render() {
    setState('sending'); setError('')
    const res = await fetch(`/api/episodes/${ep.id}/media`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error ?? 'Could not start the render'); setState('error'); return }
    setState('queued')
  }

  const btn = { fontSize: 12, color: c.text, border: `1px solid ${c.border}`, background: 'transparent', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' } as const

  return (
    <div style={{ padding: '4px 24px 18px 82px', display: 'grid', gap: 12 }}>
      {ep.videoUrl || shorts.length ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {ep.videoUrl && (
            <figure style={{ margin: 0 }}>
              <video controls preload="metadata" src={ep.videoUrl} poster={ep.thumbnailUrls?.[0]} style={{ width: 320, maxWidth: '100%', aspectRatio: '16 / 9', borderRadius: 8, background: '#000' }} />
              <figcaption style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>YouTube video · 16:9 · <a href={ep.videoUrl} download style={{ color: c.muted }}>Download</a></figcaption>
            </figure>
          )}
          {shorts.map((url, i) => (
            <figure key={url} style={{ margin: 0 }}>
              <video controls preload="metadata" src={url} style={{ width: 120, aspectRatio: '9 / 16', borderRadius: 8, background: '#000' }} />
              <figcaption style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>Short {i + 1} · <a href={url} download style={{ color: c.muted }}>Download</a></figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={render} disabled={!canRender || state === 'sending' || state === 'queued'} style={{ ...btn, opacity: canRender ? 1 : 0.5, cursor: canRender ? 'pointer' : 'not-allowed' }}
          title={canRender ? undefined : 'Produce the episode audio and thumbnails first'}>
          {state === 'sending' ? 'Starting…' : ep.videoUrl ? 'Re-render video + Short' : 'Make video + Short'}
        </button>
        {state === 'queued' && <span style={{ fontSize: 12, color: c.muted }}>Rendering — this takes a few minutes. Refresh to see it.</span>}
        {state === 'error' && <span role="alert" style={{ fontSize: 12, color: '#f87171' }}>{error}</span>}
      </div>
    </div>
  )
}
