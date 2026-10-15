// ── ISAII AGENTS ──────────────────────────────────────────────────────────────
// Every text task runs on Claude through generateJSON(). Voices and transcription
// run on ElevenLabs (see ./elevenlabs).

import * as z from 'zod/v4'
import { generateJSON, type AICtx } from './ai'
import {
  RESEARCH_PROMPT, SCRIPTS_PROMPT, EVALUATE_PROMPT,
  REFINE_PROMPT, SEO_PROMPT
} from './prompts'

// ── SCHEMAS ───────────────────────────────────────────────────────────────────
export const ScriptLineSchema = z.object({
  speaker: z.enum(['A', 'B']),
  text: z.string(),
})
export const SpeakerSchema = z.object({
  id: z.enum(['A', 'B']),
  name: z.string(),
  personality: z.string(),
})
export const SingleScriptSchema = z.object({
  angle: z.string(),
  title: z.string(),
  hook: z.string(),
  duration_estimate_seconds: z.number(),
  speakers: z.array(SpeakerSchema),
  lines: z.array(ScriptLineSchema),
})
export const AllScriptsSchema = z.object({ scripts: z.array(SingleScriptSchema) })

export const ResearchSchema = z.object({
  summary: z.string(),
  key_facts: z.array(z.string()),
  angles: z.array(z.object({ name: z.string(), description: z.string() })),
  controversy: z.string(),
  trending: z.string(),
  target_audience: z.string(),
  hook: z.string(),
})

const METRIC_KEYS = [
  'engagement', 'clarity', 'uniqueness', 'seo_potential', 'viral_potential',
  'pacing', 'reusability', 'monetization', 'authority', 'feasibility',
] as const
export const EvaluationSchema = z.object({
  scores: z.array(z.object({
    angle: z.string(),
    title: z.string(),
    metrics: z.object(Object.fromEntries(METRIC_KEYS.map(k => [k, z.number()])) as Record<typeof METRIC_KEYS[number], z.ZodNumber>),
    total: z.number(),
    verdict: z.string(),
    best_for: z.string(),
  })),
  winner: z.string(),
  runner_up: z.string(),
})

export const RefinedSchema = z.object({
  duration_label: z.string(),
  duration_estimate_seconds: z.number(),
  title: z.string(),
  speakers: z.array(SpeakerSchema),
  lines: z.array(ScriptLineSchema),
})

export const SEOSchema = z.object({
  youtube: z.object({
    title: z.string(),
    title_b: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    chapters: z.array(z.object({ time: z.string(), label: z.string() })),
    pinned_comment: z.string(),
  }),
  instagram: z.object({ caption: z.string(), hashtags: z.array(z.string()) }),
  twitter_thread: z.array(z.string()),
  linkedin: z.string(),
  blog_post: z.string(),
  newsletter: z.string(),
  clip_timestamps: z.array(z.object({
    start_line: z.number(), end_line: z.number(), hook: z.string(), duration_seconds: z.number(),
  })),
})

export type SingleScript = z.infer<typeof SingleScriptSchema>
export type AllScripts = z.infer<typeof AllScriptsSchema>
export type Research = z.infer<typeof ResearchSchema>
export type Evaluation = z.infer<typeof EvaluationSchema>
export type Refined = z.infer<typeof RefinedSchema>

const LANGUAGES_MAP: Record<string, string> = {
  hi: 'Hindi', ta: 'Tamil', es: 'Spanish', fr: 'French',
  de: 'German', pt: 'Portuguese', ja: 'Japanese',
  ko: 'Korean', ar: 'Arabic', it: 'Italian', zh: 'Chinese'
}
const langLine = (language: string) =>
  language !== 'en' ? `\n\nWrite everything in ${LANGUAGES_MAP[language] || language}.` : ''

// ── AGENTS ────────────────────────────────────────────────────────────────────
export function runResearchAgent(topic: string, language = 'en', ctx?: AICtx) {
  return generateJSON({
    task: 'research', system: RESEARCH_PROMPT, schema: ResearchSchema, ctx,
    user: `Research this topic: ${topic}${langLine(language)}`,
    maxTokens: 8000,
  })
}

export function runScriptAgent(topic: string, research: unknown, language = 'en', ctx?: AICtx) {
  return generateJSON({
    task: 'scripts', system: SCRIPTS_PROMPT, schema: AllScriptsSchema, ctx,
    user: `Topic: ${topic}\n\nResearch:\n${JSON.stringify(research, null, 2)}${langLine(language)}`,
  })
}

export function runEvaluateAgent(scripts: AllScripts, ctx?: AICtx) {
  return generateJSON({
    task: 'evaluate', system: EVALUATE_PROMPT, schema: EvaluationSchema, ctx,
    user: `Evaluate these scripts:\n${JSON.stringify(scripts, null, 2)}`,
    maxTokens: 8000,
  })
}

export function runRefineAgent(script: SingleScript, topic: string, durationLabel: string, selectedSpeaker = 'both', ctx?: AICtx) {
  return generateJSON({
    task: 'refine', system: REFINE_PROMPT, schema: RefinedSchema, ctx,
    user: `Topic: ${topic}\nTarget duration: ${durationLabel}\nSpeaker mode: ${selectedSpeaker}\n\nScript:\n${JSON.stringify(script, null, 2)}`,
    maxTokens: 64000,
  })
}

export function runSEOAgent(script: { lines?: unknown }, topic: string, title: string, ctx?: AICtx) {
  return generateJSON({
    task: 'seo', system: SEO_PROMPT, schema: SEOSchema, ctx,
    user: `Topic: ${topic}\nTitle: ${title}\n\nScript:\n${JSON.stringify(script.lines ?? script, null, 2)}`,
    maxTokens: 16000,
  })
}
