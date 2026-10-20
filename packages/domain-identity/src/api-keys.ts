import { createHash, randomBytes } from 'node:crypto'
import { and, eq, isNull } from 'drizzle-orm'
import { apiKeys, type Database } from '@isaii/db'

const hash = (key: string) => createHash('sha256').update(key).digest('hex')

/** Create an API key. The plain key is returned once and never stored. */
export async function createApiKey(db: Database, userId: string, name: string): Promise<{ key: string; prefix: string }> {
  const key = `isaii_${randomBytes(24).toString('base64url')}`
  const prefix = key.slice(0, 12)
  await db.insert(apiKeys).values({ userId, name, prefix, hash: hash(key) })
  return { key, prefix }
}

/** Resolve a presented key to its owner, or null if unknown/revoked. */
export async function verifyApiKey(db: Database, key: string): Promise<{ userId: string } | null> {
  if (!key.startsWith('isaii_')) return null
  const [row] = await db.select({ id: apiKeys.id, userId: apiKeys.userId }).from(apiKeys).where(and(eq(apiKeys.hash, hash(key)), isNull(apiKeys.revokedAt))).limit(1)
  if (!row) return null
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id))
  return { userId: row.userId }
}

export async function revokeApiKey(db: Database, userId: string, prefix: string) {
  await db.update(apiKeys).set({ revokedAt: new Date() }).where(and(eq(apiKeys.userId, userId), eq(apiKeys.prefix, prefix)))
}
