# Runbook: payments (Razorpay ₹ / Dodo $)

## Setup
- Razorpay dashboard → Webhooks → `https://<web>/api/webhooks/razorpay` (or `https://<api>/webhooks/razorpay`), event **order.paid**, secret → `RAZORPAY_WEBHOOK_SECRET`. API keys → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
- Dodo dashboard → Webhooks → `/api/webhooks/dodo`, event **payment.succeeded**, secret → `DODO_PAYMENTS_WEBHOOK_SECRET`. Create one product per catalogue item and set `DODO_PRODUCT_<ID>` (e.g. `DODO_PRODUCT_PRO`).

## "I paid but got no minutes"
1. Find the payment: `select * from payments where provider_ref = '<order_… or pay_…>'`.
2. No row → the webhook never arrived or failed signature. Check the provider dashboard's delivery log; resend.
3. Row exists → credits were granted; check `credits_ledger` for `razorpay:<product>:<ref>`.
4. Manual fix (admin console or API): `PATCH /api/admin { action: "adjust_credits", userId, value, reason }` — ledgered and audited.

Grants are idempotent: resending a webhook never double-credits.
