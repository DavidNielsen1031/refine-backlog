const AGENTS = [
  { name: "Cursor", icon: "⊕" },
  { name: "Codex", icon: "◈" },
  { name: "Claude Code", icon: "◆" },
  { name: "Devin", icon: "◉" },
  { name: "Copilot", icon: "◇" },
]

const API_EXAMPLE = `POST https://speclint.ai/api/lint
x-license-key: sk_live_...
Content-Type: application/json

{
  "items": ["Fix mobile Safari login failure — users cannot log in via mobile Safari after deployment"]
}

// Response
{
  "items": [{
    "title": "Fix mobile Safari login failure",
    "problem": "Users cannot log in via mobile Safari after deployment",
    "acceptanceCriteria": [
      "User can log in on Safari iOS 14+",
      "No console errors during auth"
    ],
    "estimate": "S",
    "priority": "HIGH — blocks core functionality",
    "tags": ["bug", "critical", "mobile"],
    "completeness_score": 75,
    "agent_ready": true,
    "breakdown": {
      "has_measurable_outcome": false,
      "has_testable_criteria": true,
      "has_constraints": true,
      "no_vague_verbs": true,
      "has_definition_of_done": true
    }
  }],
  "summary": { "average_score": 75, "agent_ready_count": 1, "total_count": 1 }
}`

export function ForAIAgentsSection() {
  return (
    <section className="bg-[#080808] py-24 border-b border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="text-emerald-400 font-mono text-sm mb-3">// built for the agent era</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              The spec quality layer your agent pipeline is missing.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              AI coding agents are only as good as what you give them. The model isn&apos;t the bottleneck — the spec is. Speclint sits at the front of your pipeline, before any token is spent, to verify the input is worth running.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  label: "llms.txt compatible",
                  desc: "Speclint publishes a machine-readable API contract at /llms.txt for agent discovery",
                },
                {
                  label: "OpenAPI schema at /openapi.yaml",
                  desc: "Integrate with any orchestration layer in minutes",
                },
                {
                  label: "MCP server available",
                  desc: "Mount Speclint as a tool inside Claude Desktop, Cursor, or any MCP host",
                },
              ].map((item) => (
                <div key={item.label} className="border-l-2 border-emerald-500/40 pl-4">
                  <div className="text-white text-sm font-semibold font-mono">{item.label}</div>
                  <div className="text-zinc-500 text-sm mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {AGENTS.map((a) => (
                <div key={a.name} className="flex items-center gap-1.5 bg-[#111] border border-[#222] rounded px-3 py-1.5">
                  <span className="text-emerald-400 text-xs">{a.icon}</span>
                  <span className="text-zinc-300 text-xs font-mono">{a.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: API response */}
          <div>
            <div className="bg-[#0d0d0d] border border-[#222] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222] bg-[#0a0a0a]">
                <span className="text-zinc-500 text-xs font-mono">POST /api/lint — response</span>
              </div>
              <pre className="p-5 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed">
                {API_EXAMPLE}
              </pre>
            </div>
            {/* suggestion field callout */}
            <div className="mt-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="text-emerald-400 text-sm shrink-0">↑</span>
              <div>
                <span className="text-emerald-400 font-mono text-xs font-semibold">suggestion</span>
                <span className="text-zinc-400 text-xs ml-2">— Speclint tells you exactly what to add. Not just a score, a fix.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
