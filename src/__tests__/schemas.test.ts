import { describe, it, expect } from 'vitest'
import { RefinedItemSchema, RefinedItemsSchema, GroomedItemSchema, GroomedItemsSchema } from '@/lib/schemas'
import type { RefinedItem, GroomedItem } from '@/lib/schemas'

const validItem = {
  title: 'Fix authentication timeout bug',
  problem: 'Users are being logged out unexpectedly during active sessions.',
  acceptanceCriteria: ['Given a user is logged in, when 30 minutes pass, then session extends automatically'],
  estimate: 'M' as const,
  priority: 'HIGH — impacts all authenticated users',
  tags: ['bug', 'auth'],
}

describe('RefinedItemSchema', () => {
  it('validates a complete valid item', () => {
    expect(RefinedItemSchema.safeParse(validItem).success).toBe(true)
  })

  it('validates item with optional fields', () => {
    const withOptionals = {
      ...validItem,
      assumptions: ['Assumes refresh token flow is available'],
      userStory: 'As a user, I want my session to persist so that I am not interrupted mid-work',
    }
    expect(RefinedItemSchema.safeParse(withOptionals).success).toBe(true)
  })

  it('rejects missing required fields', () => {
    const { title, ...withoutTitle } = validItem
    expect(RefinedItemSchema.safeParse(withoutTitle).success).toBe(false)
  })

  it('rejects invalid estimate values', () => {
    expect(RefinedItemSchema.safeParse({ ...validItem, estimate: 'XXL' }).success).toBe(false)
    expect(RefinedItemSchema.safeParse({ ...validItem, estimate: 'xs' }).success).toBe(false)
  })

  it('accepts all valid estimate values', () => {
    for (const estimate of ['XS', 'S', 'M', 'L', 'XL'] as const) {
      expect(RefinedItemSchema.safeParse({ ...validItem, estimate }).success).toBe(true)
    }
  })

  it('rejects priority without rationale', () => {
    expect(RefinedItemSchema.safeParse({ ...validItem, priority: 'HIGH' }).success).toBe(false)
    expect(RefinedItemSchema.safeParse({ ...validItem, priority: 'MEDIUM' }).success).toBe(false)
  })

  it('accepts priority with em-dash rationale', () => {
    expect(RefinedItemSchema.safeParse({ ...validItem, priority: 'HIGH — critical path' }).success).toBe(true)
    expect(RefinedItemSchema.safeParse({ ...validItem, priority: 'LOW — nice to have' }).success).toBe(true)
    expect(RefinedItemSchema.safeParse({ ...validItem, priority: 'MEDIUM — affects 20% of users' }).success).toBe(true)
  })

  it('rejects empty tags array', () => {
    expect(RefinedItemSchema.safeParse({ ...validItem, tags: [] }).success).toBe(false)
  })

  it('rejects empty acceptanceCriteria array', () => {
    expect(RefinedItemSchema.safeParse({ ...validItem, acceptanceCriteria: [] }).success).toBe(false)
  })
})

describe('RefinedItemsSchema', () => {
  it('validates an array of items', () => {
    expect(RefinedItemsSchema.safeParse([validItem]).success).toBe(true)
    expect(RefinedItemsSchema.safeParse([validItem, validItem]).success).toBe(true)
  })

  it('rejects empty array', () => {
    expect(RefinedItemsSchema.safeParse([]).success).toBe(false)
  })
})

// REGRESSION: Legacy aliases must still work for backward compat
describe('Legacy GroomedItem aliases (backward compat)', () => {
  it('GroomedItemSchema is an alias for RefinedItemSchema', () => {
    expect(GroomedItemSchema.safeParse(validItem).success).toBe(true)
  })

  it('GroomedItemsSchema is an alias for RefinedItemsSchema', () => {
    expect(GroomedItemsSchema.safeParse([validItem]).success).toBe(true)
  })

  it('RefinedItem and GroomedItem type aliases are equivalent', () => {
    // Type-level test: assigning one to the other should compile
    const refined: RefinedItem = validItem as RefinedItem
    const groomed: GroomedItem = refined // should not error
    expect(groomed.title).toBe(refined.title)
  })
})
