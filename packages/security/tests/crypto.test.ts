import { describe, expect, it } from 'vitest'
import { randomBytes } from 'node:crypto'
import { decryptSecret, encryptSecret, isEncrypted } from '../src'

const key = randomBytes(32).toString('hex')

describe('aes-gcm secrets', () => {
  it('round-trips and uses a fresh IV each time', () => {
    const a = encryptSecret('ya29.refresh-token', key)
    const b = encryptSecret('ya29.refresh-token', key)
    expect(a).not.toBe(b)
    expect(isEncrypted(a)).toBe(true)
    expect(decryptSecret(a, key)).toBe('ya29.refresh-token')
  })
  it('detects tampering and wrong keys', () => {
    const sealed = encryptSecret('token', key)
    const parts = sealed.split('.')
    parts[3] = Buffer.from('evil').toString('base64url')
    expect(() => decryptSecret(parts.join('.'), key)).toThrow()
    expect(() => decryptSecret(sealed, randomBytes(32).toString('hex'))).toThrow()
  })
  it('rejects short keys', () => {
    expect(() => encryptSecret('x', 'abcd')).toThrow(/32 bytes/)
  })
})
