'use client'
import { useEffect, useState } from 'react'
import { Section, glass, ORANGE, type LandingProps } from './Section'
import { useInView, useReducedMotion } from './useReveal'
import { Waveform } from './Waveform'

const PURPLE = '#8b5cf6'

const CONVO: [('A' | 'B'), string][] = [
  ['A', 'Okay, honest question. Do you actually read the terms and conditions?'],
  ['B', 'Nobody does. That’s kind of the whole business model.'],
  ['A', 'Right — the average one takes 76 minutes to read.'],
  ['B', 'Seventy-six minutes? I’ve watched shorter movies.'],
  ['A', 'So today: what you actually agree to when you click “accept”.'],
]

const VOICE_NAMES = ['Rachel', 'Adam', 'Bella', 'Antoni', 'Charlotte', 'Daniel', 'Elli', 'Josh', 'Alice', 'Brian', 'Callum', 'Domi']

export function VoiceStudio({ c, dark }: LandingProps) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  const reduced = useReducedMotion()
  const [n, setN] = useState(1)

  useEffect(() => {
    if (reduced) { setN(CONVO.length); return }
    if (!inView) return
    const t = setTimeout(() => setN(v => (v >= CONVO.length ? 1 : v + 1)), n >= CONVO.length ? 3500 : 2000)
    return () => clearTimeout(t)
  }, [n, inView, reduced])

  const speaking = CONVO[n - 1][0]

  return (
    <Section c={c} dark={dark} eyebrow="Voices"
      title={<>Two hosts. <span style={{ color: ORANGE }}>One real conversation.</span></>}
      subtitle="ElevenLabs voices with natural pacing, interruptions and emotion. Preview every voice before you generate — choose solo narration or a two-speaker show.">
      <div ref={ref} className="l-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 24 }}>
        {/* speakers */}
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {([['A', 'Rachel', 'Warm · American', ORANGE], ['B', 'Adam', 'Deep · American', PURPLE]] as const).map(([k, name, desc, col]) => {
            const on = speaking === k
            return (
              <div key={k} style={{ ...glass(dark, false), boxShadow: 'none', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 14,
                ...(on ? { borderColor: col } : {}), transition: 'border-color .3s' }}>
                <span style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                  {on && !reduced && <span style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `2px solid ${col}`, animation: 'pulse 1.4s ease-in-out infinite' }} />}
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${col}, ${dark ? '#111' : '#fff'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{k}</span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 12, color: c.subtle }}>{desc}</div>
                </div>
                <Waveform bars={14} height={26} color={col} active={on} />
              </div>
            )
          })}
          <div style={{ ...glass(dark, false), boxShadow: 'none', borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: c.subtle, marginBottom: 10 }}>16 studio voices</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {VOICE_NAMES.map(v => (
                <span key={v} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 999, border: `1px solid ${c.border2}`, color: dark ? '#cfcfcf' : c.muted }}>{v}</span>
              ))}
              <span style={{ fontSize: 12, padding: '5px 10px', color: c.subtle }}>+4 more</span>
            </div>
          </div>
        </div>

        {/* transcript */}
        <div className="stagger" style={{ ['--d' as string]: 1, ...glass(dark), borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: c.subtle }}>Ep. 7 · The fine print</span>
            <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, color: ORANGE, fontWeight: 600 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: ORANGE, animation: reduced ? undefined : 'pulse 1s infinite' }} /> LIVE PREVIEW
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {CONVO.slice(0, n).map(([who, line], i) => {
              const col = who === 'A' ? ORANGE : PURPLE
              const mine = who === 'A'
              return (
                <div key={`${i}-${line}`} className="pop-in" style={{ display: 'flex', justifyContent: mine ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '82%', padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.55,
                    background: mine ? (dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.10)') : (dark ? 'rgba(139,92,246,0.14)' : 'rgba(139,92,246,0.10)'),
                    border: `1px solid ${col}40`, color: dark ? '#e5e5e5' : c.text }}>
                    <b style={{ color: col, fontSize: 11, display: 'block', marginBottom: 2 }}>{mine ? 'Rachel' : 'Adam'}</b>{line}
                  </div>
                </div>
              )
            })}
          </div>
          <a href="/studio" style={{ marginTop: 16, alignSelf: 'flex-start', fontSize: 13, fontWeight: 600, padding: '10px 16px', borderRadius: 10, background: ORANGE, color: '#fff' }}>
            Preview voices in the studio →
          </a>
        </div>
      </div>
    </Section>
  )
}
