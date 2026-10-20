# Runbook: database migrations

## First adoption on production (one time)
Production was created from `packages/db/legacy/schema.sql` (= `0000_baseline`).

1. Back up: Neon → Branches → create a branch from production (instant, copy-on-write).
2. Check for rows the new foreign keys would reject:
   ```sql
   select count(*) from episodes e left join users u on u.id = e.user_id where u.id is null;
   select count(*) from credits_ledger l left join users u on u.id = l.user_id where u.id is null;
   ```
   Fix or delete orphans before continuing.
3. Mark the baseline as applied (drizzle stores hashes in `drizzle.__drizzle_migrations`):
   ```bash
   npm run db:migrate -w @isaii/db   # against the NEW branch first
   ```
   If it fails on `0000` because tables exist, insert the baseline row manually:
   ```sql
   create schema if not exists drizzle;
   create table if not exists drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint);
   insert into drizzle.__drizzle_migrations (hash, created_at) values ('<sha256 of 0000_baseline.sql>', <journal "when">);
   ```
   (`sha256sum packages/db/migrations/0000_baseline.sql`; `when` is in `migrations/meta/_journal.json`.)
4. Re-run `npm run db:migrate` — `0001` and `0002` are idempotent (`IF NOT EXISTS`).
5. **Deploy code only after migrations succeed** — the app reads `episodes.language`, `video_url`, `short_urls`.

## Routine changes
1. Edit `packages/db/src/schema/*`.
2. `npm run db:generate -w @isaii/db -- --name <change>`; review the SQL; prefer additive changes.
3. Test: `npm test -w @isaii/db` (applies all migrations to PGlite).
4. Apply to a Neon branch, then production, before deploying dependent code.
