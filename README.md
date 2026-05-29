# Sus — AI Creator Production Studio

> Produce studio-grade scripted content in minutes. Human-in-the-loop. Creator-controlled.

**v6 — Final production architecture**

---

## What it is

Sus compresses weeks of research, scripting, and production into a single workflow. You review, edit, and publish on your own schedule. No auto-posting. No spam. Full creator control.

**Category:** AI-assisted creator production operating system.

---

## Architecture

```
User submits topic
    ↓
/api/generate
    ├── Research    (Groq — fast + cheap)
    ├── Scripts ×5  (Claude — quality)
    └── Evaluate    (GPT-4o-mini — scoring)
    ↓
Human picks script + duration
    ↓
/api/agents/refine → Isolated workers run in parallel:
    ├── AI Worker     (Claude refinement)
    ├── Audio Worker  (ElevenLabs)
    ├── Thumb Worker  (Replicate)
    └── SEO Worker    (Groq)
    ↓
Episode complete — user publishes when ready
```

### AI Gateway (`lib/ai/gateway.ts`)
- Semantic cache — research/SEO/evaluate cached by prompt hash
- Adaptive routing — deprioritises slow/failing providers dynamically
- Circuit breakers — 3 failures → open 60s → half-open
- Per-provider timeouts — Claude 55s | OpenAI 30s | Groq 15s
- Persistent cost logging — survives cold starts

### Workers (`lib/workers/`)
- `ai.worker.ts` — research, scripts, evaluate, refine
- `audio.worker.ts` — ElevenLabs rendering
- `thumb.worker.ts` — Replicate image generation
- `seo.worker.ts` — distribution copy generation
- `upload.worker.ts` — R2 storage

### Events (`lib/events/`)
- Every workflow state change emits a typed event
- Events persisted to `workflow_runs` table
- Enables observability, replay, analytics

### Queue (`lib/queue/trigger.ts`)
- Trigger.dev auto-activates when `TRIGGER_API_KEY` is set
- Falls back to inline execution without it
- Zero code changes needed to activate

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
git init && git add . && git commit -m "Sus v6"
git remote add origin https://github.com/Sudharsansus/sf
git push -u origin main --force
```

1. **Neon** — SQL Editor → paste `db/schema.sql` → Run
2. **Upstash** — New Redis → copy URL + Token
3. **Cloudflare R2** — bucket `sus-audio` → enable public access
4. **Vercel** — import repo → add env vars → deploy

### Minimum env vars
```
ANTHROPIC_API_KEY
DATABASE_URL
REDIS_URL + REDIS_TOKEN
NEXTAUTH_URL + NEXTAUTH_SECRET
GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

### Activate more power
```
OPENAI_API_KEY        → fallback + evaluate (20× cheaper)
GROQ_API_KEY          → research + SEO (50× cheaper)
ELEVENLABS_API_KEY    → voice rendering
REPLICATE_API_TOKEN   → thumbnail generation
TRIGGER_API_KEY       → real background workers
SENTRY_DSN            → error tracking
POSTHOG_KEY           → product analytics
```

---

## Positioning

**DO NOT say:** AI content generator, auto-publisher, AI creator suite

**DO say:** AI-assisted creator production operating system

**Why:** Investors distrust auto-spam tooling. Creators want control. Platforms flag automation. Human-in-the-loop is the competitive moat.

---

## Scale capacity

| Phase | Capacity | Unlock |
|---|---|---|
| v6 now | 500–1500 paying creators | Current |
| + full Trigger.dev | 10k–50k creators | Add TRIGGER_API_KEY |
| + Railway workers | 50k–200k creators | Deploy workers separately |
