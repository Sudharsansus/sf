import { AppError, ErrorCode } from '@isaii/core'
import { addCredits, deductCredits, recordLedger, type Database } from '@isaii/db'

/** Deduct credits atomically and log it. Throws PAYMENT_REQUIRED when the balance is too low. */
export async function chargeCredits(db: Database, userId: string, amount: number, reason: string): Promise<number> {
  const left = await deductCredits(db, userId, amount)
  if (left === null) throw new AppError(ErrorCode.PAYMENT_REQUIRED, `Not enough credits. This needs ${amount}.`, { details: { upgrade: true, required: amount } })
  await recordLedger(db, { userId, amount: -amount, reason })
  return left
}

/** Give credits back (failed generation, failed upload). */
export async function refundCredits(db: Database, userId: string, amount: number, reason: string): Promise<void> {
  await addCredits(db, userId, amount)
  await recordLedger(db, { userId, amount, reason: `refund:${reason}` })
}

/** Run `work` after charging; refund automatically if it throws. */
export async function withCharge<T>(db: Database, userId: string, amount: number, reason: string, work: () => Promise<T>): Promise<T> {
  await chargeCredits(db, userId, amount, reason)
  try {
    return await work()
  } catch (e) {
    await refundCredits(db, userId, amount, reason)
    throw e
  }
}
