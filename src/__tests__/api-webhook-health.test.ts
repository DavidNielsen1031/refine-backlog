import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/kv', () => ({
  setSubscription: vi.fn(),
  getSubscriptionByCustomer: vi.fn(),
  cancelSubscriptionByCustomer: vi.fn(),
  cancelSubscriptionById: vi.fn(),
  getLicenseData: vi.fn(),
  isKvConnected: vi.fn(() => false),
}))

vi.mock('stripe', () => {
  class MockStripe {
    webhooks = { constructEvent: vi.fn() }
  }
  return { default: MockStripe }
})

import { POST } from '@/app/api/webhook/route'

// REGRESSION: This test mirrors what the healthcheck cron does every 8 hours.
// If the webhook returns 500 for an unsigned request, STRIPE_WEBHOOK_SECRET
// is missing or corrupt — a production incident. It must always be 400.
describe('POST /api/webhook — signature guard (healthcheck regression)', () => {
  it('returns 400 with "signature" in error for unsigned requests', async () => {
    const req = new NextRequest('https://refinebacklog.com/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Deliberately NO stripe-signature header
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error.toLowerCase()).toContain('signature')
  })

  it('REGRESSION: never returns 500 for missing signature', async () => {
    const req = new NextRequest('https://refinebacklog.com/api/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    // 500 = env var missing/corrupt. 400 = correctly rejecting unsigned request.
    expect(res.status).not.toBe(500)
  })
})
