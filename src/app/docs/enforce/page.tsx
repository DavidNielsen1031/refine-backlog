import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'speclint enforce — CLI Reference',
  description:
    'Gate your coding agents on spec quality. The speclint enforce command blocks agent execution until your GitHub issue meets your minimum quality score.',
}

function CodeBlock({ children, lang = '' }: { children: string; lang?: string }) {
  return (
    <div className="my-4 rounded-lg bg-zinc-900 border border-zinc-800 overflow-x-auto">
      {lang && (
        <div className="px-4 py-2 border-b border-zinc-800 text-xs font-mono text-zinc-500">
          {lang}
        </div>
      )}
      <pre className="px-5 py-4 text-sm font-mono text-zinc-200 leading-relaxed whitespace-pre">
        {children}
      </pre>
    </div>
  )
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12">
      {children}
    </section>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-white mt-10 mb-4 font-mono border-b border-zinc-800 pb-2">
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold text-zinc-100 mt-6 mb-2 font-mono">
      {children}
    </h3>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-emerald-400 bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-zinc-800 text-zinc-300 text-xs font-mono px-2 py-0.5 rounded mr-2">
      {children}
    </span>
  )
}

export default function EnforcePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
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
              href="/get-key"
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded transition-colors font-semibold"
            >
              get key
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm font-mono mb-10 transition-colors"
        >
          ← back to home
        </Link>

        {/* Page header */}
        <header className="mb-12 pb-8 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-mono text-zinc-500">CLI Reference</span>
            <span className="text-zinc-700">·</span>
            <Badge>v1.x</Badge>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4 font-mono">
            speclint enforce
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Gate your coding agents on spec quality. Block execution until your
            GitHub issue meets your minimum quality score.
          </p>
        </header>

        {/* What it does */}
        <Section id="overview">
          <H2># what it does</H2>
          <p className="text-zinc-300 leading-7 mb-4">
            <InlineCode>speclint enforce</InlineCode> fetches a GitHub issue, runs it
            through the Speclint scoring engine, and exits with a non-zero code if the
            issue falls below your minimum quality threshold.
          </p>
          <p className="text-zinc-300 leading-7 mb-4">
            Use it as a pre-flight check in CI pipelines, agent harness scripts, or
            locally before handing a ticket to Cursor, Codex, Claude Code, or any
            other coding agent. If the spec isn&apos;t good enough, the agent never runs.
          </p>
          <div className="rounded-lg bg-emerald-950 border border-emerald-800 px-5 py-4 my-6">
            <p className="text-emerald-300 text-sm font-mono leading-relaxed">
              💡 <strong className="text-emerald-200">The rule:</strong> No coding agent
              runs on a spec that scores below 80. Garbage in, garbage out — enforce
              catches it before the tokens are wasted.
            </p>
          </div>
        </Section>

        {/* Installation */}
        <Section id="installation">
          <H2># installation</H2>
          <p className="text-zinc-300 leading-7 mb-2">
            No install required with <InlineCode>npx</InlineCode>:
          </p>
          <CodeBlock lang="bash">npx speclint enforce --issue 42 --repo myorg/myrepo</CodeBlock>
          <p className="text-zinc-300 leading-7 mb-2 mt-4">
            Or install globally:
          </p>
          <CodeBlock lang="bash">npm install -g speclint</CodeBlock>
        </Section>

        {/* Usage */}
        <Section id="usage">
          <H2># usage</H2>
          <CodeBlock lang="bash">
{`npx speclint enforce \\
  --issue <number> \\
  --repo <owner/repo> \\
  [--min-score <0-100>] \\
  [--key <SPECLINT_KEY>] \\
  [--github-token <GITHUB_TOKEN>]`}
          </CodeBlock>
        </Section>

        {/* Options */}
        <Section id="options">
          <H2># options</H2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium py-3 pr-6">flag</th>
                  <th className="text-left text-zinc-400 font-medium py-3 pr-6">default</th>
                  <th className="text-left text-zinc-400 font-medium py-3">description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-900">
                  <td className="py-3 pr-6 text-emerald-400">--issue</td>
                  <td className="py-3 pr-6 text-zinc-500">required</td>
                  <td className="py-3">GitHub issue number to score</td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3 pr-6 text-emerald-400">--repo</td>
                  <td className="py-3 pr-6 text-zinc-500">required</td>
                  <td className="py-3">Repository in <InlineCode>owner/repo</InlineCode> format</td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3 pr-6 text-emerald-400">--min-score</td>
                  <td className="py-3 pr-6 text-zinc-500">80</td>
                  <td className="py-3">Minimum passing score (0–100). Exit 1 if below.</td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3 pr-6 text-emerald-400">--key</td>
                  <td className="py-3 pr-6 text-zinc-500">$SPECLINT_KEY</td>
                  <td className="py-3">Speclint API key. Falls back to env var.</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 text-emerald-400">--github-token</td>
                  <td className="py-3 pr-6 text-zinc-500">$GITHUB_TOKEN</td>
                  <td className="py-3">GitHub token for private repos. Falls back to env var.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Environment variables */}
        <Section id="env">
          <H2># environment variables</H2>
          <p className="text-zinc-300 leading-7 mb-4">
            All flags can be set via environment variables. Flags take precedence over
            env vars when both are provided.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium py-3 pr-6">variable</th>
                  <th className="text-left text-zinc-400 font-medium py-3">description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-900">
                  <td className="py-3 pr-6 text-emerald-400">SPECLINT_KEY</td>
                  <td className="py-3">Your Speclint API key. Get one at <Link href="/get-key" className="text-emerald-400 hover:text-emerald-300 transition-colors">/get-key</Link>.</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 text-emerald-400">GITHUB_TOKEN</td>
                  <td className="py-3">GitHub personal access token or Actions token. Required for private repos; improves rate limits on public repos.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Exit codes */}
        <Section id="exit-codes">
          <H2># exit codes</H2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium py-3 pr-6">code</th>
                  <th className="text-left text-zinc-400 font-medium py-3">meaning</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-900">
                  <td className="py-3 pr-6">
                    <span className="text-emerald-400">0</span>
                  </td>
                  <td className="py-3">Pass — issue score meets or exceeds <InlineCode>--min-score</InlineCode></td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3 pr-6">
                    <span className="text-red-400">1</span>
                  </td>
                  <td className="py-3">Fail — issue score is below <InlineCode>--min-score</InlineCode></td>
                </tr>
                <tr>
                  <td className="py-3 pr-6">
                    <span className="text-yellow-400">2</span>
                  </td>
                  <td className="py-3">Error — could not fetch issue, invalid API key, or network failure</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Integration examples */}
        <Section id="examples">
          <H2># integration examples</H2>

          {/* Example 1 */}
          <H3>1. CLI one-liner (manual gate)</H3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
            Run before opening a ticket in your agent. If it fails, improve the issue
            first.
          </p>
          <CodeBlock lang="bash">
{`export SPECLINT_KEY=sk-...
export GITHUB_TOKEN=ghp_...

npx speclint enforce --issue 42 --repo myorg/myrepo --min-score 80
# exit 0 → spec is ready, hand off to agent
# exit 1 → spec needs work, see score output`}
          </CodeBlock>

          {/* Example 2 */}
          <H3>2. GitHub Actions (CI gate)</H3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
            Block agent-triggered workflows until the linked issue scores high enough.
            Add this as a required check before any AI-coding job.
          </p>
          <CodeBlock lang=".github/workflows/spec-gate.yml">
{`name: Spec Quality Gate

on:
  issues:
    types: [labeled]

jobs:
  enforce:
    if: github.event.label.name == 'agent-ready'
    runs-on: ubuntu-latest
    steps:
      - name: Check spec quality
        run: |
          npx speclint enforce \\
            --issue \${{ github.event.issue.number }} \\
            --repo \${{ github.repository }} \\
            --min-score 80
        env:
          SPECLINT_KEY: \${{ secrets.SPECLINT_KEY }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`}
          </CodeBlock>

          {/* Example 3 */}
          <H3>3. Agent harness script (pre-agent gate)</H3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
            Gate any coding agent — Codex, Claude Code, Cursor — before it runs.
            The harness exits early if the spec isn&apos;t ready.
          </p>
          <CodeBlock lang="run-agent.sh">
{`#!/usr/bin/env bash
set -e

ISSUE=$1
REPO=$2

echo "→ Checking spec quality for issue #$ISSUE..."

npx speclint enforce \\
  --issue "$ISSUE" \\
  --repo "$REPO" \\
  --min-score 80

# Only reaches here if exit code = 0
echo "✓ Spec passed. Launching agent..."
claude --issue "$ISSUE" --repo "$REPO"`}
          </CodeBlock>
          <p className="text-zinc-400 text-sm leading-relaxed mt-3">
            Usage: <InlineCode>./run-agent.sh 42 myorg/myrepo</InlineCode>
          </p>
        </Section>

        {/* Get an API key */}
        <Section id="api-key">
          <H2># get an api key</H2>
          <p className="text-zinc-300 leading-7 mb-6">
            <InlineCode>speclint enforce</InlineCode> requires a Speclint API key
            (<InlineCode>SPECLINT_KEY</InlineCode>). Keys are available on all paid plans.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded transition-colors font-mono text-sm"
          >
            view pricing →
          </Link>
        </Section>

        {/* Footer */}
        <div className="pt-8 border-t border-zinc-800 text-sm text-zinc-600 font-mono">
          <Link href="/" className="hover:text-zinc-400 transition-colors">
            ← speclint.ai
          </Link>
        </div>
      </div>
    </main>
  )
}
