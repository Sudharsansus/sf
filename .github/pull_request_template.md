## What & why

## How it was tested
- [ ] `npm run typecheck && npm run lint && npm test`
- [ ] UI checked in the browser (if UI changed)
- [ ] Evals run (if prompts or agents changed): `npm run eval -- …`

## Risk
- [ ] Database migration (applied to a Neon branch first)
- [ ] Touches payments, auth or security
- [ ] New env vars (added to `.env.example` and `@isaii/env`)
