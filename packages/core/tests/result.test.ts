import { describe, expect, it } from 'vitest'
import { err, ok, tryAsync, unwrap } from '../src'

describe('Result', () => {
  it('wraps values and errors', async () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 })
    expect(err('x')).toEqual({ ok: false, error: 'x' })
    expect(await tryAsync(async () => 2)).toEqual({ ok: true, value: 2 })
    const r = await tryAsync(async () => { throw new Error('boom') })
    expect(r.ok).toBe(false)
  })
  it('unwrap throws on error', () => {
    expect(unwrap(ok(3))).toBe(3)
    expect(() => unwrap(err(new Error('no')))).toThrow('no')
  })
})
