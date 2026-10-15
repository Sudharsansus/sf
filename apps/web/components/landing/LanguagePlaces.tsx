'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Section, ORANGE, type LandingProps } from './Section'
import { useInView, useReducedMotion } from './useReveal'
import { Waveform } from './Waveform'
import { GREETINGS } from './audioScript'
import PLACES from './places.json'

type Place = { place: string; src: string; author: string; license: string; url: string }
const places = PLACES as Record<string, Place>
const HUES = ['#f97316', '#8b5cf6', '#ec4899', '#0ea5e9', '#22c55e', '#eab308']
const clip = (code: string) => `/landing/audio/greet-${code}.mp3`

export function LanguagePlaces({ c, dark }: LandingProps) {
  const [ref, inView] = useInView<HTMLDivElement>(0.25)
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)      // user picked a language or is hovering
  const [playing, setPlaying] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch(clip('en'), { method: 'HEAD' }).then(r => setHasAudio(r.ok)).catch(() => {})
    return () => { audio.current?.pause() }
  }, [])

  // Tour the languages while visible and idle.
  useEffect(() => {
    if (!inView || hold || playing || reduced) return
    const t = setInterval(() => setI(v => (v + 1) % GREETINGS.length), 5000)
    return () => clearInterval(t)
  }, [inView, hold, playing, reduced])

  useEffect(() => { if (!inView) stop() }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps

  function select(k: number) { stop(); setI(k); setHold(true) }
  function stop() { audio.current?.pause(); setPlaying(false) }
  function play() {
    audio.current ??= new Audio()
    const a = audio.current
    a.src = clip(GREETINGS[i].code)
    a.onended = () => setPlaying(false)
    a.onerror = () => setPlaying(false)
    setPlaying(true)
    a.play().catch(() => setPlaying(false))
  }

  const g = GREETINGS[i]
  const p = places[g.code]
  const hue = HUES[i % HUES.length]

  return (
    <Section c={c} dark={dark} eyebrow="Languages"
      title={<>Create in{' '}
        <span className="word-swap" style={{ color: ORANGE }}>
          {GREETINGS.map((w, k) => <span key={w.code} aria-hidden={k !== i} className={k === i ? 'on' : k === (i - 1 + GREETINGS.length) % GREETINGS.length ? 'past' : ''}>{w.native}</span>)}
        </span></>}
      subtitle="Research, scripts and voices in 12 languages — with hosts that sound local, not translated.">
      <div ref={ref} className="l-split" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'stretch' }}
        onMouseEnter={() => setHold(true)} onMouseLeave={() => !playing && setHold(false)}>

        {/* stage: landmark photo + host card */}
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="l-stage" style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '16 / 10', background: c.surface2, border: `1px solid ${c.border}` }}>
            {GREETINGS.map((w, k) => {
              const pl = places[w.code]
              const on = k === i
              return pl && (
                <Image key={w.code} src={pl.src} alt={pl.place} fill sizes="(max-width: 860px) 100vw, 60vw" priority={k === 0}
                  style={{ objectFit: 'cover', opacity: on ? 1 : 0, transform: on && !reduced ? 'scale(1.08)' : 'scale(1)',
                    transition: `opacity .9s ease, transform ${on ? '6s' : '.9s'} ease-out` }} />
              )
            })}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,.75) 100%)' }} />

            {/* place label */}
            <div key={`pl-${i}`} className="pop-in" style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px 6px 8px', borderRadius: 999, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12, fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
              {p?.place}
            </div>

            {/* host card */}
            <div key={`h-${i}`} className="pop-in" style={{ position: 'absolute', left: 16, right: 16, bottom: 16, display: 'flex', gap: 14, alignItems: 'center',
              padding: 14, borderRadius: 16, background: 'rgba(10,10,10,.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,.14)', color: '#fff' }}>
              <span style={{ position: 'relative', width: 52, height: 52, flexShrink: 0, borderRadius: '50%',
                background: `radial-gradient(circle at 30% 25%, #fff6 0%, ${hue} 45%, #111 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>
                {g.host[0]}
                <span style={{ position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: '50%', background: '#111', border: `2px solid ${hue}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2" /><rect x="2" y="14" width="5" height="7" rx="1.5" /><rect x="17" y="14" width="5" height="7" rx="1.5" /></svg>
                </span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, opacity: .75, marginBottom: 3 }}>{g.host} · your {g.language} host</div>
                <div lang={g.code} dir={g.code === 'ar' ? 'rtl' : 'ltr'} style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45 }}>{g.text}</div>
                {g.code !== 'en' && <div className="l-hide-xs" style={{ fontSize: 11, opacity: .65, marginTop: 3 }}>{g.english}</div>}
              </div>
              {hasAudio && (
                <button onClick={() => (playing ? stop() : play())} aria-label={playing ? 'Stop greeting' : `Play ${g.language} greeting`}
                  style={{ flexShrink: 0, width: 46, height: 46, borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: playing ? `0 0 0 6px ${ORANGE}33` : 'none', transition: 'box-shadow .2s' }}>
                  {playing
                    ? <Waveform bars={4} height={16} color="#fff" gap={2} />
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><polygon points="7 4 20 12 7 20 7 4" /></svg>}
                </button>
              )}
            </div>
          </div>
          {p && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: c.subtle, alignSelf: 'flex-end' }}>
              Photo: {p.author || 'Wikimedia Commons'} · {p.license}
            </a>
          )}
        </div>

        {/* language picker */}
        <div className="stagger" style={{ ['--d' as string]: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignContent: 'start' }}>
          {GREETINGS.map((w, k) => {
            const on = k === i
            return (
              <button key={w.code} onClick={() => select(k)} aria-pressed={on}
                style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 12, fontSize: 14, fontWeight: 500, color: c.text,
                  border: `1px solid ${on ? ORANGE : c.border}`, background: on ? (dark ? 'rgba(249,115,22,0.10)' : 'rgba(249,115,22,0.08)') : 'transparent',
                  transition: 'border-color .3s, background .3s' }}>
                <span lang={w.code}>{w.native}</span>
                <div style={{ fontSize: 10, color: c.subtle, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{w.language}</div>
              </button>
            )
          })}
          <p style={{ gridColumn: '1 / -1', fontSize: 11, color: c.subtle, marginTop: 6, lineHeight: 1.6 }}>
            Hosts shown are illustrative. Every voice is generated by ElevenLabs.
          </p>
        </div>
      </div>
    </Section>
  )
}
