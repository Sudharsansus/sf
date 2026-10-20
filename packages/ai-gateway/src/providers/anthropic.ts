import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type * as z from 'zod'
import type { ChatMessage, Effort, JSONRequest, LLMProvider, Usage } from '../types'

const toUsage = (u: Anthropic.Usage): Usage => ({
  inputTokens: u.input_tokens,
  outputTokens: u.output_tokens,
  cacheReadTokens: u.cache_read_input_tokens ?? 0,
  cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
})

/** Claude via the official SDK: structured outputs, cached system prompts, adaptive thinking by effort. */
export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic'
  private client: Anthropic
  constructor(opts: { apiKey?: string; client?: Anthropic } = {}) {
    this.client = opts.client ?? new Anthropic({ apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY, maxRetries: 3 })
  }

  async generateJSON<S extends z.ZodType>(req: JSONRequest<S>) {
    const msg = await this.client.messages.stream({
      model: req.model,
      max_tokens: req.maxTokens,
      system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: req.user }],
      output_config: { effort: req.effort, format: zodOutputFormat(req.schema as never) },
    }).finalMessage()
    const text = msg.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('')
    let data: unknown
    try { data = text ? JSON.parse(text) : null } catch { data = null }
    return { data, usage: toUsage(msg.usage), stopReason: msg.stop_reason ?? 'end_turn' }
  }

  async streamText(req: { model: string; system: string; messages: ChatMessage[]; maxTokens: number; effort: Effort }, onText: (t: string) => void) {
    const stream = this.client.messages.stream({
      model: req.model,
      max_tokens: req.maxTokens,
      system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
      messages: req.messages,
      output_config: { effort: req.effort },
    })
    stream.on('text', onText)
    const msg = await stream.finalMessage()
    return { usage: toUsage(msg.usage) }
  }
}
