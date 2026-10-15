# ISAII — AI Creator Production Studio

Live at [isaii.si](https://isaii.si)

Live at [isaii.si](https://isaii.si)

> Produce studio-grade scripted content in minutes. Human-in-the-loop. Creator-controlled.

**v6 — Final production architecture**

---

## Repo structure (Turborepo)

```
apps/
  web/              Next.js 14 app (@sus/web) — pages, API routes, components, hooks, lib
packages/
  db/               @sus/db — Drizzle schema + client, schema.sql, admin script
  tsconfig/         @sus/tsconfig — shared TS configs (base, nextjs)
turbo.json          task pipeline (dev, build, lint, typecheck)
```

```bash
npm install                 # installs all workspaces
cp .env.example apps/web/.env.local
npm run dev                 # turbo run dev
npm run build               # turbo run build
npm run typecheck
```

Branches: `main` = production (Vercel), `dev` = integration. Feature branches -> `dev` -> `main`.

**Vercel:** set Root Directory to `apps/web` (framework: Next.js). Vercel auto-detects Turborepo.

---

## What it is

ISAII compresses weeks of research, scripting, and production into a single workflow. You review, edit, and publish on your own schedule. No auto-posting. No spam. Full creator control.

**Category:** AI-assisted creator production operating system.

---

## Architecture

**Stack:** Next.js 14 on Vercel · Claude (all text AI) · ElevenLabs (voices + transcription) · Inngest (background jobs) · Neon Postgres + Drizzle · Upstash Redis · Cloudflare R2 · Dodo Payments

```
POST /api/generate            deduct credits, create episode, queue job → 202
  └─ Inngest: episode-generate
       research (Claude) → 5 scripts (Claude) → scores (Claude)
       status = awaiting_selection        (onFailure → credits refunded)

Creator picks an angle + length in the studio

POST /api/agents/refine       lock, queue job → 202
  └─ Inngest: episode-produce
       refine (Claude)
       ├─ voices: ElevenLabs, 12 lines per step → R2 parts → merged MP3
       ├─ thumbnails: Claude designs 3 → rendered with next/og → R2
       └─ SEO pack: Claude
       status = complete | partial_failure

Client polls GET /api/jobs?episodeId=… for real progress.
```

- `apps/web/lib/ai/claude.ts` — one Claude client: structured JSON outputs (Zod), cached system prompts, per-task effort, usage + cost logged to `ai_request_log`
- `apps/web/lib/claude.ts` — the agents (research, scripts, evaluate, refine, SEO)
- `apps/web/lib/elevenlabs.ts` — text-to-speech and Scribe speech-to-text with speaker detection
- `apps/web/lib/thumbnails.tsx` — Claude-designed, code-rendered thumbnails
- `apps/web/lib/inngest/` — the two pipeline functions, served at `/api/inngest`

---

## Security

| Control | Implementation |
|---|---|
| Security headers | CSP, HSTS, X-Frame-Options, X-Content-Type, Referrer-Policy |
| All keys | Server-side only — never in client bundle |
| Rate limits | generate 5/hr, refine 3/hr, chat 60/min per user. Cost cap $2/hr |
| Abuse detection | Prompt injection, velocity abuse, flagged user check |
| SQL | Drizzle ORM only |
| Auth | NextAuth middleware on all protected routes |
| RBAC | user / support / moderator / admin |
| Audit logs | Every credit event, admin action logged |
| Webhooks | HMAC SHA-256 timing-safe |

---

## Deploy (5 minutes)

```bash
git init && git add . && git commit -m "ISAII v6"
git remote add origin https://github.com/Sudharsansus/sf
git push -u origin main --force
```

1. **Neon** — SQL Editor → paste `packages/db/schema.sql` → Run
2. **Upstash** — New Redis → copy URL + Token
3. **Cloudflare R2** — bucket `sus-audio` → enable public access
4. **Inngest** — install the Inngest integration on the Vercel project (adds the keys, syncs `/api/inngest`)
5. **Vercel** — Root Directory `apps/web` → add env vars → deploy

### Env vars
See `.env.example`. Required: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `DATABASE_URL`, `REDIS_URL` + `REDIS_TOKEN`, `NEXTAUTH_URL` + `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`, the `R2_*` vars, and `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` (added by the Inngest Vercel integration).

Local dev: run `npx inngest-cli@latest dev` next to `npm run dev` so queued jobs execute.

---

## Positioning

**DO NOT say:** AI content generator, auto-publisher, AI creator suite

**DO say:** AI-assisted creator production operating system

**Why:** Investors distrust auto-spam tooling. Creators want control. Platforms flag automation. Human-in-the-loop is the competitive moat.

---

## Scale capacity

| Phase | Capacity | Unlock |
|---|---|---|
| Now (Inngest + Vercel) | 10k+ creators | Current — tune Inngest concurrency per plan |
| Dedicated workers | 50k+ creators | Move Inngest functions to a long-running worker |
