import { describe, expect, it } from 'vitest'
import { MemoryKV, once } from '../src'

describe('once', () => {
  it('runs the first time and reports duplicates after', async () => {
    const kv = new MemoryKV()
    let n = 0
    const run = () => once(kv, 'k', 60, async () => ++n)
    expect(await run()).toEqual({ status: 'run', value: 1 })
    expect(await run()).toEqual({ status: 'duplicate' })
    expect(n).toBe(1)
  })
  it('releases the claim when the work fails so a retry can succeed', async () => {
    const kv = new MemoryKV()
    await expect(once(kv, 'k', 60, async () => { throw new Error('db down') })).rejects.toThrow('db down')
    expect(await once(kv, 'k', 60, async () => 'ok')).toEqual({ status: 'run', value: 'ok' })
  })
})
