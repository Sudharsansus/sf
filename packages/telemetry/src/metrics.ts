import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('isaii')

const aiTokens = meter.createCounter('isaii.ai.tokens', { description: 'LLM tokens by task, model and direction' })
const aiCost = meter.createCounter('isaii.ai.cost_usd', { description: 'Estimated LLM spend in USD' })
const ttsChars = meter.createCounter('isaii.voice.tts_chars', { description: 'Characters sent to TTS' })
const stepLatency = meter.createHistogram('isaii.pipeline.step_ms', { description: 'Pipeline step duration', unit: 'ms' })

export type AIUsage = { task: string; model: string; inputTokens: number; outputTokens: number; cachedTokens?: number; costUsd: number }

export function recordAIUsage(u: AIUsage) {
  const attrs = { task: u.task, model: u.model }
  aiTokens.add(u.inputTokens, { ...attrs, direction: 'input' })
  aiTokens.add(u.outputTokens, { ...attrs, direction: 'output' })
  if (u.cachedTokens) aiTokens.add(u.cachedTokens, { ...attrs, direction: 'cache_read' })
  aiCost.add(u.costUsd, attrs)
}

export const recordTTS = (chars: number, model: string, language: string) => ttsChars.add(chars, { model, language })
export const recordStep = (step: string, ms: number, ok: boolean) => stepLatency.record(ms, { step, ok: String(ok) })
