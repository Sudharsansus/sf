import type * as z from 'zod'

export type Effort = 'low' | 'medium' | 'high'

export type TaskType = 'research' | 'scripts' | 'evaluate' | 'refine' | 'seo' | 'thumbnail' | 'chat' | 'judge' | 'preview'

export type Usage = { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number }

export type JSONRequest<S extends z.ZodType> = {
  model: string
  system: string
  user: string
  schema: S
  maxTokens: number
  effort: Effort
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

/** A large-language-model vendor. Add a provider = implement this; nothing else changes. */
export interface LLMProvider {
  readonly name: string
  generateJSON<S extends z.ZodType>(req: JSONRequest<S>): Promise<{ data: unknown; usage: Usage; stopReason: string }>
  streamText(req: { model: string; system: string; messages: ChatMessage[]; maxTokens: number; effort: Effort }, onText: (t: string) => void): Promise<{ usage: Usage }>
}

export type UsageRecord = {
  task: TaskType
  provider: string
  model: string
  usage: Usage
  costUsd: number
  latencyMs: number
  success: boolean
  ctx?: AICtx
}

export type AICtx = { episodeId?: string | null; userId?: string | null }

/** Where usage records go (DB log, telemetry). Registered by the host app. */
export type UsageSink = (r: UsageRecord) => void | Promise<void>
