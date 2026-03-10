/**
 * POST /api/events
 *
 * Receives client-side funnel events and stores them in Redis.
 * No auth required — events are low-sensitivity analytics only.
 *
 * Body: { event: string, properties: object, timestamp: string }
 *
 * Redis schema:
 *   funnel:events:YYYY-MM-DD  → list of JSON-serialised events (TTL 90d)
 *   funnel:count:EVENT:YYYY-MM-DD → integer counter (TTL 90d)
 */
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const VALID_EVENTS = new Set([
  'page_view',
  'spec_tested',
  'pricing_cta_clicked',
  'checkout_initiated',
  'checkout_success',
])

const TTL = 90 * 86400 // 90 days

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { event?: unknown; properties?: unknown; timestamp?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, properties, timestamp } = body

  if (typeof event !== 'string' || !VALID_EVENTS.has(event)) {
    return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
  }

  const ts = typeof timestamp === 'string' ? timestamp : new Date().toISOString()
  const day = ts.slice(0, 10) // YYYY-MM-DD

  // Sanitise properties — drop anything > 2KB to prevent abuse
  const safeProps = JSON.stringify(properties ?? {}).slice(0, 2048)

  const record = JSON.stringify({
    event,
    properties: JSON.parse(safeProps),
    timestamp: ts,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
  })

  const r = getRedis()
  if (r) {
    try {
      const listKey = `funnel:events:${day}`
      const countKey = `funnel:count:${event}:${day}`
      await Promise.all([
        r.lpush(listKey, record).then(() => r.expire(listKey, TTL)),
        r.incr(countKey).then(() => r.expire(countKey, TTL)),
      ])
    } catch (err) {
      // Redis failure — log but don't error the client
      console.error('[events] Redis write failed:', err)
    }
  } else {
    // No Redis: log to stdout (useful in dev)
    console.log('[events]', record)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

// Preflight for CORS (analytics is same-origin but let's be safe)
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
