'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'
import type { DashboardData } from './data'

// Short date label: "Mar 1"
function shortDate(day: string): string {
  const d = new Date(day + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// Show every Nth label to avoid crowding
function tickFormatter(day: string, index: number): string {
  if (index % 5 !== 0) return ''
  return shortDate(day)
}

const EMERALD = '#10b981'
const ZINC_600 = '#52525b'
const ZINC_400 = '#a1a1aa'
const AMBER = '#f59e0b'

const SOURCE_COLORS: Record<string, string> = {
  browser: EMERALD,
  mcp: '#6366f1',
  'api-direct': '#f59e0b',
  healthcheck: ZINC_600,
}

const SOURCE_LABELS: Record<string, string> = {
  browser: 'Browser',
  mcp: 'MCP',
  'api-direct': 'API Direct',
  healthcheck: 'Healthcheck',
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      {label && <p className="text-zinc-400 mb-1">{shortDate(label)}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="text-white">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p style={{ color: entry.color }}>{entry.name}: <span className="text-white">{entry.value}</span></p>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-white font-semibold font-mono text-sm mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function DashboardCharts({ data }: { data: DashboardData }) {
  const { scoreTrend, agentReadyFunnel, callVolume, sourceAttribution, stats } = data

  // Pie data — only include sources with > 0
  const pieData = Object.entries(sourceAttribution)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: SOURCE_LABELS[key] ?? key,
      value,
      color: SOURCE_COLORS[key] ?? ZINC_600,
    }))

  const hasPieData = pieData.length > 0

  // Total agent-ready pct across all days
  const totalReady = agentReadyFunnel.reduce((s, p) => s + p.ready, 0)
  const totalItems = agentReadyFunnel.reduce((s, p) => s + p.total, 0)
  const overallPct = totalItems > 0 ? Math.round((totalReady / totalItems) * 100) : null

  return (
    <div className="space-y-6">
      {/* Stat summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Lints"
          value={stats.totalLints.toLocaleString()}
          sub="last 30 days"
        />
        <StatCard
          label="Avg Score"
          value={stats.avgScore !== null ? `${stats.avgScore}` : '—'}
          sub="completeness score"
          accent={stats.avgScore !== null && stats.avgScore >= 70}
        />
        <StatCard
          label="Agent-Ready"
          value={stats.agentReadyPct !== null ? `${stats.agentReadyPct}%` : '—'}
          sub="of items pass gate"
          accent={stats.agentReadyPct !== null && stats.agentReadyPct >= 70}
        />
        <StatCard
          label="Active Days"
          value={stats.activeDays.toString()}
          sub="days with API calls"
        />
      </div>

      {/* Charts grid: 2x2 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Score Trend */}
        <ChartCard title="Score Trend — last 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreTrend} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="day"
                tickFormatter={tickFormatter}
                tick={{ fill: ZINC_400, fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: ZINC_400, fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine
                y={70}
                stroke={AMBER}
                strokeDasharray="5 3"
                label={{ value: 'agent-ready', fill: AMBER, fontSize: 10, fontFamily: 'monospace', position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                name="Avg Score"
                stroke={EMERALD}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Agent-Ready Funnel */}
        <ChartCard title={`Agent-Ready Funnel${overallPct !== null ? ` — ${overallPct}% overall` : ''}`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agentReadyFunnel} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="day"
                tickFormatter={tickFormatter}
                tick={{ fill: ZINC_400, fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
              />
              <YAxis
                tick={{ fill: ZINC_400, fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', color: ZINC_400 }}
                iconType="rect"
                iconSize={8}
              />
              <Bar dataKey="total" name="Total Items" fill={ZINC_600} radius={[2, 2, 0, 0]} />
              <Bar dataKey="ready" name="Agent-Ready" fill={EMERALD} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Call Volume */}
        <ChartCard title="Call Volume — last 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={callVolume} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="day"
                tickFormatter={tickFormatter}
                tick={{ fill: ZINC_400, fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
              />
              <YAxis
                tick={{ fill: ZINC_400, fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="calls" name="API Calls" fill={EMERALD} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Source Attribution */}
        <ChartCard title="Source Attribution — last 30 days">
          {hasPieData ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-zinc-400 text-xs font-mono">{entry.name}</span>
                    <span className="text-white text-xs font-mono ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-zinc-600 text-sm font-mono">
              No source data yet
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
