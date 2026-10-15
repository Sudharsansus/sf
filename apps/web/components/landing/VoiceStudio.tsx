'use client'
import { useEffect, useRef, useState } from 'react'
import { Section, glass, ORANGE, type LandingProps } from './Section'
import { useInView, useReducedMotion } from './useReveal'
import { Waveform } from './Waveform'
import { CONVO } from './audioScript'

const PURPLE = '#8b5cf6'
const VOICE_NAMES = ['Rachel', 'Adam', 'Bella', 'Antoni', 'Charlotte', 'Daniel', 'Elli', 'Josh', 'Alice', 'Brian', 'Callum', 'Domi']
const clip = (i: number) => `/landing/audio/convo-${i}.mp3`

export function VoiceStudio({ c, dark }: LandingProps) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  const reduced = useReducedMotion()
  const [n, setN] = useState(1)                               // lines visible
  const [playing, setPlaying] = useState<number | null>(null) // line being spoken
  const [hasAudio, setHasAudio] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)

  // Only offer playback when the generated clips are actually deployed.
  useEffect(() => {
    fetch(clip(0), { method: 'HEAD' }).then(r => setHasAudio(r.ok)).catch(() => {})
    return () => { audio.current?.pause() }
  }, [])

  // Silent text animation while nothing is playing.
  useEffect(() => {
    if (playing !== null) return
    if (reduced) { setN(CONVO.length); return }
    if (!inView) return
    const t = setTimeout(() => setN(v => (v >= CONVO.length ? 1 : v + 1)), n >= CONVO.length ? 3500 : 2000)
    return () => clearTimeout(t)
  }, [n, inView, reduced, playing])

  // Stop when scrolled away.
  useEffect(() => { if (!inView && playing !== null) stop() }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps

  function playFrom(i: number) {
    if (i >= CONVO.length) { setPlaying(null); setN(CONVO.length); return }
    audio.current ??= new Audio()
    const a = audio.current
    a.src = clip(i)
    a.onended = () => playFrom(i + 1)
    a.onerror = () => setPlaying(null)
    setN(i + 1)
    setPlaying(i)
    a.play().catch(() => setPlaying(null))
  }
  function stop() { audio.current?.pause(); setPlaying(null) }

  const live = playing !== null
  const speaking = live ? CONVO[playing].speaker : CONVO[n - 1].speaker

  return (
    <Section c={c} dark={dark} eyebrow="Voices"
      title={<>Two hosts. <span style={{ color: ORANGE }}>One real conversation.</span></>}
      subtitle={hasAudio
        ? 'Press play — this is real ElevenLabs output, exactly what your episodes sound like. Preview every voice before you generate.'
        : 'ElevenLabs voices with natural pacing, interruptions and emotion. Preview every voice before you generate — choose solo narration or a two-speaker show.'}>
      <div ref={ref} className="l-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 24 }}>
        {/* speakers */}
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {([['A', 'Rachel', 'Warm · American', ORANGE], ['B', 'Adam', 'Deep · American', PURPLE]] as const).map(([k, name, desc, col]) => {
            const on = speaking === k && (live || !hasAudio)
            return (
              <div key={k} style={{ ...glass(dark, false), boxShadow: 'none', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 14,
                ...(on ? { borderColor: col } : {}), transition: 'border-color .3s' }}>
                <span style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                  {on && !reduced && <span style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `2px solid ${col}`, animation: 'pulse 1.4s ease-in-out infinite' }} />}
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${col}, ${dark ? '#111' : '#fff'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{k}</span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 12, color: on && live ? col : c.subtle }}>{on && live ? 'Speaking…' : desc}</div>
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

        {/* transcript + player */}
        <div className="stagger" style={{ ['--d' as string]: 1, ...glass(dark), borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <span style={{ fontSize: 12, color: c.subtle }}>Ep. 7 · The fine print</span>
            {hasAudio ? (
              <button onClick={() => (live ? stop() : playFrom(0))} aria-label={live ? 'Stop conversation' : 'Play conversation'}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 8px', borderRadius: 999, background: live ? 'transparent' : ORANGE,
                  border: `1px solid ${ORANGE}`, color: live ? ORANGE : '#fff', fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: live ? ORANGE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {live
                    ? <svg width="8" height="8" viewBox="0 0 10 10"><rect width="10" height="10" rx="1.5" fill="#fff" /></svg>
                    : <svg width="9" height="9" viewBox="0 0 24 24" fill={ORANGE}><polygon points="6 3 20 12 6 21 6 3" /></svg>}
                </span>
                {live ? 'Stop' : 'Play conversation'}
              </button>
            ) : (
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, color: ORANGE, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: ORANGE, animation: reduced ? undefined : 'pulse 1s infinite' }} /> LIVE PREVIEW
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {CONVO.slice(0, n).map(({ speaker, text }, i) => {
              const col = speaker === 'A' ? ORANGE : PURPLE
              const mine = speaker === 'A'
              const now = playing === i
              return (
                <div key={`${i}-${text}`} className="pop-in" style={{ display: 'flex', justifyContent: mine ? 'flex-start' : 'flex-end' }}>
                  <button disabled={!hasAudio} onClick={() => playFrom(i)} title={hasAudio ? 'Play from this line' : undefined}
                    style={{ maxWidth: '82%', padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.55, textAlign: 'left', cursor: hasAudio ? 'pointer' : 'default',
                      background: mine ? (dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.10)') : (dark ? 'rgba(139,92,246,0.14)' : 'rgba(139,92,246,0.10)'),
                      border: `1px solid ${now ? col : `${col}40`}`, boxShadow: now ? `0 0 24px ${col}55` : 'none',
                      color: dark ? '#e5e5e5' : c.text, transition: 'border-color .2s, box-shadow .2s, opacity .2s', opacity: live && !now ? 0.6 : 1 }}>
                    <b style={{ color: col, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      {mine ? 'Rachel' : 'Adam'}{now && <Waveform bars={6} height={10} color={col} gap={2} />}
                    </b>{text}
                  </button>
                </div>
              )
            })}
          </div>
          <a href="/studio" style={{ marginTop: 16, alignSelf: 'flex-start', fontSize: 13, fontWeight: 600, padding: '10px 16px', borderRadius: 10,
            background: hasAudio ? 'transparent' : ORANGE, border: hasAudio ? `1px solid ${c.border2}` : 'none', color: hasAudio ? c.text : '#fff' }}>
            Preview all voices in the studio →
          </a>
        </div>
      </div>
    </Section>
  )
}
