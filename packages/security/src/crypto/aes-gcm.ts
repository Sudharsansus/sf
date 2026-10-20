import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const VERSION = 'v1'

function key(hexKey: string) {
  const k = Buffer.from(hexKey, 'hex')
  if (k.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)')
  return k
}

/** Encrypt a secret (e.g. an OAuth refresh token) for storage: `v1.<iv>.<tag>.<ciphertext>` base64url. */
export function encryptSecret(plain: string, hexKey: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(hexKey), iv)
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return [VERSION, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), body.toString('base64url')].join('.')
}

export function decryptSecret(sealed: string, hexKey: string): string {
  const [v, iv, tag, body] = sealed.split('.')
  if (v !== VERSION || !iv || !tag || !body) throw new Error('Unrecognised secret format')
  const decipher = createDecipheriv('aes-256-gcm', key(hexKey), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8')
}

export const isEncrypted = (value: string) => value.startsWith(`${VERSION}.`)
