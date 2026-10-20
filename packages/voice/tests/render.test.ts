import { describe, expect, it, vi } from 'vitest'
import { ElevenLabsTTS, renderLines, type TTSProvider } from '../src'

describe('renderLines', () => {
  it('keeps order, uses each speaker voice, limits concurrency and passes neighbours', async () => {
    let active = 0, peak = 0
    const calls: { text: string; voiceId: string; previous?: string }[] = []
    const tts: TTSProvider = {
      name: 'fake', modelFor: () => 'm',
      synthesize: async req => {
        calls.push(req); active++; peak = Math.max(peak, active)
        await new Promise(r => setTimeout(r, 5)); active--
        return new Uint8Array([req.text.length])
      },
    }
    const lines = Array.from({ length: 10 }, (_, i) => ({ speaker: i % 2 ? 'B' : 'A', text: 'x'.repeat(i + 1) }))
    const audio = await renderLines(tts, { lines, offset: 2, count: 6, voices: { A: 'va', B: 'vb' }, language: 'kn', concurrency: 2 })
    expect([...audio]).toEqual([3, 4, 5, 6, 7, 8])
    expect(peak).toBeLessThanOrEqual(2)
    expect(calls.find(c => c.text === 'xxx')).toMatchObject({ voiceId: 'va', previous: 'xx' })
    expect(calls.find(c => c.text === 'xxxx')!.voiceId).toBe('vb')
  })
})

describe('ElevenLabsTTS', () => {
  it('omits context for v3 languages and reports API errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2]), { status: 200 }))
    const tts = new ElevenLabsTTS('key', fetchImpl as never)
    await tts.synthesize({ text: 'ನಮಸ್ಕಾರ', voiceId: 'v', language: 'kn', previous: 'p' })
    const body = JSON.parse(fetchImpl.mock.calls[0]![1].body)
    expect(body.model_id).toBe('eleven_v3')
    expect(body.previous_text).toBeUndefined()
    fetchImpl.mockResolvedValueOnce(new Response('quota', { status: 429 }))
    await expect(tts.synthesize({ text: 'x', voiceId: 'v', language: 'en' })).rejects.toThrow('429')
  })
})
