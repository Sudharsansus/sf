import { logger } from './logger'

const TOKEN = process.env.REPLICATE_API_TOKEN!

export async function generateThumbnail(prompt: string): Promise<string> {
  const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait'
    },
    body: JSON.stringify({
      input: {
        prompt: `Professional podcast cover art: ${prompt}. Dark background, bold typography, modern design, high contrast. No text overlays.`,
        aspect_ratio: '1:1',
        output_format: 'webp',
        output_quality: 90,
        num_outputs: 1
      }
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Replicate error ${res.status}: ${err}`)
  }

  const data = await res.json()

  // Poll if not done immediately
  if (data.status === 'starting' || data.status === 'processing') {
    return await pollReplicate(data.id)
  }

  const url = Array.isArray(data.output) ? data.output[0] : data.output
  if (!url) throw new Error('Replicate returned no image URL')
  return url
}

async function pollReplicate(id: string, maxWait = 60000): Promise<string> {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    const data = await res.json()
    if (data.status === 'succeeded') {
      const url = Array.isArray(data.output) ? data.output[0] : data.output
      return url
    }
    if (data.status === 'failed') throw new Error(`Replicate failed: ${data.error}`)
  }
  throw new Error('Replicate timed out')
}

export async function generateThumbnails(title: string, topic: string): Promise<string[]> {
  logger.info('Generating thumbnails', { title })
  const prompts = [
    `${title} - ${topic}, minimal dark podcast cover`,
    `${topic} podcast cover art, abstract geometric dark background`,
    `${title} episode artwork, professional studio style dark theme`
  ]
  const results = await Promise.allSettled(prompts.map(p => generateThumbnail(p)))
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value)
}
