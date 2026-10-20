import { desc, eq } from 'drizzle-orm'
import type { Database } from '../client'
import { creditsLedger } from '../schema'

export async function recordLedger(db: Database, entry: { userId: string; amount: number; reason: string }) {
  await db.insert(creditsLedger).values(entry)
}

export async function ledgerFor(db: Database, userId: string, limit = 50) {
  return db.select().from(creditsLedger).where(eq(creditsLedger.userId, userId)).orderBy(desc(creditsLedger.createdAt)).limit(limit)
}
