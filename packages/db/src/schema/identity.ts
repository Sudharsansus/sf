import { pgTable, text, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './_columns'

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  credits: integer('credits').notNull().default(10),
  plan: text('plan').notNull().default('free'),
  /** OAuth tokens — stored encrypted (v1.<iv>.<tag>.<data>) once TOKEN_ENCRYPTION_KEY is set */
  youtubeAccessToken: text('youtube_access_token'),
  youtubeRefreshToken: text('youtube_refresh_token'),
  youtubeChannelId: text('youtube_channel_id'),
  instagramAccessToken: text('instagram_access_token'),
  instagramUserId: text('instagram_user_id'),
  role: text('role').notNull().default('user'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

/** Public API keys (hashed). Prefix is shown to the user to identify a key. */
export const apiKeys = pgTable('api_keys', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  prefix: text('prefix').notNull(),
  hash: text('hash').notNull().unique(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: createdAt(),
}, t => [index('api_keys_user_idx').on(t.userId)])
