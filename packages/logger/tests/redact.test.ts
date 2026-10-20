import { describe, expect, it } from 'vitest'
import { redact } from '../src'

describe('redact', () => {
  it('masks secret-looking keys at any depth', () => {
    expect(redact({ apiKey: 'abc', nested: { password: 'p', ok: 1 }, list: [{ token: 't' }] }))
      .toEqual({ apiKey: '[redacted]', nested: { password: '[redacted]', ok: 1 }, list: [{ token: '[redacted]' }] })
  })
  it('masks emails, bearer tokens and key-shaped strings inside text', () => {
    const out = redact('user priya@example.com sent Bearer abc.def and sk-ant-1234567890abcdef') as string
    expect(out).toContain('p***@example.com')
    expect(out).toContain('Bearer [redacted]')
    expect(out).not.toContain('sk-ant-1234567890abcdef')
  })
  it('serialises errors safely', () => {
    expect(redact(new Error('bad token Bearer xyz'))).toEqual({ name: 'Error', message: 'bad token Bearer [redacted]' })
  })
})
