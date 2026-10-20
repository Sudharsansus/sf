# 0001. Turborepo monorepo with layered packages

Status: Accepted · Date: 2026-10-21

## Context
All business logic lived in one Next.js `lib/` folder.

## Decision
Split into apps (deployables) and `@isaii/*` packages in strict layers, enforced by ESLint boundaries. Packages ship TypeScript source (no build step); apps compile them.

## Consequences
Clear ownership and reuse across web, API and workers; workers run without Next.js. Cost: more package.json files; mitigated by `npm run new:package`.
