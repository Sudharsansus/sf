import { describe, expect, it } from 'vitest'
import { AppError, ErrorCode, toHttpError } from '../src'

describe('toHttpError', () => {
  it('exposes AppError messages with the mapped status', () => {
    const r = toHttpError(new AppError(ErrorCode.PAYMENT_REQUIRED, 'Not enough credits'))
    expect(r).toEqual({ status: 402, body: { error: 'Not enough credits', code: 'PAYMENT_REQUIRED', details: undefined } })
  })
  it('hides unknown errors', () => {
    const r = toHttpError(new Error('db password is hunter2'))
    expect(r.status).toBe(500)
    expect(r.body.error).not.toContain('hunter2')
  })
  it('hides non-exposed AppErrors', () => {
    expect(toHttpError(new AppError(ErrorCode.UPSTREAM, 'secret detail', { expose: false })).status).toBe(500)
  })
})
