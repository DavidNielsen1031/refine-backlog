# Entitlement Architecture

## Data Flow

```
Stripe Checkout → Webhook → KV (Upstash Redis) → License Key → /api/groom → Tier Resolution
```

1. **Stripe Checkout** — User completes payment via Stripe Checkout session
2. **Webhook** (`/api/webhook`) — Receives `checkout.session.completed`, generates license key, writes to KV
3. **KV Storage** — Upstash Redis stores subscription and license data
4. **API Request** — Client sends `x-license-key` header to `/api/groom`
5. **Tier Resolution** — `resolveUserTier()` looks up license in KV, returns `free|pro|team`
6. **Rate Limiting** — `checkRateLimit()` enforces daily limits based on tier

## KV Key Structure

| Key Pattern | Value | Purpose |
|---|---|---|
| `sub:{customerId}` | `SubscriptionData` JSON | Subscription record by Stripe customer ID |
| `license:{licenseKey}` | `LicenseData` JSON | License lookup (plan, status, customerId) |
| `ratelimit:{ip}:{date}` | integer (auto-incrementing) | Daily request counter per IP |
| `debug:ping` | `"pong"` | Health check |

### SubscriptionData
```json
{ "plan": "pro|team", "status": "active|canceled", "email": "...", "licenseKey": "XXXX-XXXX-...", "subscriptionId": "sub_..." }
```

### LicenseData
```json
{ "customerId": "cus_...", "plan": "pro|team", "status": "active|canceled" }
```

## Tier Limits

| Tier | Max Items/Request | Max Requests/Day |
|---|---|---|
| free | 5 | 3 |
| pro | 25 | ∞ |
| team | 50 | ∞ |

## Webhook Events

| Event | Handler |
|---|---|
| `checkout.session.completed` | Creates subscription + license key in KV |
| `customer.subscription.updated` | Updates status (active/canceled) |
| `customer.subscription.deleted` | Marks subscription as canceled |

## Failure Modes

- **KV unreachable**: All KV calls have try/catch with in-memory fallback. Rate limiter falls back to allowing requests.
- **Invalid license key**: `resolveUserTier()` returns `free` (default).
- **No license key**: Returns `free` tier.
- **Webhook KV write fails**: Logs error, returns 200 to Stripe (prevents retry storms).
- **Stripe SDK init fails**: Returns 500, logged.
- **Signature verification fails**: Returns 400, logged.
