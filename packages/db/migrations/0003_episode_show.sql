ALTER TABLE "episodes" ADD COLUMN IF NOT EXISTS "show_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "episodes" ADD CONSTRAINT "episodes_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "episodes_show_idx" ON "episodes" ("show_id");
