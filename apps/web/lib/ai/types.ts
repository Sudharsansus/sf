// ── UNIFIED AI TYPES ──────────────────────────────────────────────────────────
// Every provider returns AIResponse. No exceptions.

export type AIProvider = 'claude' | 'openai' | 'groq'
export type AITier = 'premium' | 'standard' | 'cheap'

export interface PromptInput {
  system: string
  user: string
  maxTokens?: number
  tier?: AITier
  taskType?: TaskType
}

export type TaskType =
  | 'research'   // cheap  — Groq first
  | 'scripts'    // premium — Claude first
  | 'evaluate'   // standard — GPT-4o-mini first
  | 'refine'     // premium — Claude first
  | 'seo'        // cheap  — Groq first
  | 'chat'       // standard — GPT-4o-mini first
  | 'repair'     // cheap  — Groq first

export interface AIResponse {
  success: boolean
  content: string
  parsed?: any
  provider: AIProvider
  model: string
  tokens: number
  latencyMs: number
  cost: number
  finishReason: string
  attempts: number
  fallbackUsed: boolean
  error?: string
}

// Cost per 1k tokens (blended input+output estimate)
export const COSTS: Record<string, number> = {
  'claude-sonnet-4-20250514': 0.003,
  'gpt-4o-mini': 0.00015,
  'llama-3.3-70b-versatile': 0.00006
}

// Task → primary provider tier
export const TASK_ROUTING: Record<TaskType, AITier> = {
  research: 'cheap',
  scripts:  'premium',
  evaluate: 'standard',
  refine:   'premium',
  seo:      'cheap',
  chat:     'standard',
  repair:   'cheap'
}

// Per-provider hard timeouts — fail fast, trigger fallback
export const PROVIDER_TIMEOUTS: Record<string, number> = {
  claude: 55_000,  // Claude can be slow on 8k token outputs
  openai: 30_000,
  groq:   15_000   // Groq is fast — bail quickly if not
}
