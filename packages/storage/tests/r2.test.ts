import { describe, expect, it, vi } from 'vitest'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { R2Store, r2FromEnv } from '../src'

const cfg = { accountId: 'acc', accessKeyId: 'id', secretAccessKey: 'secret', bucket: 'isaii', publicUrl: 'https://cdn.isaii.si/' }

describe('R2Store', () => {
  it('puts objects with immutable caching and returns the public URL', async () => {
    const send = vi.fn().mockResolvedValue({})
    const store = new R2Store(cfg, { send } as never)
    const url = await store.put('episodes/e1.mp3', new Uint8Array([1]), { contentType: 'audio/mpeg' })
    expect(url).toBe('https://cdn.isaii.si/episodes/e1.mp3')
    const cmd = send.mock.calls[0]![0] as PutObjectCommand
    expect(cmd).toBeInstanceOf(PutObjectCommand)
    expect(cmd.input).toMatchObject({ Bucket: 'isaii', Key: 'episodes/e1.mp3', ContentType: 'audio/mpeg' })
    expect(cmd.input.CacheControl).toContain('immutable')
  })
  it('returns null for missing keys', async () => {
    const send = vi.fn().mockRejectedValue(Object.assign(new Error('missing'), { name: 'NoSuchKey' }))
    expect(await new R2Store(cfg, { send } as never).get('nope')).toBeNull()
    expect(send.mock.calls[0]![0]).toBeInstanceOf(GetObjectCommand)
  })
  it('rethrows other errors', async () => {
    const send = vi.fn().mockRejectedValue(new Error('network'))
    await expect(new R2Store(cfg, { send } as never).get('x')).rejects.toThrow('network')
  })
  it('names the missing env var', () => {
    expect(() => r2FromEnv({})).toThrow('R2_ACCOUNT_ID is not set')
  })
})
