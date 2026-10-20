import type { Database } from '../client'
import { payments } from '../schema'

export type NewPayment = typeof payments.$inferInsert

/** Insert a payment once. Returns false if this provider reference was already recorded. */
export async function recordPayment(db: Database, p: NewPayment): Promise<boolean> {
  const rows = await db.insert(payments).values(p).onConflictDoNothing({ target: payments.providerRef }).returning({ id: payments.id })
  return rows.length > 0
}
