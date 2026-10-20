import { getPrompt } from '@isaii/prompts'
import { ThumbnailDesigns, type ThumbnailDesign } from './schemas'
import { gw, type AgentDeps } from './context'

const HEX = /^#[0-9a-fA-F]{6}$/
const FALLBACK = { background: '#0b0b0f', accent: '#f97316', text: '#ffffff' }

export function sanitiseDesign(v: ThumbnailDesign): ThumbnailDesign {
  return {
    ...v,
    headline: v.headline.trim().slice(0, 60),
    kicker: v.kicker.trim().slice(0, 24),
    background: HEX.test(v.background) ? v.background : FALLBACK.background,
    accent: HEX.test(v.accent) ? v.accent : FALLBACK.accent,
    text: HEX.test(v.text) ? v.text : FALLBACK.text,
  }
}

export async function designThumbnails(title: string, topic: string, deps?: AgentDeps) {
  const { variants } = await gw(deps).generateJSON('thumbnail', {
    system: getPrompt('thumbnail', deps?.env).text,
    user: `Title: ${title}\nTopic: ${topic}`,
    schema: ThumbnailDesigns,
    ctx: deps?.ctx,
  })
  return variants.slice(0, 3).map(sanitiseDesign)
}
