# Runbook: Inngest backlog / stuck episodes

- Inngest dashboard → Functions → `episode-generate` / `episode-produce` → runs. Failed runs show the failing step and error.
- Stuck "producing" episodes: the workflow lock expires after 30 minutes; the creator can press Produce again.
- Re-run a failed production from the Inngest dashboard (steps already completed are skipped).
- Scale: move AI functions to `apps/worker-ai` and media to `apps/worker-media` (Docker images in `infra/docker`), and stop serving them from web by removing them from `apps/web/app/api/inngest/route.ts`.
