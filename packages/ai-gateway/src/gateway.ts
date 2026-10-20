import type * as z from 'zod'
import { withSpan, recordAIUsage } from '@isaii/telemetry'
import { logger } from '@isaii/logger'
import { taskConfig } from './registry'
import { costUsd } from './pricing'
import { AIOutputError, AIRefusalError } from './errors'
import type { AICtx, ChatMessage, LLMProvider, TaskType, UsageSink } from './types'

export type GatewayOptions = { provider: LLMProvider; sinks?: UsageSink[]; env?: Record<string, string | undefined> }

/** The only way application code talks to an LLM. */
export class AIGateway {
  private sinks: UsageSink[]
  constructor(private opts: GatewayOptions) { this.sinks = [...(opts.sinks ?? [])] }

  addSink(sink: UsageSink) { this.sinks.push(sink) }

  async generateJSON<S extends z.ZodType>(task: TaskType, input: { system: string; user: string; schema: S; ctx?: AICtx; maxTokens?: number }): Promise<z.infer<S>> {
    const cfg = taskConfig(task, this.opts.env)
    const started = Date.now()
    return withSpan(`ai.${task}`, { 'ai.task': task, 'ai.model': cfg.model }, async () => {
      const res = await this.opts.provider.generateJSON({
        model: cfg.model, system: input.system, user: input.user, schema: input.schema,
        maxTokens: input.maxTokens ?? cfg.maxTokens, effort: cfg.effort,
      })
      const record = (success: boolean) => this.emit({
        task, provider: this.opts.provider.name, model: cfg.model, usage: res.usage,
        costUsd: costUsd(cfg.model, res.usage), latencyMs: Date.now() - started, success, ctx: input.ctx,
      })
      if (res.stopReason === 'refusal') { await record(false); throw new AIRefusalError(task) }
      if (res.stopReason === 'max_tokens') { await record(false); throw new AIOutputError(task, 'ran out of tokens') }
      const parsed = input.schema.safeParse(res.data)
      if (!parsed.success) { await record(false); throw new AIOutputError(task, parsed.error.message.slice(0, 200)) }
      await record(true)
      return parsed.data
    })
  }

  async streamChat(system: string, messages: ChatMessage[], onText: (t: string) => void, ctx?: AICtx) {
    const cfg = taskConfig('chat', this.opts.env)
    const started = Date.now()
    const { usage } = await this.opts.provider.streamText({ model: cfg.model, system, messages: messages.slice(-20), maxTokens: cfg.maxTokens, effort: cfg.effort }, onText)
    await this.emit({ task: 'chat', provider: this.opts.provider.name, model: cfg.model, usage, costUsd: costUsd(cfg.model, usage), latencyMs: Date.now() - started, success: true, ctx })
  }

  private async emit(r: Parameters<UsageSink>[0]) {
    recordAIUsage({ task: r.task, model: r.model, inputTokens: r.usage.inputTokens, outputTokens: r.usage.outputTokens, cachedTokens: r.usage.cacheReadTokens, costUsd: r.costUsd })
    logger.info('ai', { task: r.task, model: r.model, ms: r.latencyMs, ok: r.success, in: r.usage.inputTokens, out: r.usage.outputTokens, cached: r.usage.cacheReadTokens, cost: Number(r.costUsd.toFixed(5)) })
    for (const sink of this.sinks) {
      try { await sink(r) } catch (e) { logger.warn('usage sink failed', { error: (e as Error).message }) }
    }
  }
}
