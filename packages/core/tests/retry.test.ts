import { describe, expect, it, vi } from 'vitest'
import { retry } from '../src'

const sleep = () => Promise.resolve()

describe('retry', () => {
  it('retries until success', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('a')).mockResolvedValue('ok')
    await expect(retry(fn, { sleep })).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('gives up after the last attempt', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('nope'))
    await expect(retry(fn, { attempts: 3, sleep })).rejects.toThrow('nope')
    expect(fn).toHaveBeenCalledTimes(3)
  })
  it('stops when shouldRetry says no', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fatal'))
    await expect(retry(fn, { sleep, shouldRetry: () => false })).rejects.toThrow('fatal')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
