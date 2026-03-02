import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getLicenseData } from '@/lib/kv'
import { AuthForm } from './AuthForm'
import { DashboardCharts } from './DashboardCharts'
import { fetchDashboardData } from './data'
import { clearDashboardSession } from './actions'

export const metadata: Metadata = {
  title: 'Dashboard — Speclint',
  description: 'Your Speclint usage dashboard — score trends, agent-ready rates, and call volume.',
  robots: { index: false, follow: false },
}

// Revalidate every 5 minutes
export const revalidate = 300

const COOKIE_NAME = 'sl-dashboard-key'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const licenseKey = cookieStore.get(COOKIE_NAME)?.value ?? null

  // Validate stored key
  let validKey: string | null = null
  let tier: string | null = null

  if (licenseKey) {
    const licenseData = await getLicenseData(licenseKey)
    if (
      licenseData &&
      licenseData.status === 'active' &&
      (licenseData.plan === 'pro' || licenseData.plan === 'team')
    ) {
      validKey = licenseKey
      tier = licenseData.plan
    }
  }

  // Not authenticated → show auth gate
  if (!validKey) {
    return <AuthForm />
  }

  // Fetch dashboard data server-side
  const data = await fetchDashboardData(validKey)

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav header — matches blog pages */}
      <div className="border-b border-zinc-800 sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono font-bold text-white text-lg hover:text-emerald-400 transition-colors"
          >
            speclint
          </Link>
          <nav className="flex items-center gap-6 text-sm font-mono">
            <Link
              href="/pricing"
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              pricing
            </Link>
            <Link
              href="/blog"
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              blog
            </Link>
            <Link
              href="/dashboard"
              className="text-emerald-400"
            >
              dashboard
            </Link>
            <form action={clearDashboardSession}>
              <button
                type="submit"
                className="text-zinc-600 hover:text-zinc-400 transition-colors text-xs"
              >
                sign out
              </button>
            </form>
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1 font-mono">
              Last 30 days ·{' '}
              <span className="text-emerald-400">
                {tier === 'team' ? '👥 Team' : '💎 Pro'}
              </span>
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            key: {validKey.slice(0, 12)}…
          </div>
        </div>

        <DashboardCharts data={data} />
      </div>
    </main>
  )
}
