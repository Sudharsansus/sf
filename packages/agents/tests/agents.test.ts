import { describe, expect, it } from 'vitest'
import { AIGateway } from '@isaii/ai-gateway'
import { FakeProvider } from '@isaii/ai-gateway/testing'
import { applySpeakerMode, designThumbnails, evaluateScripts, normaliseScript, refineScript, research, writeScripts, writeSEO, chat } from '../src'
import { research as researchFixture, script } from './fixtures'

const deps = (...replies: { data: unknown }[]) => {
  const provider = new FakeProvider(replies)
  return { provider, deps: { gateway: new AIGateway({ provider, env: {} }) } }
}

describe('research', () => {
  it('adds language instructions to the user turn only', async () => {
    const { provider, deps: d } = deps({ data: researchFixture })
    await research('ಮೈಸೂರು ಅರಮನೆ', 'kn', d)
    expect(provider.calls[0]!.user).toContain('Kannada')
    expect(provider.calls[0]!.system).not.toContain('Kannada')
  })
})

describe('writeScripts', () => {
  it('normalises scripts and drops unusable ones', async () => {
    const empty = { ...script('beginner'), lines: [{ speaker: 'A' as const, text: '  ' }] }
    const { deps: d } = deps({ data: { scripts: [script('story'), empty] } })
    const out = await writeScripts('topic', researchFixture, 'en', d)
    expect(out.scripts.map(s => s.angle)).toEqual(['story'])
  })
  it('fails when no script is usable', async () => {
    const { deps: d } = deps({ data: { scripts: [] } })
    await expect(writeScripts('t', {}, 'en', d)).rejects.toThrow()
  })
  it('fills in a missing speaker', () => {
    const s = normaliseScript({ ...script('x'), speakers: [{ id: 'A', name: 'A', personality: 'p' }] })
    expect(s.speakers.map(sp => sp.id)).toEqual(['A', 'B'])
  })
})

describe('evaluateScripts', () => {
  it('derives winner from totals, ignoring unknown angles', async () => {
    const scores = (angle: string, total: number) => ({ angle, title: 't', total, verdict: 'v', best_for: 'b', metrics: Object.fromEntries(['engagement', 'clarity', 'uniqueness', 'seo_potential', 'viral_potential', 'pacing', 'reusability', 'monetization', 'authority', 'feasibility'].map(k => [k, 5])) })
    const { deps: d } = deps({ data: { scores: [scores('story', 70), scores('technical', 80), scores('made-up', 99)], winner: 'made-up', runner_up: 'story' } })
    const out = await evaluateScripts({ scripts: [script('story'), script('technical')] }, d)
    expect(out.winner).toBe('technical')
    expect(out.runner_up).toBe('story')
  })
})

describe('refineScript', () => {
  it('enforces the speaker mode', async () => {
    const refined = { duration_label: '1min', duration_estimate_seconds: 60, title: 't', speakers: script('x').speakers, lines: script('x').lines }
    const { deps: d } = deps({ data: refined })
    const out = await refineScript(script('story'), 'topic', '1min', 'b', 'en', d)
    expect(new Set(out.lines.map(l => l.speaker))).toEqual(new Set(['B']))
    expect(applySpeakerMode(refined, 'both')).toBe(refined)
  })
})

describe('designThumbnails', () => {
  it('keeps 3 variants and repairs bad colours', async () => {
    const v = (layout: string) => ({ layout, headline: 'Sleep wins', kicker: 'EP 1', background: 'red', accent: '#ff0000', text: '#ffffff' })
    const { deps: d } = deps({ data: { variants: [v('bold-left'), v('centered'), v('split'), v('split')] } })
    const out = await designThumbnails('t', 'topic', d)
    expect(out).toHaveLength(3)
    expect(out[0]!.background).toBe('#0b0b0f')
    expect(out[0]!.accent).toBe('#ff0000')
  })
})

describe('writeSEO + chat', () => {
  it('passes the language through', async () => {
    const seo = { youtube: { title: 't', title_b: 't', description: 'd', tags: [], chapters: [], pinned_comment: 'p' }, instagram: { caption: 'c', hashtags: [] }, twitter_thread: [], linkedin: 'l', blog_post: 'b', newsletter: 'n', clip_timestamps: [] }
    const { provider, deps: d } = deps({ data: seo })
    await writeSEO([], 'topic', 'title', 'hi-en', d)
    expect(provider.calls[0]!.user).toContain('Hinglish')
  })
  it('streams chat', async () => {
    const { deps: d } = deps()
    let out = ''
    await chat([{ role: 'user', content: 'hi' }], t => { out += t }, d)
    expect(out).toBe('Hello there')
  })
})

describe('writePreview', () => {
  it('uses the preview task and trims lines', async () => {
    const { provider, deps: d } = deps({ data: { title: ' Idli ', lines: [{ speaker: 'A', text: ' Hi ' }, { speaker: 'B', text: '  ' }, { speaker: 'B', text: 'Hello' }] } })
    const { writePreview } = await import('../src')
    const out = await writePreview('Idli history', 'ta', d)
    expect(out).toEqual({ title: 'Idli', lines: [{ speaker: 'A', text: 'Hi' }, { speaker: 'B', text: 'Hello' }] })
    expect(provider.calls[0]!.user).toContain('Tamil')
  })
})
