# Runbook: deploy

1. Merge to `dev` → CI (typecheck, lint, test, build) + Vercel preview.
2. Apply DB migrations (see database.md) **before** promoting code that needs them.
3. Merge `dev` → `main` → Vercel production (Root Directory `apps/web`).
4. Inngest: the Vercel integration syncs `/api/inngest` on deploy. Check the dashboard shows the new functions.
5. Workers (when used): build `infra/docker/node.Dockerfile` with `APP=api|worker-ai|worker-media` and deploy to your container host; register their `/api/inngest` URLs in Inngest.
6. Smoke test: `/api/health`, landing page, sign-in, a 1-minute generation in a test account.
