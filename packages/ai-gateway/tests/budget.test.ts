import { describe, expect, it } from 'vitest'
import { MemoryKV } from '@isaii/cache'
import { SpendGuard } from '../src'

describe('SpendGuard', () => {
  it('blocks once daily or hourly limits are reached', async () => {
    const kv = new MemoryKV()
    const guard = new SpendGuard(kv, { dailyLimitUsd: 1, now: () => new Date('2026-10-21T10:00:00Z') })
    expect(await guard.globalOk()).toBe(true)
    await guard.track(0.6, 'u1')
    expect(await guard.userOk('u1', 0.5)).toBe(false)
    expect(await guard.userOk('u2', 0.5)).toBe(true)
    await guard.track(0.5)
    expect(await guard.globalOk()).toBe(false)
  })
})
