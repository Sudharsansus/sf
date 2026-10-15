'use client'
import { useEffect, useState } from 'react'
import { Section, glass, ORANGE, type LandingProps } from './Section'
import { useInView, useReducedMotion } from './useReveal'
import { Waveform } from './Waveform'

const TOPIC = 'Why sleep is your superpower'

const STAGES = [
  { key: 'research', label: 'Research',   detail: '14 sources · 6 hooks · 3 counter-arguments' },
  { key: 'scripts',  label: 'Scripts ×5',  detail: 'Technical · Story · Beginner · Contrarian · Investment' },
  { key: 'score',    label: 'Scored',     detail: 'Story angle wins — 9.2 / 10 on hook + clarity' },
  { key: 'voice',    label: 'Voices',     detail: 'Rachel × Adam · two-speaker conversation' },
  { key: 'thumbs',   label: 'Thumbnails', detail: '3 cover variations · 16:9 + 1:1' },
  { key: 'seo',      label: 'SEO pack',   detail: 'Title, description, chapters, tags, socials' },
]

export function PipelineDemo({ c, dark }: LandingProps) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  const reduced = useReducedMotion()
  const [typed, setTyped] = useState(0)
  const [stage, setStage] = useState(-1) // -1 = typing, 0..5 running, 6 = done

  useEffect(() => {
    if (reduced) { setTyped(TOPIC.length); setStage(STAGES.length); return }
    if (!inView) return
    let t: ReturnType<typeof setTimeout>
    if (stage === -1) {
      t = typed < TOPIC.length
        ? setTimeout(() => setTyped(n => n + 1), 45)
        : setTimeout(() => setStage(0), 500)
    } else if (stage < STAGES.length) {
      t = setTimeout(() => setStage(s => s + 1), 1300)
    } else {
      t = setTimeout(() => { setTyped(0); setStage(-1) }, 4200)
    }
    return () => clearTimeout(t)
  }, [inView, reduced, typed, stage])

  const done = stage >= STAGES.length
  const line = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <Section c={c} dark={dark} eyebrow="Live pipeline" center
      title={<>One topic in. <span style={{ color: ORANGE }}>A finished episode</span> out.</>}
      subtitle="Watch ISAII research, write, score, voice, design and package an episode — the same pipeline that runs when you hit generate.">
      <div ref={ref} className="stagger" style={{ ...glass(dark), borderRadius: 18, overflow: 'hidden', maxWidth: 920, margin: '0 auto' }}>
        {/* window chrome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${line}` }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(col => <span key={col} style={{ width: 10, height: 10, borderRadius: '50%', background: col, opacity: .85 }} />)}
          <span style={{ marginLeft: 10, fontSize: 12, color: c.subtle }}>isaii.si / studio</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: done ? '#22c55e' : ORANGE, fontWeight: 600 }}>
            {stage === -1 ? 'Waiting for topic' : done ? 'Ready for review' : 'Producing…'}
          </span>
        </div>

        <div className="l-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
          {/* left: prompt + stages */}
          <div style={{ padding: 22, borderRight: `1px solid ${line}` }}>
            <div style={{ border: `1px solid ${stage === -1 ? 'rgba(249,115,22,0.6)' : line}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, marginBottom: 18, minHeight: 46, transition: 'border-color .3s' }}>
              {TOPIC.slice(0, typed)}{stage === -1 && <span className="caret" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STAGES.map((s, i) => {
                const state = stage > i ? 'done' : stage === i ? 'run' : 'wait'
                return (
                  <div key={s.key} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 10, alignItems: 'start', opacity: state === 'wait' ? .4 : 1, transition: 'opacity .3s' }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: state === 'done' ? ORANGE : 'transparent',
                      border: `1.5px solid ${state === 'wait' ? c.border2 : ORANGE}`,
                    }}>
                      {state === 'done' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      {state === 'run' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, animation: 'pulse 1s ease-in-out infinite' }} />}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                      {state !== 'wait' && <div className="pop-in" style={{ fontSize: 12, color: dark ? '#a8a8a8' : c.muted, marginTop: 2 }}>{s.detail}</div>}
                      {state === 'run' && (
                        <div className="shimmer" style={{ height: 3, borderRadius: 2, marginTop: 6, background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)` }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* right: outputs */}
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Output show={stage > 2} label="Selected script" c={c}>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: dark ? '#cfcfcf' : c.muted }}>
                <b style={{ color: ORANGE }}>A:</b> You lose 40% of your memory capacity after one bad night.<br />
                <b style={{ color: '#8b5cf6' }}>B:</b> Wait — forty percent? From <i>one</i> night?
              </div>
            </Output>
            <Output show={stage > 3} label="Episode audio · 05:12" c={c}>
              <Waveform bars={38} height={30} color={ORANGE} active={stage > 3} />
            </Output>
            <Output show={stage > 4} label="Thumbnails" c={c}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {['#8b5cf6,#3b82f6', '#f97316,#ec4899', '#22c55e,#0ea5e9'].map((g, i) => (
                  <div key={g} className="pop-in" style={{ animationDelay: `${i * 120}ms`, aspectRatio: '16/9', borderRadius: 8, background: `linear-gradient(135deg, ${g})`, display: 'flex', alignItems: 'flex-end', padding: 6 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>SLEEP IS YOUR SUPERPOWER</span>
                  </div>
                ))}
              </div>
            </Output>
            <Output show={stage > 5} label="SEO package" c={c}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['#sleepscience', '#productivity', '#podcast', 'Chapters ×6', 'YouTube title', 'LinkedIn post'].map(t => (
                  <span key={t} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, border: `1px solid ${c.border2}`, color: dark ? '#cfcfcf' : c.muted }}>{t}</span>
                ))}
              </div>
            </Output>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Output({ show, label, children, c }: { show: boolean; label: string; children: React.ReactNode; c: LandingProps['c'] }) {
  return (
    <div style={{ border: `1px dashed ${c.border2}`, borderRadius: 12, padding: 12, minHeight: 64, opacity: show ? 1 : .35, transition: 'opacity .4s' }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: c.subtle, marginBottom: 8 }}>{label}</div>
      {show ? <div className="pop-in">{children}</div> : <div style={{ height: 22, borderRadius: 6, background: c.surface2 }} />}
    </div>
  )
}
