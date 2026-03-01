export function RemediationSection() {
  const steps = [
    {
      number: "01",
      title: "Spec scores low",
      description: (
        <>
          Speclint posts a structured comment listing exactly what&apos;s missing and a concrete{" "}
          <span className="font-mono text-emerald-400 text-xs">suggestion</span> for what to add.
          No ambiguity — it tells you the fix, not just the problem.
        </>
      ),
      code: 'comment: "Missing: has_definition_of_done\nsuggestion: Add which report types,\n  max rows, and file format accepted"',
    },
    {
      number: "02",
      title: "Dev edits the issue",
      description:
        "The fix is usually one paragraph. Add the missing outcome, tighten the ACs, add constraints. It's spec work, not code work.",
      code: "# Edit the GitHub issue body\n# Add the missing context\n# Usually < 5 minutes",
    },
    {
      number: "03",
      title: "Auto re-lint",
      description: (
        <>
          The action fires on{" "}
          <span className="font-mono text-emerald-400 text-xs">issues.edited</span> too — your
          fix is scored automatically. No manual re-run, no waiting for CI.
        </>
      ),
      code: "on:\n  issues:\n    types: [opened, edited]  # ← re-lints on edit",
    },
    {
      number: "04",
      title: "Spec passes",
      description: (
        <>
          Issue gets labeled{" "}
          <span className="font-mono text-emerald-400 text-xs">agent_ready: true</span> and
          enters the agent queue. Total time: ~2 minutes.
        </>
      ),
      code: 'label("agent_ready: true")\n// Cursor, Codex, Claude Code\n// can now pick it up',
    },
  ]

  return (
    <section className="bg-[#0a0a0a] py-24 border-b border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-emerald-400 font-mono text-sm mb-3">// what happens when specs fail</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            The remediation loop.
          </h2>
          <p className="text-zinc-400 max-w-2xl leading-relaxed">
            Yes, Speclint will block bad specs. That&apos;s the point.{" "}
            <span className="text-white">A 2-minute edit now saves a 2-hour wrong implementation later.</span>
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line between steps (not on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-emerald-500/30 to-transparent z-10 translate-x-3" />
              )}
              <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg p-5 h-full hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-emerald-400 font-mono text-xs font-bold">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-4">{step.description}</p>
                <pre className="bg-[#111] border border-[#222] rounded px-3 py-2 text-[10px] text-emerald-300 font-mono overflow-x-auto leading-relaxed">
                  {step.code}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Loop indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#1a1a1a]" />
          <div className="flex items-center gap-2 text-zinc-600 text-xs font-mono">
            <span className="text-emerald-500">↺</span>
            <span>loop until agent_ready: true</span>
          </div>
          <div className="flex-1 h-px bg-[#1a1a1a]" />
        </div>

        {/* Coming soon callout */}
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] border-dashed rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              coming soon
            </span>
          </div>
          <div>
            <div className="text-zinc-300 text-sm font-semibold">AI-assisted rewrite</div>
            <div className="text-zinc-500 text-xs mt-0.5">
              Speclint will offer to fix the spec for you — not just flag it. One click to a passing spec.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
