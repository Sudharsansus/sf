import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { AIGateway, AIOutputError, AIRefusalError, type UsageRecord } from '../src'
import { FakeProvider } from '../src/testing'

const Schema = z.object({ summary: z.string() })

const setup = (env: Record<string, string> = {}) => {
  const provider = new FakeProvider()
  const records: UsageRecord[] = []
  const gw = new AIGateway({ provider, env, sinks: [r => { records.push(r) }] })
  return { provider, records, gw }
}

describe('AIGateway.generateJSON', () => {
  it('returns schema-validated data and records usage + cost', async () => {
    const { provider, records, gw } = setup()
    provider.push({ data: { summary: 'ok' } })
    expect(await gw.generateJSON('research', { system: 's', user: 'u', schema: Schema, ctx: { userId: 'u1' } })).toEqual({ summary: 'ok' })
    expect(records[0]).toMatchObject({ task: 'research', success: true, model: 'claude-opus-5-5', ctx: { userId: 'u1' } })
    expect(records[0]!.costUsd).toBeGreaterThan(0)
    expect(provider.calls[0]!.effort).toBe('medium')
  })
  it('throws a user-facing error on refusal', async () => {
    const { provider, records, gw } = setup()
    provider.push({ data: null, stopReason: 'refusal' })
    await expect(gw.generateJSON('scripts', { system: 's', user: 'u', schema: Schema })).rejects.toBeInstanceOf(AIRefusalError)
    expect(records[0]!.success).toBe(false)
  })
  it('rejects output that fails the schema or hit max_tokens', async () => {
    const { provider, gw } = setup()
    provider.push({ data: { wrong: true } }, { data: { summary: 'x' }, stopReason: 'max_tokens' })
    await expect(gw.generateJSON('seo', { system: 's', user: 'u', schema: Schema })).rejects.toBeInstanceOf(AIOutputError)
    await expect(gw.generateJSON('seo', { system: 's', user: 'u', schema: Schema })).rejects.toBeInstanceOf(AIOutputError)
  })
  it('applies env model/effort overrides per task', async () => {
    const { provider, gw } = setup({ CLAUDE_MODEL: 'claude-sonnet-5-5', AI_EFFORT_SCRIPTS: 'low' })
    provider.push({ data: { summary: 'x' } })
    await gw.generateJSON('scripts', { system: 's', user: 'u', schema: Schema })
    expect(provider.calls[0]).toMatchObject({ model: 'claude-sonnet-5-5', effort: 'low' })
  })
  it('a failing sink never breaks the request', async () => {
    const provider = new FakeProvider([{ data: { summary: 'ok' } }])
    const gw = new AIGateway({ provider, sinks: [() => { throw new Error('db down') }] })
    await expect(gw.generateJSON('research', { system: 's', user: 'u', schema: Schema })).resolves.toEqual({ summary: 'ok' })
  })
})

describe('AIGateway.streamChat', () => {
  it('streams text chunks', async () => {
    const { gw } = setup()
    let out = ''
    await gw.streamChat('sys', [{ role: 'user', content: 'hi' }], t => { out += t })
    expect(out).toBe('Hello there')
  })
})
