# Security

## Reporting
Email **security@isaii.si** with details and steps to reproduce. Please don't open public issues for vulnerabilities.
We aim to acknowledge within 2 working days.

## Controls in this codebase
- **Auth:** Google OAuth (NextAuth, JWT sessions); API keys stored as SHA-256 hashes; RBAC (`user < support < moderator < admin`).
- **Requests:** exact-origin CSRF checks on state-changing API calls; strict CSP and security headers; per-plan and per-IP rate limits.
- **Payments:** webhook signatures verified (Razorpay HMAC; Dodo Standard Webhooks with 5-minute replay window); idempotent grants.
- **Data:** OAuth tokens encrypted at rest (AES-256-GCM, `TOKEN_ENCRYPTION_KEY`); logs redact secrets, tokens and emails; episodes private by default.
- **AI:** prompt-injection and topic-policy screening before any spend; PII detection; per-user and global spend caps.
- **Supply chain:** CI runs `npm audit`, secret scanning (gitleaks) and CodeQL.
