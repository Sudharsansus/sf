import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { ThumbnailDesign } from '@isaii/agents'
import { Cover } from './cover'

type Font = { name: string; data: Buffer; weight: 700 | 800; style: 'normal' }
let fonts: Promise<Font[]> | null = null

// Inter (OFL) ships inside this package. Indic-script covers need a shaping engine
// (HarfBuzz) and will render in worker-media; satori only handles Latin reliably.
function loadFonts() {
  fonts ??= Promise.all([
    readFile(fileURLToPath(new URL('../../fonts/inter-latin-700-normal.woff', import.meta.url))).then(data => ({ name: 'Inter', data, weight: 700 as const, style: 'normal' as const })),
    readFile(fileURLToPath(new URL('../../fonts/inter-latin-800-normal.woff', import.meta.url))).then(data => ({ name: 'Inter', data, weight: 800 as const, style: 'normal' as const })),
  ])
  return fonts
}

export async function renderThumbnail(v: ThumbnailDesign): Promise<Uint8Array> {
  const svg = await satori(<Cover v={v} />, { width: 1280, height: 720, fonts: await loadFonts() })
  return new Resvg(svg).render().asPng()
}
