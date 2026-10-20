import { pgTable, integer, uuid, timestamp } from 'drizzle-orm/pg-core'
import { id } from './_columns'

export const analytics = pgTable('analytics', {
  id: id(),
  episodeId: uuid('episode_id').notNull(),
  userId: uuid('user_id').notNull(),
  youtubeViews: integer('youtube_views').default(0),
  youtubeLikes: integer('youtube_likes').default(0),
  youtubeComments: integer('youtube_comments').default(0),
  youtubeWatchTimeMinutes: integer('youtube_watch_time_minutes').default(0),
  instagramReach: integer('instagram_reach').default(0),
  instagramLikes: integer('instagram_likes').default(0),
  instagramShares: integer('instagram_shares').default(0),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
})
