const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * Reject cross-origin state-changing requests. Webhooks and auth callbacks are exempt
 * because they are verified by signature / OAuth state instead.
 */
export function isCrossOriginBlocked(opts: {
  method: string; pathname: string; origin: string | null; allowedOrigins: string[]; exemptPrefixes?: string[]
}): boolean {
  const { method, pathname, origin, allowedOrigins, exemptPrefixes = ['/api/auth', '/api/webhooks', '/api/inngest'] } = opts
  if (!origin || !MUTATING.has(method.toUpperCase())) return false
  if (!pathname.startsWith('/api/') || exemptPrefixes.some(p => pathname.startsWith(p))) return false
  return !allowedOrigins.filter(Boolean).some(o => origin === o.replace(/\/$/, ''))
}
