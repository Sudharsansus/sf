import crypto from 'crypto'

// ── RESPONSE SANITIZERS ───────────────────────────────────────────────────────
export function sanitizeEpisode(ep: any) {
  if (!ep) return null
  const { userId, elevenLabsJobId, youtubeAccessToken, instagramAccessToken, idempotencyKey, ...safe } = ep
  return safe
}

export function sanitizeUser(u: any) {
  if (!u) return null
  const { youtubeAccessToken, youtubeRefreshToken, instagramAccessToken, ...safe } = u
  return safe
}

// ── HMAC (timing-safe) ────────────────────────────────────────────────────────
export function verifyHMAC(payload: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    const a = Buffer.from(signature.replace(/^sha256=/, ''))
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch { return false }
}

// ── INPUT SANITIZE ────────────────────────────────────────────────────────────
export function sanitizeInput(s: string, maxLen = 200): string {
  return String(s).trim().slice(0, maxLen).replace(/<[^>]*>/g, '')
}

// ── RBAC ─────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin' | 'moderator' | 'support'

export function hasRole(user: { role?: string }, required: UserRole): boolean {
  if (!user?.role) return false
  const hierarchy: UserRole[] = ['user', 'support', 'moderator', 'admin']
  return hierarchy.indexOf(user.role as UserRole) >= hierarchy.indexOf(required)
}

export function isAdmin(user: { role?: string }): boolean {
  return user?.role === 'admin'
}

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
export async function auditLog(params: {
  userId?: string
  action: string
  resource?: string
  metadata?: Record<string, any>
  ipAddress?: string
}) {
  try {
    const { db, auditLogs } = await import('./db')
    await db.insert(auditLogs).values({
      userId:    params.userId || null,
      action:    params.action,
      resource:  params.resource || null,
      metadata:  params.metadata || null,
      ipAddress: params.ipAddress || null
    })
  } catch { /* audit failure must never break main flow */ }
}
