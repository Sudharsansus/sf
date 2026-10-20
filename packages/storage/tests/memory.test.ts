import { describe, expect, it } from 'vitest'
import { MemoryStore, storageKeys } from '../src'

describe('MemoryStore', () => {
  it('stores, reads, deletes and builds URLs', async () => {
    const s = new MemoryStore('https://cdn.test')
    const key = storageKeys.thumbnail('ep1', 0)
    expect(await s.put(key, new Uint8Array([1, 2]), { contentType: 'image/png' })).toBe('https://cdn.test/thumbnails/ep1_0.png')
    expect(await s.get(key)).toEqual(new Uint8Array([1, 2]))
    await s.delete(key)
    expect(await s.get(key)).toBeNull()
  })
})

describe('storageKeys', () => {
  it('normalises upload extensions', () => {
    expect(storageKeys.upload('u', 'e', '.mp3')).toBe('uploads/u/e.mp3')
  })
})
