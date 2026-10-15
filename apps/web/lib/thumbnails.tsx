// ── THUMBNAILS ────────────────────────────────────────────────────────────────
// Claude designs three cover variations; satori + resvg render them to 1280×720 PNGs.
// No image model involved — text stays crisp and on-brand.

import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFile } from 'fs/promises'
import { join } from 'path'
import * as z from 'zod/v4'
import { generateJSON, type AICtx } from './ai'

const HEX = /^#[0-9a-fA-F]{6}$/

const DesignSchema = z.object({
  variants: z.array(z.object({
    layout: z.enum(['bold-left', 'centered', 'split']),
    headline: z.string(),
    kicker: z.string(),
    background: z.string(),
    accent: z.string(),
    text: z.string(),
  })),
})
type Variant = z.infer<typeof DesignSchema>['variants'][number]

const THUMBNAIL_PROMPT = `You design YouTube and podcast thumbnails for ISAII.
Given an episode title and topic, return exactly 3 distinct variants.

Each variant:
- layout: one of bold-left, centered, split — use each layout once
- headline: 2 to 6 punchy words, readable at small sizes, no emojis
- kicker: a short label above the headline (e.g. "EP. 12", "DEEP DIVE", "STORY"), max 3 words
- background, accent, text: hex colors like #0b0b0f. Text must contrast strongly with background.
  Make the three variants feel clearly different from each other.`

export async function designThumbnails(title: string, topic: string, ctx?: AICtx): Promise<Variant[]> {
  const { variants } = await generateJSON({
    task: 'thumbnail', system: THUMBNAIL_PROMPT, schema: DesignSchema, ctx,
    user: `Title: ${title}\nTopic: ${topic}`,
    maxTokens: 4000,
  })
  return variants.slice(0, 3).map(v => ({
    ...v,
    background: HEX.test(v.background) ? v.background : '#0b0b0f',
    accent: HEX.test(v.accent) ? v.accent : '#f97316',
    text: HEX.test(v.text) ? v.text : '#ffffff',
  }))
}

function headlineSize(text: string, narrow: boolean) {
  const base = narrow ? 92 : 112
  if (text.length > 30) return Math.round(base * 0.62)
  if (text.length > 20) return Math.round(base * 0.78)
  return base
}

function Cover({ v }: { v: Variant }) {
  const centered = v.layout === 'centered'
  const split = v.layout === 'split'
  return (
    <div style={{
      width: 1280, height: 720, display: 'flex', fontFamily: 'Inter', color: v.text,
      background: split
        ? `linear-gradient(110deg, ${v.background} 0%, ${v.background} 60%, ${v.accent} 60%, ${v.accent} 100%)`
        : `radial-gradient(circle at 80% 20%, ${v.accent}55 0%, ${v.background} 55%)`,
    }}>
    {/* satori sizes boxes as content-box, so inset with margin instead of padding */}
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, margin: 72 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 28, fontWeight: 800, letterSpacing: 3, color: split ? v.background : v.text }}>
        ISAII
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: centered ? 'center' : 'flex-start', textAlign: centered ? 'center' : 'left',
        alignSelf: centered ? 'center' : 'flex-start',
        ...(split ? { width: 680 } : { maxWidth: 1080 }), // fixed width so satori wraps before measuring
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

// Inter ships with the app (lib/fonts, OFL licence).
let fonts: Promise<{ name: string; data: Buffer; weight: 700 | 800; style: 'normal' }[]> | null = null
function loadFonts() {
  fonts ??= Promise.all(([700, 800] as const).map(async weight => ({
    name: 'Inter', weight, style: 'normal' as const,
    data: await readFile(join(process.cwd(), 'lib/fonts', `inter-latin-${weight}-normal.woff`)),
  })))
  return fonts
}

export async function renderThumbnail(v: Variant): Promise<Buffer> {
  const svg = await satori(<Cover v={v} />, { width: 1280, height: 720, fonts: await loadFonts() })
  return Buffer.from(new Resvg(svg).render().asPng())
}
