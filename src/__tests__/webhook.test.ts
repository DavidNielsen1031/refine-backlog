import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Mocks (must be hoisted before imports) ---

const mockSetSubscription = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockGetSubscriptionByCustomer = vi.hoisted(() => vi.fn())
const mockCancelSubscriptionByCustomer = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockConstructEvent = vi.hoisted(() => vi.fn())

vi.mock('@/lib/kv', () => ({
  setSubscription: mockSetSubscription,
  getSubscriptionByCustomer: mockGetSubscriptionByCustomer,
  cancelSubscriptionByCustomer: mockCancelSubscriptionByCustomer,
  cancelSubscriptionById: vi.fn(),
  getLicenseData: vi.fn(),
  isKvConnected: vi.fn(() => false),
}))

vi.mock('@/lib/email', () => ({
  sendLicenseEmail: vi.fn().mockResolvedValue(undefined),
  PLAN_DETAILS: {
    lite: { label: 'Lite', price: '$9/month' },
    pro:  { label: 'Pro',  price: '$29/month' },
    team: { label: 'Team', price: '$79/month' },
  },
  VALID_PLANS: ['lite', 'pro', 'team'],
}))

vi.mock('stripe', () => {
  class MockStripe {
    webhooks = { constructEvent: mockConstructEvent }
  }
  return { default: MockStripe }
})

// Silence Telegram/Discord fire-and-forget fetches
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

import { POST } from '@/app/api/webhook/route'

// --- Helpers ---

function makeSignedRequest(body: object): NextRequest {
  return new NextRequest('https://speclint.ai/api/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'sig_test_mock',
    },
    body: JSON.stringify(body),
  })
}

function buildCheckoutEvent(overrides: object = {}): object {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        mode: 'subscription',
        customer: 'cus_test_123',
        subscription: 'sub_test_abc',
        customer_details: { email: 'buyer@example.com' },
        metadata: { plan: 'pro' },
        ...overrides,
      },
    },
  }
}

function buildSubscriptionUpdatedEvent(overrides: object = {}): object {
  return {
    type: 'customer.subscription.updated',
    data: {
      object: {
        customer: 'cus_test_123',
        status: 'active',
        items: {
          data: [{ price: { id: process.env.STRIPE_PRO_PRICE_ID ?? 'price_test_pro' } }],
        },
        ...overrides,
      },
    },
  }
}

function buildSubscriptionDeletedEvent(overrides: object = {}): object {
  return {
    type: 'customer.subscription.deleted',
    data: {
      object: {
        customer: 'cus_test_123',
        ...overrides,
      },
    },
  }
}

// --- Tests ---

describe('POST /api/webhook — subscription lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
    process.env.STRIPE_PRO_PRICE_ID = 'price_test_pro'
    process.env.STRIPE_TEAM_PRICE_ID = 'price_test_team'
    // By default constructEvent succeeds
    mockConstructEvent.mockImplementation((_body, _sig, _secret) => ({} as object))
    // By default no existing subscription
    mockGetSubscriptionByCustomer.mockResolvedValue(null)
  })

  // ─── 1. Subscription created → KV key issued ────────────────────────────

  describe('checkout.session.completed → KV key issued', () => {
    it('calls setSubscription with a new license key', async () => {
      const event = buildCheckoutEvent()
      mockConstructEvent.mockReturnValueOnce(event)
      mockGetSubscriptionByCustomer.mockResolvedValueOnce(null)

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.received).toBe(true)

      expect(mockSetSubscription).toHaveBeenCalledOnce()
      const [customerId, sub] = mockSetSubscription.mock.calls[0]
      expect(customerId).toBe('cus_test_123')
      expect(sub.plan).toBe('pro')
      expect(sub.status).toBe('active')
      expect(typeof sub.licenseKey).toBe('string')
      expect(sub.licenseKey.length).toBeGreaterThan(10)
    })

    it('is idempotent — skips key creation if key already exists', async () => {
      const event = buildCheckoutEvent()
      mockConstructEvent.mockReturnValueOnce(event)
      // Existing key already in KV
      mockGetSubscriptionByCustomer.mockResolvedValueOnce({
        customerId: 'cus_test_123',
        licenseKey: 'EXISTING-KEY-XXXX',
        plan: 'pro',
        status: 'active',
      })

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      // setSubscription must NOT be called again for the same customer
      expect(mockSetSubscription).not.toHaveBeenCalled()
    })

    it('skips key creation for non-subscription checkout modes', async () => {
      const event = buildCheckoutEvent({ mode: 'payment', subscription: null })
      mockConstructEvent.mockReturnValueOnce(event)

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      expect(mockSetSubscription).not.toHaveBeenCalled()
    })
  })

  // ─── 2. Subscription updated (plan change) → KV plan updated ───────────

  describe('customer.subscription.updated → KV plan updated', () => {
    it('updates plan when price ID changes from pro → team', async () => {
      const event = buildSubscriptionUpdatedEvent({
        status: 'active',
        items: { data: [{ price: { id: 'price_test_team' } }] },
      })
      mockConstructEvent.mockReturnValueOnce(event)
      mockGetSubscriptionByCustomer.mockResolvedValueOnce({
        customerId: 'cus_test_123',
        licenseKey: 'EXISTING-KEY-XXXX',
        plan: 'pro',
        status: 'active',
        subscriptionId: 'sub_test_abc',
      })

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      expect(mockSetSubscription).toHaveBeenCalledOnce()
      const [, sub] = mockSetSubscription.mock.calls[0]
      expect(sub.plan).toBe('team')
      expect(sub.status).toBe('active')
    })

    it('preserves plan when price ID is unknown', async () => {
      const event = buildSubscriptionUpdatedEvent({
        items: { data: [{ price: { id: 'price_unknown_xyz' } }] },
      })
      mockConstructEvent.mockReturnValueOnce(event)
      mockGetSubscriptionByCustomer.mockResolvedValueOnce({
        customerId: 'cus_test_123',
        licenseKey: 'EXISTING-KEY-XXXX',
        plan: 'pro',
        status: 'active',
        subscriptionId: 'sub_test_abc',
      })

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      expect(mockSetSubscription).toHaveBeenCalledOnce()
      const [, sub] = mockSetSubscription.mock.calls[0]
      // Plan should remain unchanged
      expect(sub.plan).toBe('pro')
    })

    it('skips update when no existing subscription is found in KV', async () => {
      const event = buildSubscriptionUpdatedEvent()
      mockConstructEvent.mockReturnValueOnce(event)
      mockGetSubscriptionByCustomer.mockResolvedValueOnce(null)

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      expect(mockSetSubscription).not.toHaveBeenCalled()
    })
  })

  // ─── 3. Subscription past_due → treated as active (grace period) ────────

  describe('customer.subscription.updated — past_due grace period', () => {
    it('maps past_due status → active in KV (grace period)', async () => {
      const event = buildSubscriptionUpdatedEvent({ status: 'past_due' })
      mockConstructEvent.mockReturnValueOnce(event)
      mockGetSubscriptionByCustomer.mockResolvedValueOnce({
        customerId: 'cus_test_123',
        licenseKey: 'EXISTING-KEY-XXXX',
        plan: 'pro',
        status: 'active',
        subscriptionId: 'sub_test_abc',
      })

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      expect(mockSetSubscription).toHaveBeenCalledOnce()
      const [, sub] = mockSetSubscription.mock.calls[0]
      // past_due → still 'active' (grace period policy)
      expect(sub.status).toBe('active')
    })

    it('maps trialing status → active in KV', async () => {
      const event = buildSubscriptionUpdatedEvent({ status: 'trialing' })
      mockConstructEvent.mockReturnValueOnce(event)
      mockGetSubscriptionByCustomer.mockResolvedValueOnce({
        customerId: 'cus_test_123',
        licenseKey: 'EXISTING-KEY-XXXX',
        plan: 'pro',
        status: 'active',
        subscriptionId: 'sub_test_abc',
      })

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      const [, sub] = mockSetSubscription.mock.calls[0]
      expect(sub.status).toBe('active')
    })

    it('maps unpaid/incomplete status → canceled in KV', async () => {
      const event = buildSubscriptionUpdatedEvent({ status: 'unpaid' })
      mockConstructEvent.mockReturnValueOnce(event)
      mockGetSubscriptionByCustomer.mockResolvedValueOnce({
        customerId: 'cus_test_123',
        licenseKey: 'EXISTING-KEY-XXXX',
        plan: 'pro',
        status: 'active',
        subscriptionId: 'sub_test_abc',
      })

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      const [, sub] = mockSetSubscription.mock.calls[0]
      expect(sub.status).toBe('canceled')
    })
  })

  // ─── 4. Subscription deleted → key revoked ──────────────────────────────

  describe('customer.subscription.deleted → key revoked', () => {
    it('calls cancelSubscriptionByCustomer with the customer ID', async () => {
      const event = buildSubscriptionDeletedEvent()
      mockConstructEvent.mockReturnValueOnce(event)

      const res = await POST(makeSignedRequest(event))

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.received).toBe(true)

      expect(mockCancelSubscriptionByCustomer).toHaveBeenCalledOnce()
      expect(mockCancelSubscriptionByCustomer).toHaveBeenCalledWith('cus_test_123')
    })

    it('still returns 200 even when cancel throws (Stripe retry safety)', async () => {
      const event = buildSubscriptionDeletedEvent()
      mockConstructEvent.mockReturnValueOnce(event)
      mockCancelSubscriptionByCustomer.mockRejectedValueOnce(new Error('KV unavailable'))

      const res = await POST(makeSignedRequest(event))

      // Webhook must always return 200 to prevent Stripe retry loops
      expect(res.status).toBe(200)
    })
  })
})
