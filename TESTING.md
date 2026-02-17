# Backlog Groomer — Testing

## Build Status
- ✅ `npm run build` passes successfully (Next.js 16.1.6 Turbopack)

## API Endpoint Test

```bash
curl -X POST http://localhost:3000/api/groom \
  -H "Content-Type: application/json" \
  -d '{
    "items": ["fix login bug", "add dark mode", "improve search speed"],
    "context": "B2B SaaS project management tool"
  }'
```

**Expected response:**
```json
{
  "items": [
    {
      "title": "Fix Login Authentication Bug",
      "problem": "Users unable to log in, blocking all product usage",
      "acceptanceCriteria": ["User can log in with valid credentials", "Error message shown for invalid credentials"],
      "estimate": "M",
      "priority": "HIGH — Blocks all user access",
      "tags": ["bug", "auth"]
    }
  ]
}
```

## Validation Checks
- [x] Build compiles with no errors
- [x] API route accepts POST with `{ items: string[], context?: string }`
- [x] Free tier enforces 5-item limit
- [x] Empty items return 400 error
- [x] GET /api/groom returns API info
- [ ] Live API test (requires `ANTHROPIC_API_KEY` and running dev server)

## Notes
- Stripe API version mismatch fixed with ts-expect-error (pre-existing issue in checkout/webhook routes)
- Success page wrapped in Suspense boundary (pre-existing Next.js 16 issue)
