'use client'
import { useEffect, useState } from 'react'
import { Section, glass, ORANGE, type LandingProps } from './Section'
import { useInView, useReducedMotion } from './useReveal'

const SCRIPTS = [
  { angle: 'Technical',  hook: 'The 4 stages of sleep, measured in brainwaves.',          score: 7.8 },
  { angle: 'Story',      hook: 'The night a pilot stayed awake for 37 hours.',            score: 9.2 },
  { angle: 'Beginner',   hook: 'Sleep, explained like you’re twelve.',                    score: 8.1 },
  { angle: 'Contrarian', hook: 'Why 8 hours might be wrong for you.',                     score: 8.6 },
  { angle: 'Investment', hook: 'The $400B industry selling you better nights.',           score: 7.4 },
]
const BEST = SCRIPTS.reduce((b, s, i) => (s.score > SCRIPTS[b]!.score ? i : b), 0)
const METRICS = ['Hook', 'Clarity', 'Pacing', 'Depth', 'Originality']

export function ScriptShowdown({ c, dark }: LandingProps) {
  const [ref, inView] = useInView<HTMLDivElement>(0.35)
  const reduced = useReducedMotion()
  const [p, setP] = useState(0) // 0..1 count-up progress
  const [picked, setPicked] = useState<number | null>(null)

  useEffect(() => {
    if (!inView) return
    if (reduced) { setP(1); return }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1800)
      setP(1 - Math.pow(1 - k, 3))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced])

  const winner = picked ?? (p >= 1 ? BEST : null)

  return (
    <Section c={c} dark={dark} eyebrow="Five angles, one winner"
      title={<>Not one draft. <span style={{ color: ORANGE }}>Five</span>, scored.</>}
      subtitle="Every topic gets five scripts from different angles, each scored on 10 quality metrics like hook, clarity and pacing. AI ranks them — you make the call. Click any card to pick it.">
      <div ref={ref} className="l-grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {SCRIPTS.map((s, i) => {
          const win = winner === i
          return (
            <button key={s.angle} onClick={() => setPicked(i)} className={`stagger lift ${win ? 'glow-pulse' : ''}`}
              style={{ ['--d' as string]: i, ...glass(dark, false), boxShadow: win ? undefined : 'none', textAlign: 'left', color: c.text,
                borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
                transform: win ? 'translateY(-8px)' : undefined, ...(win ? { borderColor: ORANGE } : {}) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: .8, textTransform: 'uppercase', color: win ? ORANGE : c.subtle }}>{s.angle}</span>
                {win && <span className="pop-in" style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: ORANGE, color: '#fff' }}>{picked === null ? 'TOP PICK' : 'YOUR PICK'}</span>}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, minHeight: 58, color: dark ? '#d4d4d4' : c.text }}>“{s.hook}”</div>
              <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>
                {(s.score * p).toFixed(1)}<span style={{ fontSize: 13, color: c.subtle, fontWeight: 500 }}> /10</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {METRICS.map((m, j) => {
                  const v = Math.max(.35, Math.min(1, s.score / 10 + Math.sin(i * 3 + j) * .08))
                  return (
                    <div key={m} style={{ display: 'grid', gridTemplateColumns: '58px 1fr', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: c.subtle }}>{m}</span>
                      <span style={{ height: 4, borderRadius: 2, background: c.surface2, overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: `${v * p * 100}%`, background: win ? ORANGE : (dark ? '#d4d4d4' : '#444') }} />
                      </span>
                    </div>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>
    </Section>
  )
}
