// ── AI GATEWAY v7 ─────────────────────────────────────────────────────────────
// Single entry point. No exceptions.
// Semantic cache, adaptive provider scoring, circuit breakers, persistent logs.

import type { PromptInput, AIResponse, TaskType } from './types'
import { TASK_ROUTING, PROVIDER_TIMEOUTS } from './types'
import { callClaude, callOpenAI, callGroq } from './providers'
import { safeParseJSON } from './repair'
import { logger } from '../logger'
import { getCached, setCache } from '../cache/semantic'
import { ZodSchema } from 'zod'

// ── CIRCUIT BREAKER ───────────────────────────────────────────────────────────
const THRESHOLD = 3
const RESET_MS  = 60_000

interface Circuit { failures: number; lastFail: number; state: 'closed'|'open'|'half-open' }
const circuits: Record<string, Circuit> = {
  claude: { failures:0, lastFail:0, state:'closed' },
  openai: { failures:0, lastFail:0, state:'closed' },
  groq:   { failures:0, lastFail:0, state:'closed' }
}

function circuitOpen(p: string): boolean {
  const c = circuits[p]
  if (!c || c.state === 'closed') return false
  if (c.state === 'open' && Date.now() - c.lastFail > RESET_MS) { c.state = 'half-open'; return false }
  return c.state === 'open'
}
function onSuccess(p: string) { const c = circuits[p]; if (c) { c.failures = 0; c.state = 'closed' } }
function onFailure(p: string) {
  const c = circuits[p]; if (!c) return
  c.failures++; c.lastFail = Date.now()
  if (c.failures >= THRESHOLD) { c.state = 'open'; logger.warn(`Circuit OPEN: ${p}`) }
}

// ── PROVIDER SCORING (adaptive routing) ──────────────────────────────────────
const providerLatency: Record<string, number[]> = { claude: [], openai: [], groq: [] }

function recordLatency(provider: string, ms: number) {
  const arr = providerLatency[provider]
  if (arr) { arr.push(ms); if (arr.length > 20) arr.shift() }
}

function avgLatency(provider: string): number {
  const arr = providerLatency[provider]
  if (!arr || arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

// ── PROVIDER CHAIN ────────────────────────────────────────────────────────────
function providerChain(task: TaskType): ('claude'|'openai'|'groq')[] {
  const tier = TASK_ROUTING[task]
  if (tier === 'premium') {
    const claudeAvg = avgLatency('claude')
    if (!circuitOpen('claude') && (claudeAvg === 0 || claudeAvg < 40000)) return ['claude', 'openai', 'groq']
    return ['openai', 'claude', 'groq']
  }
  if (tier === 'standard') return ['openai', 'groq', 'claude']
  return ['groq', 'openai', 'claude']
}

function providerAvailable(p: string): boolean {
  if (circuitOpen(p)) return false
  const keys: Record<string, string|undefined> = {
    claude: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    groq:   process.env.GROQ_API_KEY
  }
  return !!keys[p]
}

async function callWithTimeout(
  provider: 'claude'|'openai'|'groq',
  system: string, user: string, maxTokens: number
): Promise<AIResponse> {
  const timeout = PROVIDER_TIMEOUTS[provider] ?? 30_000
  const fn = provider === 'claude' ? callClaude(system, user, maxTokens)
           : provider === 'openai' ? callOpenAI(system, user, maxTokens)
           : callGroq(system, user, maxTokens)
  return Promise.race([fn, new Promise<never>((_, rej) =>
    setTimeout(() => rej(new Error(`${provider} timeout after ${timeout}ms`)), timeout)
  )])
}

// ── PERSISTENT LOG ────────────────────────────────────────────────────────────
async function persistLog(entry: {
  taskType: string; provider: string; model: string
  tokens: number; latencyMs: number; costUsd: number
  fallbackUsed: boolean; success: boolean
  episodeId?: string|null; userId?: string|null
}) {
  try {
    const { db, aiRequestLog } = await import('../db')
    await db.insert(aiRequestLog).values({
      taskType: entry.taskType, provider: entry.provider, model: entry.model,
      tokens: entry.tokens, latencyMs: entry.latencyMs,
      costUsd: String(entry.costUsd.toFixed(8)),
      fallbackUsed: entry.fallbackUsed, success: entry.success,
      episodeId: entry.episodeId ?? null, userId: entry.userId ?? null
    })
  } catch {}
}

// ── STATS FROM DB ─────────────────────────────────────────────────────────────
export async function getAIStats() {
  try {
    const { db, aiRequestLog } = await import('../db')
    const { sql } = await import('drizzle-orm')
    const rows = await db.select({
      provider:    aiRequestLog.provider,
      count:       sql<number>`count(*)::int`,
      totalTokens: sql<number>`sum(tokens)::int`,
      totalCost:   sql<number>`sum(cost_usd::numeric)`,
      avgLatency:  sql<number>`avg(latency_ms)::int`,
      fallbacks:   sql<number>`sum(case when fallback_used then 1 else 0 end)::int`,
      failures:    sql<number>`sum(case when not success then 1 else 0 end)::int`
    }).from(aiRequestLog).groupBy(aiRequestLog.provider)

    const total     = rows.reduce((s, r) => s + r.count, 0)
    const totalCost = rows.reduce((s, r) => s + Number(r.totalCost || 0), 0)
    const fallbacks = rows.reduce((s, r) => s + (r.fallbacks || 0), 0)

    return {
      total,
      totalCostUsd:  totalCost.toFixed(6),
      fallbackRate:  total > 0 ? (fallbacks / total).toFixed(3) : '0',
      byProvider: rows.map(r => ({
        provider:     r.provider,
        count:        r.count,
        avgLatencyMs: r.avgLatency,
        totalTokens:  r.totalTokens,
        failureCount: r.failures
      })),
      circuits:     Object.fromEntries(Object.entries(circuits).map(([k, v]) => [k, v.state])),
      avgLatencies: Object.fromEntries(Object.entries(providerLatency).map(([k]) => [k, Math.round(avgLatency(k))]))
    }
  } catch {
    return { total: 0, totalCostUsd: '0', fallbackRate: '0', byProvider: [], circuits: {}, avgLatencies: {} }
  }
}

// ── safeGenerate ──────────────────────────────────────────────────────────────
export async function safeGenerate<T = any>(
  input: PromptInput,
  schema?: ZodSchema<T>,
  ctx?: { episodeId?: string|null; userId?: string|null; noCache?: boolean }
): Promise<{ data: T; meta: AIResponse; cached?: boolean }> {
  const task      = input.taskType || 'chat'
  const maxTokens = input.maxTokens || 4096

  // Semantic cache — skip for scripts/refine (quality sensitive)
  const cacheable = ['research', 'seo', 'evaluate'].includes(task) && !ctx?.noCache
  if (cacheable) {
    const hit = await getCached<T>(input.system, input.user)
    if (hit) {
      logger.info('Cache HIT', { task })
      const fakeMeta: AIResponse = {
        success: true, content: '', provider: 'claude', model: 'cached',
        tokens: 0, latencyMs: 0, cost: 0, finishReason: 'cache',
        attempts: 0, fallbackUsed: false
      }
      return { data: hit, meta: fakeMeta, cached: true }
    }
  }

  const providers = providerChain(task).filter(p => providerAvailable(p))
  if (providers.length === 0) throw new Error('No AI providers available.')

  const RETRIES = 2
  const DELAYS  = [1500, 4000]
  let lastErr: Error = new Error('All providers failed')
  let totalAttempts  = 0
  let fallbackUsed   = false

  for (let pi = 0; pi < providers.length; pi++) {
    const provider = providers[pi]
    if (pi > 0) fallbackUsed = true

    for (let attempt = 0; attempt < RETRIES; attempt++) {
      totalAttempts++
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, DELAYS[attempt - 1]))

        const start     = Date.now()
        const response  = await callWithTimeout(provider, input.system, input.user, maxTokens)
        const latencyMs = Date.now() - start

        onSuccess(provider)
        recordLatency(provider, latencyMs)

        const parsed = safeParseJSON(response.content)

        // ── FIXED: proper TypeScript narrowing on discriminated union ──────────
        if (!parsed.ok) {
          const errMsg = (parsed as { ok: false; error: string }).error ?? 'Unknown parse error'
          throw new Error(`JSON parse failed: ${errMsg}`)
        }

        let data: T
        if (schema) {
          const validated = schema.safeParse(parsed.data)
          if (!validated.success) {
            if (attempt < RETRIES - 1) throw new Error('Schema invalid')
            logger.warn(`Partial data from ${provider}`, { task })
            data = parsed.data as T
          } else {
            data = validated.data
          }
        } else {
          data = parsed.data as T
        }

        if (cacheable) await setCache(input.system, input.user, data, task as any)

        const meta: AIResponse = { ...response, latencyMs, parsed: data, fallbackUsed, attempts: totalAttempts }
        persistLog({
          taskType: task, provider, model: response.model,
          tokens: response.tokens, latencyMs, costUsd: response.cost,
          fallbackUsed, success: true,
          episodeId: ctx?.episodeId, userId: ctx?.userId
        })
        logger.info('AI ok', {
          task, provider, tokens: response.tokens,
          ms: latencyMs, cost: `$${response.cost.toFixed(5)}`, fallback: fallbackUsed
        })
        return { data, meta }

      } catch (e: any) {
        lastErr = e
        onFailure(provider)
        logger.warn(`${provider} attempt ${attempt + 1} failed`, { task, error: e.message.slice(0, 120) })
      }
    }
  }

  persistLog({
    taskType: task, provider: 'none', model: 'none',
    tokens: 0, latencyMs: 0, costUsd: 0,
    fallbackUsed: true, success: false,
    episodeId: ctx?.episodeId, userId: ctx?.userId
  })
  throw new Error(`All AI providers failed after ${totalAttempts} attempts: ${lastErr.message}`)
}

// ── STREAMING ─────────────────────────────────────────────────────────────────
export async function streamGenerate(
  system: string,
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void
): Promise<void> {
  if (process.env.ANTHROPIC_API_KEY && !circuitOpen('claude')) {
    try {
      const { Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-20250514', max_tokens: 1024, system,
        messages: messages.slice(-20) as any
      })
      for await (const chunk of stream)
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta')
          onChunk(chunk.delta.text)
      onSuccess('claude')
      return
    } catch (e: any) {
      onFailure('claude')
      logger.warn('Claude stream failed', { error: e.message })
    }
  }

  if (process.env.OPENAI_API_KEY && !circuitOpen('openai')) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini', max_tokens: 1024, stream: true,
        messages: [{ role: 'system', content: system }, ...messages.slice(-20)]
      })
    })
    const reader = res.body?.getReader()
    const dec = new TextDecoder()
    while (reader) {
      const { done, value } = await reader.read(); if (done) break
      for (const line of dec.decode(value).split('\n')) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
        try { const d = JSON.parse(line.slice(6)); onChunk(d.choices?.[0]?.delta?.content || '') } catch {}
      }
    }
    onSuccess('openai')
    return
  }

  throw new Error('No streaming provider available')
}