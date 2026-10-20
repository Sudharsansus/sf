import { describe, expect, it } from 'vitest'
import { MemoryKV } from '../src'

describe('MemoryKV', () => {
  it('honours nx and expiry', async () => {
    let t = 0
    const kv = new MemoryKV(() => t)
    expect(await kv.set('a', '1', { nx: true, ex: 10 })).toBe('OK')
    expect(await kv.set('a', '2', { nx: true })).toBeNull()
    t = 10_001
    expect(await kv.get('a')).toBeNull()
    expect(await kv.set('a', '3', { nx: true })).toBe('OK')
  })
  it('increments floats', async () => {
    const kv = new MemoryKV()
    await kv.incrbyfloat('c', 0.25)
    expect(await kv.incrbyfloat('c', 0.5)).toBe(0.75)
  })
})
