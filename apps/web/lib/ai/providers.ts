// ── PROVIDER IMPLEMENTATIONS ──────────────────────────────────────────────────
// Each provider returns the same AIResponse shape. Always.

import type { AIResponse } from './types'
import { COSTS } from './types'
import { logger } from '../logger'

// ── CLAUDE ────────────────────────────────────────────────────────────────────
export async function callClaude(
  system: string, user: string, maxTokens = 4096
): Promise<AIResponse> {
  const start = Date.now()
  const model = 'claude-sonnet-4-20250514'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
  })

  const latencyMs = Date.now() - start

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim() || ''
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)

  return {
    success: true,
    content,
    provider: 'claude',
    model,
    tokens,
    latencyMs,
    cost: (tokens / 1000) * COSTS[model],
    finishReason: data.stop_reason || 'stop',
    attempts: 1,
    fallbackUsed: false
  }
}

// ── OPENAI (GPT-4o-mini) ──────────────────────────────────────────────────────
export async function callOpenAI(
  system: string, user: string, maxTokens = 2048
): Promise<AIResponse> {
  const start = Date.now()
  const model = 'gpt-4o-mini'

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      response_format: { type: 'json_object' } // forces valid JSON
    })
  })

  const latencyMs = Date.now() - start

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content?.trim() || ''
  const tokens = data.usage?.total_tokens || 0

  return {
    success: true,
    content,
    provider: 'openai',
    model,
    tokens,
    latencyMs,
    cost: (tokens / 1000) * COSTS[model],
    finishReason: data.choices?.[0]?.finish_reason || 'stop',
    attempts: 1,
    fallbackUsed: false
  }
}

// ── GROQ (Llama 3.3 70B) ─────────────────────────────────────────────────────
export async function callGroq(
  system: string, user: string, maxTokens = 2048
): Promise<AIResponse> {
  const start = Date.now()
  const model = 'llama-3.3-70b-versatile'

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      response_format: { type: 'json_object' }
    })
  })

  const latencyMs = Date.now() - start

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content?.trim() || ''
  const tokens = data.usage?.total_tokens || 0

  return {
    success: true,
    content,
    provider: 'groq',
    model,
    tokens,
    latencyMs,
    cost: (tokens / 1000) * COSTS[model],
    finishReason: data.choices?.[0]?.finish_reason || 'stop',
    attempts: 1,
    fallbackUsed: false
  }
}
