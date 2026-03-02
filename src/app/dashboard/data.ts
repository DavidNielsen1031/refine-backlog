// Server-side data fetcher for the dashboard — never imported by client components
import { Redis } from '@upstash/redis'
import { getLicenseDailyEvents, getAgentReadyStats } from '@/lib/telemetry'
import type { UsageEvent } from '@/lib/telemetry'

function getRedis(): Redis | null {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
  return null
}

/** Generate the last N day strings (YYYY-MM-DD), most recent last */
export function getLast30Days(): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export interface ScoreTrendPoint {
  day: string
  avgScore: number | null
  count: number
}

export interface AgentReadyPoint {
  day: string
  total: number
  ready: number
}

export interface CallVolumePoint {
  day: string
  calls: number
}

export interface SourceAttribution {
  browser: number
  mcp: number
  'api-direct': number
  healthcheck: number
}

export interface DashboardData {
  scoreTrend: ScoreTrendPoint[]
  agentReadyFunnel: AgentReadyPoint[]
  callVolume: CallVolumePoint[]
  sourceAttribution: SourceAttribution
  stats: {
    totalLints: number
    avgScore: number | null
    agentReadyPct: number | null
    activeDays: number
  }
  /** Whether this data came from global (all keys) or per-license keys */
  isGlobal: boolean
  /** Whether the per-license data is empty (used to show "try it now" prompt) */
  perLicenseEmpty: boolean
}

export async function fetchDashboardData(
  licenseKey: string,
  { global: isGlobal = false }: { global?: boolean } = {},
): Promise<DashboardData> {
  const days = getLast30Days()
  const r = getRedis()

  // --- Chart 1: Score Trend ---
  let scoreTrend: ScoreTrendPoint[]

  if (isGlobal) {
    // Global mode: read all events from telemetry:daily:{day}
    scoreTrend = await Promise.all(
      days.map(async (day) => {
        if (!r) return { day, avgScore: null, count: 0 }
        try {
          // telemetry:daily:{day} is a Redis list of requestIds
          const requestIds = await r.lrange<string>(`telemetry:daily:${day}`, 0, -1)
          if (!requestIds.length) return { day, avgScore: null, count: 0 }

          const events = await Promise.all(
            requestIds.map(async (id) => {
              try {
                const raw = await r.get<string>(`telemetry:event:${id}`)
                if (!raw) return null
                const parsed: UsageEvent =
                  typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown as UsageEvent)
                return parsed
              } catch {
                return null
              }
            })
          )

          const scores = events
            .filter((e): e is UsageEvent => e !== null && e.averageScore !== undefined)
            .map((e) => e.averageScore as number)

          if (!scores.length) return { day, avgScore: null, count: requestIds.length }

          const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
          return { day, avgScore: Math.round(avg), count: requestIds.length }
        } catch {
          return { day, avgScore: null, count: 0 }
        }
      })
    )
  } else {
    // Per-license mode (original behavior)
    scoreTrend = await Promise.all(
      days.map(async (day) => {
        const requestIds = await getLicenseDailyEvents(licenseKey, day)
        if (!requestIds.length || !r) return { day, avgScore: null, count: 0 }

        const events = await Promise.all(
          requestIds.map(async (id) => {
            try {
              const raw = await r.get<string>(`telemetry:event:${id}`)
              if (!raw) return null
              const parsed: UsageEvent =
                typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown as UsageEvent)
              return parsed
            } catch {
              return null
            }
          })
        )

        const scores = events
          .filter((e): e is UsageEvent => e !== null && e.averageScore !== undefined)
          .map((e) => e.averageScore as number)

        if (!scores.length) return { day, avgScore: null, count: requestIds.length }

        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
        return { day, avgScore: Math.round(avg), count: requestIds.length }
      })
    )
  }

  // --- Chart 2: Agent-Ready Funnel (global keys, same regardless of toggle) ---
  const agentReadyFunnel: AgentReadyPoint[] = await Promise.all(
    days.map(async (day) => {
      const stats = await getAgentReadyStats(day)
      return { day, total: stats.total, ready: stats.ready }
    })
  )

  // --- Chart 3: Call Volume ---
  const callVolume: CallVolumePoint[] = await Promise.all(
    days.map(async (day) => {
      if (!r) return { day, calls: 0 }
      try {
        if (isGlobal) {
          // Global: use telemetry:calls:daily:{day}
          const calls = await r.get<number>(`telemetry:calls:daily:${day}`)
          return { day, calls: calls ?? 0 }
        } else {
          // Per-license: count events from license key list
          const requestIds = await getLicenseDailyEvents(licenseKey, day)
          return { day, calls: requestIds.length }
        }
      } catch {
        return { day, calls: 0 }
      }
    })
  )

  // --- Chart 4: Source Attribution (sum over 30 days) ---
  const sourceAttribution: SourceAttribution = { browser: 0, mcp: 0, 'api-direct': 0, healthcheck: 0 }
  if (r) {
    await Promise.all(
      days.map(async (day) => {
        const sources = ['browser', 'mcp', 'api-direct', 'healthcheck'] as const
        const counts = await Promise.all(
          sources.map((src) => r.get<number>(`telemetry:source:${src}:${day}`))
        )
        sources.forEach((src, i) => {
          sourceAttribution[src] += counts[i] ?? 0
        })
      })
    )
  }

  // --- Stats summary ---
  const totalLints = scoreTrend.reduce((sum, p) => sum + p.count, 0)
  const scoreDays = scoreTrend.filter((p) => p.avgScore !== null)
  const avgScore =
    scoreDays.length > 0
      ? Math.round(scoreDays.reduce((sum, p) => sum + (p.avgScore ?? 0), 0) / scoreDays.length)
      : null

  const totalReady = agentReadyFunnel.reduce((sum, p) => sum + p.ready, 0)
  const totalItems = agentReadyFunnel.reduce((sum, p) => sum + p.total, 0)
  const agentReadyPct = totalItems > 0 ? Math.round((totalReady / totalItems) * 100) : null

  const activeDays = callVolume.filter((p) => p.calls > 0).length

  // Determine if per-license data is empty (for "try it now" prompt)
  const perLicenseEmpty = !isGlobal && totalLints === 0

  return {
    scoreTrend,
    agentReadyFunnel,
    callVolume,
    sourceAttribution,
    stats: { totalLints, avgScore, agentReadyPct, activeDays },
    isGlobal,
    perLicenseEmpty,
  }
}
