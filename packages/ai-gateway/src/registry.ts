import type { Effort, TaskType } from './types'

export type TaskConfig = { model: string; effort: Effort; maxTokens: number }

export const DEFAULT_MODEL = 'claude-opus-5-5'

/** Per-task model settings. Quality-critical writing thinks harder; packaging is cheap. */
export const DEFAULT_TASKS: Record<TaskType, TaskConfig> = {
  research: { model: DEFAULT_MODEL, effort: 'medium', maxTokens: 8_000 },
  scripts: { model: DEFAULT_MODEL, effort: 'high', maxTokens: 32_000 },
  evaluate: { model: DEFAULT_MODEL, effort: 'medium', maxTokens: 8_000 },
  refine: { model: DEFAULT_MODEL, effort: 'high', maxTokens: 64_000 },
  seo: { model: DEFAULT_MODEL, effort: 'low', maxTokens: 16_000 },
  thumbnail: { model: DEFAULT_MODEL, effort: 'low', maxTokens: 4_000 },
  chat: { model: DEFAULT_MODEL, effort: 'low', maxTokens: 2_048 },
  judge: { model: DEFAULT_MODEL, effort: 'medium', maxTokens: 4_000 },
  // Anonymous homepage preview: cheap and fast
  preview: { model: 'claude-haiku-5-5', effort: 'low', maxTokens: 8_000 },
}

/**
 * Resolve config for a task. Env overrides:
 *   CLAUDE_MODEL=…            every task
 *   AI_MODEL_SCRIPTS=…        one task
 *   AI_EFFORT_SEO=medium      one task's effort
 */
export function taskConfig(task: TaskType, env: Record<string, string | undefined> = process.env): TaskConfig {
  const base = DEFAULT_TASKS[task]
  const T = task.toUpperCase()
  const effort = env[`AI_EFFORT_${T}`]
  return {
    model: env[`AI_MODEL_${T}`] || env.CLAUDE_MODEL || base.model,
    effort: effort === 'low' || effort === 'medium' || effort === 'high' ? effort : base.effort,
    maxTokens: base.maxTokens,
  }
}
