"use client"
import Link from "next/link"
import { Terminal, Bot, Globe } from "lucide-react"

const integrations = [
  {
    icon: Globe,
    label: "Web UI",
    description: "Refine items manually in the browser.",
    code: "refinebacklog.com",
    href: "/#refiner",
    cta: "Try free →",
  },
  {
    icon: Bot,
    label: "MCP Server",
    description: "Works in Claude Desktop, Cursor, and any MCP-compatible client.",
    code: "npx refine-backlog-mcp",
    href: "https://www.npmjs.com/package/refine-backlog-mcp",
    cta: "npm →",
  },
  {
    icon: Terminal,
    label: "CLI",
    description: "Pipe into scripts, GitHub Actions, and CI pipelines. No LLM required.",
    code: "npx refine-backlog-cli --file backlog.txt",
    href: "https://github.com/DavidNielsen1031/refine-backlog-cli",
    cta: "GitHub →",
  },
]

export function IntegrationsSection() {
  return (
    <section className="py-20 px-6 border-t border-border/30">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-space-grotesk mb-3">Use It Your Way</h2>
          <p className="text-muted-foreground">
            Web UI, AI assistant, or automated pipeline — all hit the same API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {integrations.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-xl border border-border/50 bg-card/50 p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <code className="text-xs bg-black/30 border border-border/40 rounded-md px-3 py-2 text-emerald-300 font-mono block overflow-x-auto">
                  {item.code}
                </code>

                <Link
                  href={item.href}
                  className="text-sm text-emerald-400 hover:underline mt-auto"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {item.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
