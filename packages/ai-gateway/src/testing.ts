import type { LLMProvider, Usage } from './types'

const usage: Usage = { inputTokens: 100, outputTokens: 50, cacheReadTokens: 0, cacheWriteTokens: 0 }

type Reply = { data: unknown; stopReason?: string } | Error

/** Deterministic provider for tests: returns queued replies in order and records requests. */
export class FakeProvider implements LLMProvider {
  readonly name = 'fake'
  readonly calls: { kind: 'json' | 'stream'; model: string; system: string; user?: string; effort: string }[] = []
  constructor(private replies: Reply[] = [], private streamChunks: string[] = ['Hello', ' there']) {}

  push(...r: Reply[]) { this.replies.push(...r) }

  async generateJSON(req: { model: string; system: string; user: string; effort: string }) {
    this.calls.push({ kind: 'json', model: req.model, system: req.system, user: req.user, effort: req.effort })
    const next = this.replies.shift()
    if (!next) throw new Error('FakeProvider: no reply queued')
    if (next instanceof Error) throw next
    return { data: next.data, usage, stopReason: next.stopReason ?? 'end_turn' }
  }

  async streamText(req: { model: string; system: string; effort: string }, onText: (t: string) => void) {
    this.calls.push({ kind: 'stream', model: req.model, system: req.system, effort: req.effort })
    for (const c of this.streamChunks) onText(c)
    return { usage }
  }
}
