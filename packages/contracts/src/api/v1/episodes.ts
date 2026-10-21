import * as z from 'zod'
import { DurationLabel, Id, LanguageCode, ScriptLine } from '../../common'

export const EpisodeStatus = z.enum([
  'processing', 'researching', 'scripting', 'evaluating', 'awaiting_selection',
  'producing', 'complete', 'partial_failure', 'failed',
])

export const Episode = z.object({
  id: Id,
  shareId: z.string(),
  topic: z.string(),
  title: z.string().nullable(),
  status: EpisodeStatus,
  language: LanguageCode.optional(),
  audioUrl: z.url().nullable().optional(),
  thumbnailUrls: z.array(z.url()).nullable().optional(),
  createdAt: z.string(),
})

/** Anonymous homepage preview (no account). */
export const PreviewRequest = z.object({
  topic: z.string().min(3).max(120),
  language: LanguageCode.default('en'),
})

export const GenerateRequest = z.object({
  topic: z.string().min(3).max(200),
  language: LanguageCode.default('en'),
  duration: DurationLabel.default('5min'),
  voiceA: z.string().optional(),
  voiceB: z.string().optional(),
})
export const GenerateResponse = z.object({ episodeId: Id, shareId: z.string(), status: EpisodeStatus })

export const ProduceRequest = z.object({
  episodeId: Id,
  selectedAngle: z.string().min(1),
  durationLabel: z.string().default('5min'),
  selectedSpeaker: z.enum(['a', 'b', 'both']).default('both'),
  voiceA: z.string().optional(),
  voiceB: z.string().optional(),
  useExistingScript: z.boolean().default(false),
  /** Voice the chosen script word for word (skip the AI rewrite to length). */
  keepWords: z.boolean().default(false),
})

export const SaveScriptRequest = z.object({ lines: z.array(ScriptLine).min(1).max(2000) })
