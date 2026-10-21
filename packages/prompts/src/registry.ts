import * as research from './tasks/research'
import * as scripts from './tasks/scripts'
import * as evaluate from './tasks/evaluate'
import * as refine from './tasks/refine'
import * as seo from './tasks/seo'
import * as thumbnail from './tasks/thumbnail'
import * as chat from './tasks/chat'
import * as judge from './tasks/judge'
import * as preview from './tasks/preview'

const TASKS = { research, scripts, evaluate, refine, seo, thumbnail, chat, judge, preview } as const
export type PromptTask = keyof typeof TASKS

export type PromptRef = `${PromptTask}@${string}`

/**
 * Get a system prompt. Version resolution: explicit `task@vN` > env PROMPT_<TASK>=vN > task's active version.
 * Prompts are immutable once released — add v2 instead of editing v1, so evals can compare them.
 */
export function getPrompt(ref: PromptTask | PromptRef, env: Record<string, string | undefined> = process.env): { id: PromptRef; text: string } {
  const [task, explicit] = ref.split('@') as [PromptTask, string | undefined]
  const mod = TASKS[task]
  if (!mod) throw new Error(`Unknown prompt task: ${task}`)
  const version = explicit ?? env[`PROMPT_${task.toUpperCase()}`] ?? mod.active
  const text = (mod.versions as Record<string, string>)[version]
  if (!text) throw new Error(`Unknown prompt version: ${task}@${version}`)
  return { id: `${task}@${version}`, text }
}

export const promptTasks = Object.keys(TASKS) as PromptTask[]
export const promptVersions = (task: PromptTask) => Object.keys(TASKS[task].versions)
