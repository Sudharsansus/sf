'use client'
import { useEffect, useRef, useState } from 'react'
import { Section, ORANGE, type LandingProps } from './Section'
import { useInView, useReducedMotion } from './useReveal'

const WORDS = [
  ['English', 'en'], ['हिन्दी', 'hi'], ['தமிழ்', 'ta'], ['Español', 'es'], ['Français', 'fr'], ['Deutsch', 'de'],
  ['Português', 'pt'], ['日本語', 'ja'], ['한국어', 'ko'], ['العربية', 'ar'], ['Italiano', 'it'], ['中文', 'zh'],
]

// [lat, lon, label] — where each language label floats on the globe
const PINS: [number, number, string][] = [
  [40, -100, 'ENGLISH'], [22, 79, 'HINDI'], [11, 78, 'TAMIL'], [40, -4, 'SPANISH'], [47, 2, 'FRENCH'],
  [36, 138, 'JAPANESE'], [-10, -52, 'PORTUGUESE'], [24, 45, 'ARABIC'], [35, 105, 'CHINESE'],
]

export function LanguageGlobe({ c, dark }: LandingProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [wrap, inView] = useInView<HTMLDivElement>(0.1)
  const reduced = useReducedMotion()
  const [w, setW] = useState(0)

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setW(i => (i + 1) % WORDS.length), 1800)
    return () => clearInterval(t)
  }, [reduced])

  useEffect(() => {
    const cv = canvas.current
    if (!cv || !inView) return
    const ctx = cv.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = cv.clientWidth
    cv.width = size * dpr; cv.height = size * dpr
    ctx.scale(dpr, dpr)
    const R = size * 0.46, cx = size / 2, cy = size / 2

    // evenly spaced dots on a sphere (fibonacci lattice)
    const N = 900, dots: [number, number][] = []
    for (let i = 0; i < N; i++) {
      const y = 1 - (2 * i + 1) / N
      dots.push([Math.asin(y) * 180 / Math.PI, ((i * 137.508) % 360) - 180])
    }

    const dotCol = dark ? 'rgba(255,255,255,' : 'rgba(10,10,10,'
    let rot = 60, raf = 0
    const project = (lat: number, lon: number) => {
      const la = lat * Math.PI / 180, lo = (lon + rot) * Math.PI / 180, tilt = -0.35
      const x = Math.cos(la) * Math.sin(lo)
      const y0 = Math.sin(la), z0 = Math.cos(la) * Math.cos(lo)
      const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt)
      const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt)
      return { x: cx + x * R, y: cy - y * R, z }
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      const g = ctx.createRadialGradient(cx - R * .3, cy - R * .4, R * .1, cx, cy, R)
      g.addColorStop(0, dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)')
      g.addColorStop(1, dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
      ctx.stroke()

      for (const [lat, lon] of dots) {
        const p = project(lat, lon)
        if (p.z <= 0) continue
        ctx.fillStyle = dotCol + (0.25 + p.z * 0.65) + ')'
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.1 + p.z * .6, 0, Math.PI * 2); ctx.fill()
      }

      ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace'
      for (const [lat, lon, label] of PINS) {
        const p = project(lat, lon)
        if (p.z <= 0.15) continue
        ctx.globalAlpha = Math.min(1, (p.z - .15) * 3)
        ctx.fillStyle = ORANGE
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill()
        const tw = ctx.measureText(label).width + 12
        ctx.fillStyle = dark ? 'rgba(20,20,20,0.9)' : 'rgba(255,255,255,0.95)'
        ctx.fillRect(p.x + 6, p.y - 18, tw, 16)
        ctx.strokeStyle = ORANGE; ctx.strokeRect(p.x + 6, p.y - 18, tw, 16)
        ctx.fillStyle = dark ? '#fff' : '#111'
        ctx.fillText(label, p.x + 12, p.y - 6.5)
        ctx.globalAlpha = 1
      }
      if (!reduced) { rot += 0.12; raf = requestAnimationFrame(draw) }
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [inView, dark, reduced])

  return (
    <Section c={c} dark={dark} eyebrow="Languages"
      title={<>Create in{' '}
        <span className="word-swap" style={{ color: ORANGE }}>
          {WORDS.map(([name], i) => <span key={name} aria-hidden={i !== w} className={i === w ? 'on' : i === (w - 1 + WORDS.length) % WORDS.length ? 'past' : ''}>{name}</span>)}
        </span></>}
      subtitle="Research, scripts and voices in 12 languages — including Hindi and Tamil. Same story, same energy, native pronunciation.">
      <div ref={wrap} className="l-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {WORDS.map(([name, code], i) => (
            <div key={code} style={{ padding: '12px 14px', borderRadius: 12, fontSize: 14, fontWeight: 500,
              border: `1px solid ${i === w ? ORANGE : c.border}`, background: i === w ? (dark ? 'rgba(249,115,22,0.10)' : 'rgba(249,115,22,0.08)') : 'transparent',
              transition: 'border-color .3s, background .3s' }}>
              {name}
              <div style={{ fontSize: 10, color: c.subtle, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{code}</div>
            </div>
          ))}
        </div>
        <div className="stagger" style={{ ['--d' as string]: 1, display: 'flex', justifyContent: 'center' }}>
          <canvas ref={canvas} aria-label="Rotating globe showing supported languages" style={{ width: '100%', maxWidth: 440, aspectRatio: '1' }} />
        </div>
      </div>
    </Section>
  )
}
