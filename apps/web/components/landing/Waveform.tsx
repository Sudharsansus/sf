'use client'

/** Pseudo-random but stable bar heights so SSR and client match. */
const HEIGHTS = Array.from({ length: 64 }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)))

export function Waveform({ bars = 32, height = 28, color, active = true, gap = 3 }: {
  bars?: number; height?: number; color: string; active?: boolean; gap?: number
}) {
  return (
    <div aria-hidden style={{ display: 'flex', alignItems: 'center', gap, height }}>
      {HEIGHTS.slice(0, bars).map((h, i) => (
        <span key={i} className="wave-bar" style={{
          height: height * h, background: color,
          animationDelay: `${(i % 9) * -0.12}s`,
          animationPlayState: active ? 'running' : 'paused',
          opacity: active ? 1 : 0.35,
        }} />
      ))}
    </div>
  )
}
