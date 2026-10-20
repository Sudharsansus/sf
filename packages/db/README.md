# @isaii/db

Drizzle schema (split by domain in `src/schema/`), repositories, migrations and test helpers.

- `npm run db:generate -w @isaii/db` — create a migration after editing the schema
- `npm run db:migrate -w @isaii/db` — apply migrations to `DATABASE_URL`
- `createTestDb()` from `@isaii/db/testing` — in-memory Postgres (PGlite) with all migrations applied

## Adopting migrations on the existing production database
Production was created from `legacy/schema.sql`, which matches `migrations/0000_baseline.sql`.
1. Check for orphan rows (new foreign keys would fail):
   `select count(*) from episodes e left join users u on u.id = e.user_id where u.id is null;` (same for `credits_ledger`)
2. Mark the baseline as applied — insert its hash into `drizzle.__drizzle_migrations` (see docs/runbooks/database.md).
3. `npm run db:migrate -w @isaii/db` applies `0001_platform_v2.sql`, which is idempotent (IF NOT EXISTS).
