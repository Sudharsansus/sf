import { randomBytes } from 'node:crypto'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/** Prefixed, URL-safe random id, e.g. `ep_k3j9…`. */
export function newId(prefix: string, length = 20): string {
  const bytes = randomBytes(length)
  let out = ''
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length]
  return `${prefix}_${out}`
}
