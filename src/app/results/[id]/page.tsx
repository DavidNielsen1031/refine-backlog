import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLintReceipt } from '@/lib/kv'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const receipt = await getLintReceipt(id)
  if (!receipt) {
    return { title: 'Result Not Found — Speclint' }
  }
  return {
    title: `Speclint Result: ${receipt.score}/100 — ${receipt.title}`,
    description: `Spec quality score: ${receipt.score}/100. Agent ready: ${receipt.agent_ready ? 'Yes' : 'No'}. View the full breakdown.`,
    openGraph: {
      title: `Spec scored ${receipt.score}/100 on Speclint`,
      description: receipt.agent_ready
        ? `✅ Agent-ready — ${receipt.title}`
        : `❌ Not yet agent-ready — ${receipt.title}`,
    },
  }
}

const DIMENSION_LABELS: Record<string, string> = {
  has_problem_statement: 'Problem statement',
  has_acceptance_criteria: 'Acceptance criteria',
  has_size_estimate: 'Size estimate',
  has_priority: 'Priority',
  has_tags: 'Tags',
  has_constraints: 'Constraints',
  has_testability: 'Testability',
  has_measurable_outcome: 'Measurable outcome',
  has_review_gate: 'Review gate',
  has_verification_steps: 'Verification steps',
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
    score >= 60 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                  'text-red-400 border-red-400/30 bg-red-400/10'
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-4xl font-bold ${color}`}>
      {score}<span className="text-xl font-normal opacity-60">/100</span>
    </div>
  )
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params

  // Validate format
  if (!/^spl_[a-f0-9]{8}$/.test(id)) {
    notFound()
  }

  const receipt = await getLintReceipt(id)

  if (!receipt) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-zinc-500 text-5xl mb-6">🔍</p>
          <h1 className="text-2xl font-bold text-white mb-3">Result not found</h1>
          <p className="text-zinc-400 mb-8">
            This result may have expired (results are stored for 30 days) or the ID is invalid.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Lint a new spec
          </a>
        </div>
      </main>
    )
  }

  const passedDimensions = Object.entries(receipt.breakdown).filter(([, v]) => v)
  const failedDimensions = Object.entries(receipt.breakdown).filter(([, v]) => !v)
  const date = new Date(receipt.timestamp).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <a href="/" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
            ← speclint.ai
          </a>
        </div>

        {/* Score card */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-white mb-1 leading-snug">{receipt.title}</h1>
              <p className="text-zinc-500 text-sm">{date} · {receipt.tier} tier</p>
            </div>
            <div className="flex-shrink-0">
              <ScoreBadge score={receipt.score} />
            </div>
          </div>

          {/* Agent ready badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-8 ${
            receipt.agent_ready
              ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
              : 'bg-red-400/10 text-red-400 border border-red-400/20'
          }`}>
            {receipt.agent_ready ? '✅ Agent-ready' : '❌ Not yet agent-ready'}
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Dimension breakdown
            </h2>

            {passedDimensions.length > 0 && (
              <div className="space-y-2">
                {passedDimensions.map(([key]) => (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="text-emerald-400 text-base">✓</span>
                    <span className="text-zinc-300">{DIMENSION_LABELS[key] ?? key}</span>
                  </div>
                ))}
              </div>
            )}

            {failedDimensions.length > 0 && (
              <div className="space-y-2 mt-4">
                {failedDimensions.map(([key]) => (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="text-red-400 text-base">✗</span>
                    <span className="text-zinc-500">{DIMENSION_LABELS[key] ?? key}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8 text-center">
          {receipt.agent_ready ? (
            <>
              <p className="text-zinc-300 mb-4">This spec is ready for your AI coding agent.</p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Lint another spec
              </a>
            </>
          ) : (
            <>
              <p className="text-zinc-300 mb-2">
                {failedDimensions.length} dimension{failedDimensions.length !== 1 ? 's' : ''} need work.
              </p>
              <p className="text-zinc-500 text-sm mb-6">
                Use Speclint to auto-fix the gaps — the rewrite engine handles the missing pieces.
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Fix it on Speclint →
              </a>
            </>
          )}
        </div>

        {/* Receipt ID */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Receipt ID: <code className="font-mono">{id}</code> · Expires 30 days from lint date
        </p>
      </div>
    </main>
  )
}
