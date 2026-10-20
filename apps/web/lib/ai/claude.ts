// ── CLAUDE CLIENT ─────────────────────────────────────────────────────────────
// Single AI provider for every text task: research, scripts, scoring, refine,
// SEO, thumbnail design and chat. Structured outputs replace JSON repair.

import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type * as z from 'zod'
import { logger } from '@isaii/logger'

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5'

// USD per 1M tokens for the default model — used for cost logging only.
const PRICE = { input: 4, output: 20, cacheRead: 0.2 }

export type TaskType = 'research' | 'scripts' | 'evaluate' | 'refine' | 'seo' | 'thumbnail' | 'chat'
type Effort = 'low' | 'medium' | 'high'

// Effort per task: quality-critical writing gets more thinking, packaging less.
const EFFORT: Record<TaskType, Effort> = {
  research: 'medium',
  scripts: 'high',
  evaluate: 'medium',
  refine: 'high',
  seo: 'low',
  thumbnail: 'low',
  chat: 'low',
}

let client: Anthropic | null = null
function anthropic() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 3 })
  return client
}

function costOf(usage: Anthropic.Usage): number {
  const cached = usage.cache_read_input_tokens || 0
  return (
    (usage.input_tokens * PRICE.input +
      (usage.cache_creation_input_tokens || 0) * PRICE.input * 1.25 +
      cached * PRICE.cacheRead +
      usage.output_tokens * PRICE.output) / 1_000_000
  )
}

async function logUsage(task: TaskType, usage: Anthropic.Usage, latencyMs: number, ctx?: AICtx, success = true) {
  try {
    const { db, aiRequestLog } = await import('@isaii/db')
    await db.insert(aiRequestLog).values({
      taskType: task, provider: 'claude', model: CLAUDE_MODEL,
      tokens: usage.input_tokens + usage.output_tokens, latencyMs,
      costUsd: costOf(usage).toFixed(8),
      fallbackUsed: false, success,
      episodeId: ctx?.episodeId ?? null, userId: ctx?.userId ?? null,
    })
  } catch {}
}

export type AICtx = { episodeId?: string | null; userId?: string | null }

/**
 * Run one task and get schema-validated JSON back.
 * The system prompt is cached, so repeated calls for the same task are cheaper.
 */
export async function generateJSON<S extends z.ZodType>(opts: {
  task: TaskType
  system: string
  user: string
  schema: S
  maxTokens?: number
  ctx?: AICtx
}): Promise<z.infer<S>> {
  const start = Date.now()
  const stream = anthropic().messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 32000,
    system: [{ type: 'text', text: opts.system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: opts.user }],
    output_config: { effort: EFFORT[opts.task], format: zodOutputFormat(opts.schema) },
  })
  const msg = await stream.finalMessage()
  const latencyMs = Date.now() - start

  if (msg.stop_reason === 'refusal') {
    await logUsage(opts.task, msg.usage, latencyMs, opts.ctx, false)
    throw new Error(`Claude declined the ${opts.task} request`)
  }
  if (msg.stop_reason === 'max_tokens') {
    await logUsage(opts.task, msg.usage, latencyMs, opts.ctx, false)
    throw new Error(`Claude ran out of tokens on ${opts.task}`)
  }

  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('')
  const parsed = opts.schema.safeParse(JSON.parse(text))
  if (!parsed.success) {
    await logUsage(opts.task, msg.usage, latencyMs, opts.ctx, false)
    throw new Error(`Invalid ${opts.task} output: ${parsed.error.message.slice(0, 200)}`)
  }

  await logUsage(opts.task, msg.usage, latencyMs, opts.ctx)
  logger.info('Claude ok', {
    task: opts.task, ms: latencyMs,
    in: msg.usage.input_tokens, out: msg.usage.output_tokens,
    cached: msg.usage.cache_read_input_tokens || 0,
    cost: `$${costOf(msg.usage).toFixed(4)}`,
  })
  return parsed.data
}

/** Stream a chat reply token by token. */
export async function streamChat(
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void
): Promise<void> {
  const stream = anthropic().messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: messages.slice(-20),
    output_config: { effort: EFFORT.chat },
  })
  stream.on('text', onChunk)
  await stream.finalMessage()
}

/** Aggregate usage from ai_request_log for the admin/health dashboards. */
export async function getAIStats() {
  try {
    const { db, aiRequestLog } = await import('@isaii/db')
    const { sql } = await import('drizzle-orm')
    const rows = await db.select({
      task: aiRequestLog.taskType,
      count: sql<number>`count(*)::int`,
      totalTokens: sql<number>`sum(tokens)::int`,
      totalCost: sql<number>`sum(cost_usd::numeric)`,
      avgLatency: sql<number>`avg(latency_ms)::int`,
      failures: sql<number>`sum(case when not success then 1 else 0 end)::int`,
    }).from(aiRequestLog).groupBy(aiRequestLog.taskType)

    const total = rows.reduce((s, r) => s + r.count, 0)
    return {
      model: CLAUDE_MODEL,
      total,
      totalCostUsd: rows.reduce((s, r) => s + Number(r.totalCost || 0), 0).toFixed(4),
      byTask: rows.map(r => ({
        task: r.task, count: r.count, avgLatencyMs: r.avgLatency,
        totalTokens: r.totalTokens, failureCount: r.failures,
      })),
    }
  } catch {
    return { model: CLAUDE_MODEL, total: 0, totalCostUsd: '0', byTask: [] }
  }
}
