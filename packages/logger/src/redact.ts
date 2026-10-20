const SECRET_KEY = /pass(word)?|secret|token|api[-_]?key|authorization|cookie|signature|credential/i
const EMAIL = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g
const BEARER = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi
const LONG_SECRET = /\b(sk|pk|rk|whsec|xi)[-_][A-Za-z0-9_-]{12,}\b/g

/** Mask values under secret-looking keys, emails, bearer tokens and API-key-shaped strings. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[depth]'
  if (typeof value === 'string') {
    return value.replace(BEARER, '$1 [redacted]').replace(LONG_SECRET, '[redacted]').replace(EMAIL, '$1***@$2')
  }
  if (Array.isArray(value)) return value.map(v => redact(v, depth + 1))
  if (value && typeof value === 'object') {
    if (value instanceof Error) return { name: value.name, message: redact(value.message, depth + 1) }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = SECRET_KEY.test(k) ? '[redacted]' : redact(v, depth + 1)
    return out
  }
  return value
}
