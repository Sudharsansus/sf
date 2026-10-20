import { describe, expect, it } from 'vitest'
import { MemoryKV, withLock } from '../src'

describe('withLock', () => {
  it('excludes concurrent holders and releases afterwards', async () => {
    const kv = new MemoryKV()
    let inner: unknown = 'unset'
    const outer = await withLock(kv, 'job', 1000, async () => {
      inner = await withLock(kv, 'job', 1000, async () => 'second')
      return 'first'
    })
    expect(outer).toBe('first')
    expect(inner).toBeNull()
    expect(await withLock(kv, 'job', 1000, async () => 'again')).toBe('again')
  })
})
