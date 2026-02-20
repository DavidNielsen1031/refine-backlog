import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveUserTier, getMaxItems, getTierLimits } from '@/lib/rate-limit'

// Mock KV module — tests shouldn't touch real Redis
vi.mock('@/lib/kv', () => ({
  getLicenseData: vi.fn(),
  checkRateLimitKV: vi.fn(),
  isKvConnected: vi.fn(() => false),
}))

import { getLicenseData } from '@/lib/kv'

describe('resolveUserTier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns free tier for null key', async () => {
    expect(await resolveUserTier(null)).toBe('free')
  })

  it('returns free tier for undefined key', async () => {
    expect(await resolveUserTier(undefined)).toBe('free')
  })

  it('returns plan for active license key', async () => {
    vi.mocked(getLicenseData).mockResolvedValue({ licenseKey: 'rb_test_key', customerId: 'cus_123', plan: 'pro', status: 'active' })
    expect(await resolveUserTier('rb_test_key')).toBe('pro')
  })

  it('returns free tier for inactive license key', async () => {
    vi.mocked(getLicenseData).mockResolvedValue({ licenseKey: 'rb_test_key', customerId: 'cus_123', plan: 'pro', status: 'canceled' })
    expect(await resolveUserTier('rb_inactive_key')).toBe('free')
  })

  it('returns free tier when key is not found', async () => {
    vi.mocked(getLicenseData).mockResolvedValue(null)
    expect(await resolveUserTier('rb_unknown_key')).toBe('free')
  })

  it('returns free tier on KV error (graceful fallback)', async () => {
    vi.mocked(getLicenseData).mockRejectedValue(new Error('KV connection failed'))
    expect(await resolveUserTier('rb_test_key')).toBe('free')
  })

  it('returns team plan for team license', async () => {
    vi.mocked(getLicenseData).mockResolvedValue({ licenseKey: 'rb_team_key', customerId: 'cus_456', plan: 'team', status: 'active' })
    expect(await resolveUserTier('rb_team_key')).toBe('team')
  })
})

describe('getMaxItems', () => {
  it('returns 5 for free tier', () => {
    expect(getMaxItems('free')).toBe(5)
  })

  it('returns 25 for pro tier', () => {
    expect(getMaxItems('pro')).toBe(25)
  })

  it('returns 50 for team tier', () => {
    expect(getMaxItems('team')).toBe(50)
  })
})

describe('getTierLimits', () => {
  it('free tier has 3 requests/day limit', () => {
    const limits = getTierLimits('free')
    expect(limits.maxRequestsPerDay).toBe(3)
    expect(limits.maxItems).toBe(5)
  })

  it('pro tier has unlimited requests', () => {
    const limits = getTierLimits('pro')
    expect(limits.maxRequestsPerDay).toBe(Infinity)
  })

  it('team tier has unlimited requests', () => {
    const limits = getTierLimits('team')
    expect(limits.maxRequestsPerDay).toBe(Infinity)
  })
})
