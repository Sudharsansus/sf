'use client'
import type { ReactNode, CSSProperties } from 'react'
import { useReveal } from './useReveal'

export type Theme = {
  bg: string; surface: string; surface2: string; border: string; border2: string
  text: string; muted: string; subtle: string; accent: string; accentFg: string
}
export type LandingProps = { c: Theme; dark: boolean }

export const ORANGE = '#f97316'

/** Glass surface matching the hero console. Pass blur=false for small/repeated cards — backdrop blur is costly on phones. */
export function glass(dark: boolean, blur = true): CSSProperties {
  return {
    borderWidth: 1, borderStyle: 'solid', borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
    background: dark ? (blur ? 'rgba(255,255,255,0.04)' : 'rgba(20,20,20,0.72)') : (blur ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.85)'),
    ...(blur ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}),
    boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.08)',
  }
}

export function Section({ c, dark, id, eyebrow, title, subtitle, children, center }: LandingProps & {
  id?: string; eyebrow: string; title: ReactNode; subtitle?: ReactNode; children: ReactNode; center?: boolean
}) {
  const ref = useReveal<HTMLElement>()
  return (
    <section id={id} ref={ref} className="reveal" style={{ maxWidth: 1080, margin: '0 auto', padding: '96px 24px 0', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: 36, textAlign: center ? 'center' : 'left', maxWidth: center ? 680 : undefined, marginInline: center ? 'auto' : undefined }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>{eyebrow}</p>
        <h2 style={{ fontSize: 'clamp(24px,3.4vw,40px)', fontWeight: 600, letterSpacing: -.8, lineHeight: 1.15 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: dark ? '#b0b0b0' : c.muted, lineHeight: 1.7, marginTop: 12, maxWidth: 560, marginInline: center ? 'auto' : undefined }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
