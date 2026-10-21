import * as z from 'zod'

export const GenerateRequested = z.object({
  episodeId: z.string(),
  userId: z.string(),
  topic: z.string().min(1),
  language: z.string().default('en'),
  duration: z.string(),
  credits: z.number().int().positive(),
})

export const ProduceRequested = z.object({
  episodeId: z.string(),
  userId: z.string(),
  selectedAngle: z.string(),
  durationLabel: z.string(),
  selectedSpeaker: z.string(),
  lockKey: z.string(),
  voiceA: z.string().optional(),
  voiceB: z.string().optional(),
  useExistingScript: z.boolean().optional(),
  keepWords: z.boolean().optional(),
})

export const MediaRenderRequested = z.object({
  episodeId: z.string(),
  kind: z.enum(['episode-video', 'shorts', 'audio-mix']),
  options: z.record(z.string(), z.unknown()).default({}),
})

/** Every event the platform emits. Names are the contract between apps and workers. */
export const EVENTS = {
  'episode/generate.requested': GenerateRequested,
  'episode/produce.requested': ProduceRequested,
  'media/render.requested': MediaRenderRequested,
} as const

export type EventName = keyof typeof EVENTS
export type EventData<N extends EventName> = z.infer<(typeof EVENTS)[N]>
