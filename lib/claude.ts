// ── SCENEFORGE AGENTS ─────────────────────────────────────────────────────────
// All agents go through safeGenerate() — never call providers directly.
// Routing: scripts + refine → Claude | research + seo + evaluate → cheap model

import { z } from 'zod'
import { safeGenerate } from './ai'
import {
  RESEARCH_PROMPT, SCRIPTS_PROMPT, EVALUATE_PROMPT,
  REFINE_PROMPT, SEO_PROMPT
} from './prompts'
import { logger } from './logger'

// ── SCHEMAS ───────────────────────────────────────────────────────────────────
export const ScriptLineSchema = z.object({
  speaker: z.enum(['A', 'B']),
  text: z.string().min(1).max(300)
})
export const SpeakerSchema = z.object({
  id: z.enum(['A', 'B']),
  name: z.string().min(1),
  personality: z.string().min(1)
})
export const SingleScriptSchema = z.object({
  angle: z.string().min(1),
  title: z.string().min(1).max(120),
  hook: z.string().min(1),
  duration_estimate_seconds: z.number().min(30).max(7200),
  speakers: z.array(SpeakerSchema).length(2),
  lines: z.array(ScriptLineSchema).min(8).max(60)
})
export const AllScriptsSchema = z.object({
  scripts: z.array(SingleScriptSchema).min(1).max(5)
})
export type SingleScript = z.infer<typeof SingleScriptSchema>
export type AllScripts = z.infer<typeof AllScriptsSchema>

// ── RESEARCH AGENT — cheap (Groq) ─────────────────────────────────────────────
export async function runResearchAgent(topic: string) {
  logger.info('Research agent', { topic, provider: 'groq→openai→claude' })
  const { data } = await safeGenerate({
    system: RESEARCH_PROMPT,
    user: `Research this topic thoroughly: ${topic}`,
    taskType: 'research',
    maxTokens: 2048
  })
  return data
}

// ── SCRIPT AGENT — premium (Claude) ──────────────────────────────────────────
export async function runScriptAgent(topic: string, research: any): Promise<AllScripts> {
  logger.info('Script agent', { topic, provider: 'claude→openai→groq' })
  const { data } = await safeGenerate(
    {
      system: SCRIPTS_PROMPT,
      user: `Topic: ${topic}\n\nResearch:\n${JSON.stringify(research, null, 2)}`,
      taskType: 'scripts',
      maxTokens: 4000
    },
    AllScriptsSchema
  )
  return data
}

// ── EVALUATE AGENT — standard (GPT-4o-mini) ───────────────────────────────────
export async function runEvaluateAgent(scripts: AllScripts) {
  logger.info('Evaluate agent', { provider: 'openai→groq→claude' })
  const { data } = await safeGenerate({
    system: EVALUATE_PROMPT,
    user: `Evaluate these scripts:\n${JSON.stringify(scripts, null, 2)}`,
    taskType: 'evaluate',
    maxTokens: 3000
  })
  return data
}

// ── REFINE AGENT — premium (Claude) ───────────────────────────────────────────
export async function runRefineAgent(script: SingleScript, topic: string) {
  logger.info('Refine agent', { angle: script.angle, provider: 'claude→openai→groq' })
  const { data } = await safeGenerate({
    system: REFINE_PROMPT,
    user: `Topic: ${topic}\n\nScript:\n${JSON.stringify(script, null, 2)}`,
    taskType: 'refine',
    maxTokens: 8000
  })
  return data
}

// ── SEO AGENT — cheap (Groq) ──────────────────────────────────────────────────
export async function runSEOAgent(script: any, topic: string, title: string) {
  logger.info('SEO agent', { title, provider: 'groq→openai→claude' })
  const { data } = await safeGenerate({
    system: SEO_PROMPT,
    user: `Topic: ${topic}\nTitle: ${title}\n\nScript:\n${JSON.stringify(script.lines || script, null, 2)}`,
    taskType: 'seo',
    maxTokens: 4000
  })
  return data
}
