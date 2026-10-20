import { pgTable, text, uuid, jsonb, index } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './_columns'
import { users } from './identity'

/** A recurring show: saved hosts, language, intro/outro and music bed reused every episode. */
export const shows = pgTable('shows', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  language: text('language').notNull().default('en'),
  hosts: jsonb('hosts').notNull().default([]),
  style: jsonb('style').notNull().default({}),
  rssSlug: text('rss_slug').unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, t => [index('shows_user_idx').on(t.userId)])
