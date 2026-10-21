'use client'
import { useState } from 'react'
import { CODE_MIXED, LANGUAGES } from '@isaii/i18n'
import type { Theme } from '@isaii/ui'

type Line = { speaker: 'A' | 'B'; text: string }
type Result = { title: string; lines: Line[]; remaining: number }

const OPTIONS = [...LANGUAGES.filter(l => l.region === 'india'), ...CODE_MIXED, ...LANGUAGES.filter(l => l.region !== 'india')]

/** No-login 60-second teaser: one click, no account, a two-host script in the visitor's language. */
export function PreviewTry({ c, dark, topic }: { c: Theme; dark: boolean; topic: string }) {
  const [language, setLanguage] = useState('hi')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const ready = topic.trim().length >= 3

  async function run() {
    setState('loading'); setError('')
    try {
      const res = await fetch('/api/preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic: topic.trim(), language }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Preview failed')
      setResult(data); setState('done')
    } catch (e) {
      setError((e as Error).message); setState('error')
    }
  }

  const pill = { fontSize: 12, borderRadius: 20, padding: '6px 14px', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, background: 'transparent', color: c.text } as const

  return (
    <div style={{ marginTop: 16, textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <select aria-label="Preview language" value={language} onChange={e => setLanguage(e.target.value)} style={{ ...pill, cursor: 'pointer', background: dark ? '#111' : '#fff' }}>
          {OPTIONS.map(l => <option key={l.code} value={l.code}>{l.native === l.name ? l.name : `${l.native} · ${l.name}`}</option>)}
        </select>
        <button onClick={run} disabled={!ready || state === 'loading'}
          title={ready ? undefined : 'Type a topic first'}
          style={{ ...pill, fontWeight: 600, cursor: ready ? 'pointer' : 'not-allowed', opacity: ready ? 1 : 0.5, borderColor: 'rgba(249,115,22,0.5)', color: '#f97316' }}>
          {state === 'loading' ? 'Writing your preview…' : 'Free 60-second preview — no sign-up'}
        </button>
      </div>
      {state === 'error' && <p role="alert" style={{ marginTop: 10, fontSize: 12, color: '#ef4444' }}>{error}</p>}
      {state === 'done' && result && (
        <div style={{ marginTop: 14, maxWidth: 620, marginInline: 'auto', textAlign: 'left', borderRadius: 14, padding: 16, border: `1px solid ${c.border}`, background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>{result.title}</p>
          <div lang={language} style={{ display: 'grid', gap: 8 }}>
            {result.lines.map((l, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.6, color: c.muted, animation: `fadeUp .4s ease ${i * 0.12}s both` }}>
                <strong style={{ color: l.speaker === 'A' ? '#f97316' : '#a78bfa' }}>{l.speaker === 'A' ? 'Host A' : 'Host B'}: </strong>{l.text}
              </p>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: c.muted }}>
            Like it? Sign up to hear it voiced, get 5 script angles, thumbnails and SEO — 10 free episodes. ({result.remaining} previews left today)
          </p>
        </div>
      )}
    </div>
  )
}
