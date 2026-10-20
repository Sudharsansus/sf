import { describe, expect, it, vi } from 'vitest'
import { sendEvent } from '../src'

describe('sendEvent', () => {
  it('validates and applies defaults before sending', async () => {
    const sender = vi.fn().mockResolvedValue({ ids: ['1'] })
    await sendEvent('episode/generate.requested', { episodeId: 'e', userId: 'u', topic: 'Sleep', duration: '5min', credits: 5 } as never, sender)
    expect(sender).toHaveBeenCalledWith({ name: 'episode/generate.requested', data: expect.objectContaining({ language: 'en', credits: 5 }) })
  })
  it('rejects invalid payloads without sending', async () => {
    const sender = vi.fn()
    await expect(sendEvent('episode/generate.requested', { episodeId: 'e' } as never, sender)).rejects.toThrow()
    expect(sender).not.toHaveBeenCalled()
  })
})
