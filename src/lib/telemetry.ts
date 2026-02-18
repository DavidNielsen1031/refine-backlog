// Usage telemetry — tracks API call metrics in Upstash Redis
import { Redis } from '@upstash/redis'

export interface UsageEvent {
  requestId: string
  timestamp: string
  model: string
  tier: string
  itemCount: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  latencyMs: number
  retried: boolean
  ip?: string
}

// Model pricing per million tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
  'claude-haiku-4-5-20250414': { input: 1.00, output: 5.00 },
}

const DEFAULT_PRICING = { input: 1.00, output: 5.00 }

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
}

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
    return redis
  }
  return null
}

export async function trackUsage(event: UsageEvent): Promise<void> {
  const r = getRedis()
  if (!r) {
    console.log('[telemetry]', JSON.stringify(event))
    return
  }

  try {
    const day = event.timestamp.slice(0, 10) // YYYY-MM-DD
    const month = event.timestamp.slice(0, 7) // YYYY-MM

    // Store individual event (keep 90 days)
    const eventKey = `telemetry:event:${event.requestId}`
    await r.set(eventKey, JSON.stringify(event), { ex: 90 * 86400 })

    // Push to daily list
    await r.lpush(`telemetry:daily:${day}`, event.requestId)
    await r.expire(`telemetry:daily:${day}`, 90 * 86400)

    // Increment daily aggregates
    await r.incrbyfloat(`telemetry:cost:daily:${day}`, event.costUsd)
    await r.expire(`telemetry:cost:daily:${day}`, 90 * 86400)
    await r.incrby(`telemetry:calls:daily:${day}`, 1)
    await r.expire(`telemetry:calls:daily:${day}`, 90 * 86400)
    await r.incrby(`telemetry:tokens:daily:${day}:input`, event.inputTokens)
    await r.expire(`telemetry:tokens:daily:${day}:input`, 90 * 86400)
    await r.incrby(`telemetry:tokens:daily:${day}:output`, event.outputTokens)
    await r.expire(`telemetry:tokens:daily:${day}:output`, 90 * 86400)
    await r.incrby(`telemetry:items:daily:${day}`, event.itemCount)
    await r.expire(`telemetry:items:daily:${day}`, 90 * 86400)

    // Monthly aggregates
    await r.incrbyfloat(`telemetry:cost:monthly:${month}`, event.costUsd)
    await r.expire(`telemetry:cost:monthly:${month}`, 365 * 86400)
    await r.incrby(`telemetry:calls:monthly:${month}`, 1)
    await r.expire(`telemetry:calls:monthly:${month}`, 365 * 86400)

    // Tier tracking
    await r.incrby(`telemetry:tier:${event.tier}:${day}`, 1)
    await r.expire(`telemetry:tier:${event.tier}:${day}`, 90 * 86400)

  } catch (err) {
    console.error('[telemetry] Failed to track usage:', err)
    // Non-blocking — don't let telemetry failures break the API
  }
}

export async function getDailySummary(day: string): Promise<{
  calls: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  items: number
} | null> {
  const r = getRedis()
  if (!r) return null

  try {
    const [calls, inputTokens, outputTokens, costUsd, items] = await Promise.all([
      r.get<number>(`telemetry:calls:daily:${day}`),
      r.get<number>(`telemetry:tokens:daily:${day}:input`),
      r.get<number>(`telemetry:tokens:daily:${day}:output`),
      r.get<number>(`telemetry:cost:daily:${day}`),
      r.get<number>(`telemetry:items:daily:${day}`),
    ])

    if (!calls) return null

    return {
      calls: calls ?? 0,
      inputTokens: inputTokens ?? 0,
      outputTokens: outputTokens ?? 0,
      costUsd: costUsd ?? 0,
      items: items ?? 0,
    }
  } catch (err) {
    console.error('[telemetry] getDailySummary failed:', err)
    return null
  }
}

export async function getMonthlySummary(month: string): Promise<{
  calls: number
  costUsd: number
} | null> {
  const r = getRedis()
  if (!r) return null

  try {
    const [calls, costUsd] = await Promise.all([
      r.get<number>(`telemetry:calls:monthly:${month}`),
      r.get<number>(`telemetry:cost:monthly:${month}`),
    ])

    if (!calls) return null
    return { calls: calls ?? 0, costUsd: costUsd ?? 0 }
  } catch (err) {
    console.error('[telemetry] getMonthlySummary failed:', err)
    return null
  }
}
