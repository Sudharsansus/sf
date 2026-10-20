ALTER TABLE "episodes" ADD COLUMN IF NOT EXISTS "video_url" text;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN IF NOT EXISTS "short_urls" jsonb;