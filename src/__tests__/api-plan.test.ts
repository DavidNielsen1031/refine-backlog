import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// vi.hoisted runs before all imports — required to reference mock in vi.mock factory
const mockCreate = vi.hoisted(() => vi.fn())

import { POST, GET } from '@/app/api/plan/route'
import { SprintPlanSchema } from '@/lib/schemas'

// ---- Mocks ----------------------------------------------------------------

const MOCK_PLAN_RESPONSE = {
  content: [{
    type: 'text',
    text: JSON.stringify({
      sprint_goal: 'Ship a reliable auth flow that unblocks the onboarding funnel',
      execution_queue: [
        {
          id: '1',
          title: 'Fix session timeout bug',
          estimate: 'S',
          priority: 'HIGH — blocks all authenticated users',
          tags: ['bug', 'auth'],
          rationale: 'Highest priority, no dependencies, can start immediately',
          parallel_group: 1,
          depends_on: [],
        },
        {
          id: '2',
          title: 'Add remember me checkbox',
          estimate: 'S',
          priority: 'HIGH — user request',
          tags: ['feature', 'auth'],
          rationale: 'High priority, no dependencies, parallelizable with item 1',
          parallel_group: 1,
          depends_on: [],
        },
        {
          id: '3',
          title: 'Implement OAuth with Google',
          estimate: 'M',
          priority: 'MEDIUM — nice to have',
          tags: ['feature', 'auth', 'oauth'],
          rationale: 'Depends on session fix being stable first',
          parallel_group: 2,
          depends_on: ['1'],
        },
      ],
      deferred: [
        {
          id: '4',
          title: 'Add SSO enterprise support',
          estimate: 'XL',
          priority: 'LOW — future',
          tags: ['feature', 'enterprise'],
          rationale: 'Too large for this sprint budget',
          parallel_group: 3,
          depends_on: ['3'],
        },
      ],
      fit_ratio: 0.75,
    }),
  }],
  usage: { input_tokens: 380, output_tokens: 520 },
}

vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = { create: mockCreate }
  }
  class APIError extends Error {}
  return { default: MockAnthropic, APIError }
})

vi.mock('@/lib/kv', () => ({
  getLicenseData: vi.fn().mockResolvedValue(null),
  checkRateLimitKV: vi.fn().mockResolvedValue({ count: 1, allowed: true }),
  isKvConnected: vi.fn(() => false),
}))

vi.mock('@/lib/telemetry', () => ({
  trackUsage: vi.fn().mockResolvedValue(undefined),
  calculateCost: vi.fn().mockReturnValue(0.0006),
  detectSource: vi.fn().mockReturnValue('api-direct'),
}))

// ---- Helpers ---------------------------------------------------------------

function makeRequest(body: object, headers: Record<string, string> = {}) {
  return new NextRequest('https://refinebacklog.com/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

// ---- Tests -----------------------------------------------------------------

describe('POST /api/plan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue(MOCK_PLAN_RESPONSE)
  })

  // 1. Rejects empty items
  it('test_plan_rejects_empty_items — returns 400 for missing items', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  it('test_plan_rejects_empty_items — returns 400 for empty array', async () => {
    const res = await POST(makeRequest({ items: [] }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  // 2. Valid items return sprint_goal string
  it('test_plan_returns_sprint_goal — valid items return sprint_goal string', async () => {
    mockCreate.mockResolvedValue(MOCK_PLAN_RESPONSE)

    const res = await POST(makeRequest({
      items: ['Fix session timeout bug', 'Add remember me checkbox'],
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.sprint_goal).toBeDefined()
    expect(typeof data.sprint_goal).toBe('string')
    expect(data._meta).toBeDefined()
    expect(data._meta.tier).toBe('free')
  })

  // 3. Items in execution_queue have title and rationale
  it('test_plan_returns_execution_queue — items have title and rationale', async () => {
    mockCreate.mockResolvedValue(MOCK_PLAN_RESPONSE)

    const res = await POST(makeRequest({
      items: ['Fix session timeout bug', 'Add remember me checkbox', 'Implement OAuth with Google'],
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.execution_queue).toBeDefined()
    expect(Array.isArray(data.execution_queue)).toBe(true)
    expect(data.execution_queue[0].title).toBeTruthy()
    expect(data.execution_queue[0].rationale).toBeTruthy()
  })

  // 4. Free tier strips parallel_group and depends_on
  it('test_plan_free_tier_strips_dependency_fields — free tier items have no parallel_group', async () => {
    mockCreate.mockResolvedValue(MOCK_PLAN_RESPONSE)

    // No x-license-key header = free tier
    const res = await POST(makeRequest({
      items: ['Fix session timeout bug', 'Add remember me checkbox'],
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data._meta.tier).toBe('free')
    // parallel_group and depends_on should be stripped for free tier
    for (const item of data.execution_queue) {
      expect(item.parallel_group).toBeUndefined()
      expect(item.depends_on).toBeUndefined()
    }
    // deferred should not be present; instead an _upgrade_hint if items were deferred
    expect(data.deferred).toBeUndefined()
    expect(data._upgrade_hint).toBeTruthy()
  })

  // 5. SprintPlanSchema validates correct and incorrect data
  it('test_plan_schema_validates — SprintPlanSchema passes for valid data', () => {
    const validPlan = {
      sprint_goal: 'Ship a reliable auth flow that unblocks the onboarding funnel',
      execution_queue: [
        {
          id: '1',
          title: 'Fix session timeout bug',
          estimate: 'S',
          priority: 'HIGH — blocks all authenticated users',
          tags: ['bug', 'auth'],
          rationale: 'Highest priority, no dependencies',
          parallel_group: 1,
          depends_on: [],
        },
      ],
      deferred: [],
      fit_ratio: 0.75,
    }
    const result = SprintPlanSchema.safeParse(validPlan)
    expect(result.success).toBe(true)
  })

  it('test_plan_schema_validates — fails for invalid data (fit_ratio > 1)', () => {
    const invalidPlan = {
      sprint_goal: 'Ship something',
      execution_queue: [
        {
          id: '1',
          title: 'Some item',
          rationale: 'Because',
        },
      ],
      fit_ratio: 1.5, // invalid — > 1
    }
    const result = SprintPlanSchema.safeParse(invalidPlan)
    expect(result.success).toBe(false)
  })

  // 6. GET handler returns API info
  it('GET /api/plan returns API info', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toContain('Sprint')
  })
})
