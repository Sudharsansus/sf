import { decryptSecret, encryptSecret, isEncrypted } from '@isaii/security'

/** Encrypt OAuth tokens at rest when TOKEN_ENCRYPTION_KEY is configured; read both legacy plain and encrypted values. */
export function sealToken(token: string | null | undefined, key = process.env.TOKEN_ENCRYPTION_KEY): string | null {
  if (!token) return null
  return key ? encryptSecret(token, key) : token
}

export function openToken(stored: string | null | undefined, key = process.env.TOKEN_ENCRYPTION_KEY): string | null {
  if (!stored) return null
  if (!isEncrypted(stored)) return stored
  if (!key) throw new Error('TOKEN_ENCRYPTION_KEY is required to read encrypted tokens')
  return decryptSecret(stored, key)
}
