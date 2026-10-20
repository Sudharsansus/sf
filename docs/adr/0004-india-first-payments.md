# 0004. Razorpay for INR, Dodo for USD

Status: Accepted · Date: 2026-10-21

## Context
Prices were USD-only and checkout was never wired up.

## Decision
Single catalogue priced in ₹ and $; Razorpay (UPI, cards, netbanking) for India, Dodo for international. Grants are idempotent per provider payment id (Redis claim + unique payments row).

## Consequences
Indian creators pay in rupees with UPI; webhooks can retry safely.
