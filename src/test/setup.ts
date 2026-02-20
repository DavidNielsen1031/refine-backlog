import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js server components that aren't available in test environment
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock environment variables for tests
process.env.ANTHROPIC_API_KEY = 'test-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_PRO_PRICE_ID = 'price_test_pro'
process.env.STRIPE_TEAM_PRICE_ID = 'price_test_team'
