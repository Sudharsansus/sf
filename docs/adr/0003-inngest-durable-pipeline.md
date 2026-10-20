# 0003. Inngest for the episode pipeline

Status: Accepted · Date: 2026-10-21

## Context
Generation ran inside one HTTP request and timed out on long episodes.

## Decision
Model generation and production as Inngest functions with one step per unit of paid work; hosts are web (Vercel), worker-ai and worker-media.

## Consequences
Retries without double-charging, no request timeouts, real progress for the UI. Requires the Inngest integration and signing keys in production.
