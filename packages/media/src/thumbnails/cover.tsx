import type { ThumbnailDesign } from '@isaii/agents'

function headlineSize(text: string, narrow: boolean) {
  const base = narrow ? 92 : 112
  if (text.length > 30) return Math.round(base * 0.62)
  if (text.length > 20) return Math.round(base * 0.78)
  return base
}

/** 1280×720 cover. Satori sizes boxes as content-box, so the frame is inset with margin, not padding. */
export function Cover({ v }: { v: ThumbnailDesign }) {
  const centered = v.layout === 'centered'
  const split = v.layout === 'split'
  return (
    <div style={{
      width: 1280, height: 720, display: 'flex', fontFamily: 'Inter', color: v.text,
      background: split
        ? `linear-gradient(110deg, ${v.background} 0%, ${v.background} 60%, ${v.accent} 60%, ${v.accent} 100%)`
        : `radial-gradient(circle at 80% 20%, ${v.accent}55 0%, ${v.background} 55%)`,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, margin: 72 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 28, fontWeight: 800, letterSpacing: 3, color: split ? v.background : v.text }}>
          ISAII
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: centered ? 'center' : 'flex-start', textAlign: centered ? 'center' : 'left',
          alignSelf: centered ? 'center' : 'flex-start',
          ...(split ? { width: 680 } : { maxWidth: 1080 }),
          marginBottom: centered ? 120 : 0,
        }}>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 4, color: v.accent, marginBottom: 18 }}>
            {v.kicker.toUpperCase()}
          </div>
          <div style={{ display: 'flex', fontSize: headlineSize(v.headline, split), fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>
            {v.headline}
          </div>
        </div>
      </div>
    </div>
  )
}
