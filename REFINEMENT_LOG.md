# Refinement Phase 1 — Architectural Hardening

**Date:** 2026-02-16
**Deployed to:** groombacklog.com

## Changes

### 1. Vercel KV Integration (`src/lib/kv.ts` — NEW)
- Subscription CRUD: `sub:{customerId}` and `license:{licenseKey}` key schemas
- Rate limiting via KV: `ratelimit:{ip}:{date}` with 24h TTL
- **Graceful fallback**: all operations use in-memory Maps when `KV_REST_API_URL` is not set
- No filesystem operations anywhere

### 2. Zod Output Validation (`src/lib/schemas.ts` — NEW)
- `GroomedItemSchema` validates all fields from Claude's output
- Priority format validated via regex: `LEVEL — rationale`
- Estimate validated as enum: XS/S/M/L/XL
- On validation failure: retries once with correction prompt, then returns 502 with details

### 3. Rate Limiting Rewrite (`src/lib/rate-limit.ts`)
- Now async — uses KV-backed `checkRateLimitKV()` for persistence across cold starts
- `resolveUserTier()` looks up license key via KV to determine plan
- Falls back to in-memory when KV unavailable

### 4. Request Tracing (`src/app/api/groom/route.ts`)
- Every response includes `_meta`: `requestId`, `model`, `latencyMs`, `promptVersion`, `tier`
- Not exposed in UI

### 5. Webhook Rewrite (`src/app/api/webhook/route.ts`)
- Removed all `fs` operations (broken on Vercel)
- Uses `setSubscription()` / `cancelSubscriptionByCustomer()` from KV lib

### 6. Groom Route Updates (`src/app/api/groom/route.ts`)
- Accepts `x-license-key` header for paid tier identification
- Zod validation with retry on failure
- Tier resolved from license key before rate limiting

## Packages Added
- `zod` — output validation
- `@vercel/kv` — Vercel KV (Upstash Redis) client

## Next Steps
- Add Vercel KV integration (Upstash) and set `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars
- Set `STRIPE_WEBHOOK_SECRET` env var after configuring Stripe webhook endpoint
- License key delivery to customers (email via Stripe checkout success page or webhook)
