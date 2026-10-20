# Runbook: AI provider outage or cost spike

## Claude/ElevenLabs errors
- Inngest retries each step (2–3 times, backoff). Permanent generation failures refund credits automatically.
- Check status pages; failures show in `ai_request_log` (`success = false`) and logs (`ai` lines).
- Switch model without a deploy: `CLAUDE_MODEL=claude-sonnet-5-5` (all tasks) or `AI_MODEL_SCRIPTS=…` (one task).

## Spend spike
- `select task_type, sum(cost_usd) from ai_request_log where created_at > now() - interval '1 day' group by 1;`
- Lower the daily cap: `AI_DAILY_BUDGET_USD` (new generations return "busy" once reached).
- Lower effort for a task: `AI_EFFORT_SCRIPTS=medium`.
