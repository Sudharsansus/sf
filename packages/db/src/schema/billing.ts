import { pgTable, text, integer, uuid, index, jsonb } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './_columns'
import { users } from './identity'

export const creditsLedger = pgTable('credits_ledger', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  createdAt: createdAt(),
}, t => [index('credits_ledger_user_idx').on(t.userId, t.createdAt)])

/** One row per provider payment — history for the admin console and refunds. */
export const payments = pgTable('payments', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  providerRef: text('provider_ref').notNull().unique(),
  productId: text('product_id').notNull(),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').notNull(),
  credits: integer('credits').notNull(),
  status: text('status').notNull().default('succeeded'),
  raw: jsonb('raw'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, t => [index('payments_user_idx').on(t.userId, t.createdAt)])
