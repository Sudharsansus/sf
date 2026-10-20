import { pgTable, text, integer, uuid, jsonb, boolean, index } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './_columns'
import { users } from './identity'

export const projects = pgTable('projects', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, t => [index('projects_user_idx').on(t.userId)])

export const episodes = pgTable('episodes', {
  id: id(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  language: text('language').notNull().default('en'),
  topic: text('topic').notNull(),
  title: text('title').notNull().default(''),
  researchData: jsonb('research_data'),
  allScripts: jsonb('all_scripts'),
  evaluations: jsonb('evaluations'),
  selectedScript: jsonb('selected_script'),
  script: jsonb('script'),
  audioUrl: text('audio_url'),
  /** 16:9 MP4 rendered by worker-media (YouTube) */
  videoUrl: text('video_url'),
  /** 9:16 Shorts/Reels rendered by worker-media */
  shortUrls: jsonb('short_urls'),
  thumbnailUrls: jsonb('thumbnail_urls'),
  seoData: jsonb('seo_data'),
  duration: integer('duration').default(0),
  status: text('status').notNull().default('queued'),
  agentStep: text('agent_step').default(''),
  shareId: text('share_id').notNull().unique(),
  isPublic: boolean('is_public').notNull().default(false),
  youtubeVideoId: text('youtube_video_id'),
  youtubeUrl: text('youtube_url'),
  instagramPostId: text('instagram_post_id'),
  elevenLabsJobId: text('elevenlabs_job_id'),
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, t => [index('episodes_user_created_idx').on(t.userId, t.createdAt), index('episodes_status_idx').on(t.status)])
