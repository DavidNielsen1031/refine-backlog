import Link from "next/link"

const trustPoints = [
  {
    icon: "✅",
    title: "No storage.",
    description: "We don't store your backlog content. Processed in memory, returned to your browser.",
  },
  {
    icon: "🔒",
    title: "Encrypted.",
    description: "All data encrypted in transit via TLS.",
  },
  {
    icon: "🚫",
    title: "No training.",
    description: "Your data is never used to train AI models. Anthropic's commercial API contractually prohibits it.",
  },
  {
    icon: "⚠️",
    title: "Not for sensitive data.",
    description: "Don't submit PII, health records, or credentials. This tool is for backlog items.",
  },
]

export function TrustSection() {
  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold font-space-grotesk mb-4">
          Your Data Stays Yours
        </h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          We built Refine Backlog with privacy as a default, not an afterthought.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 text-left mb-8">
          {trustPoints.map((point, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card/50 border border-border/50"
            >
              <div className="text-2xl mb-3">{point.icon}</div>
              <h3 className="font-semibold mb-1">{point.title}</h3>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            Read our Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="text-emerald-400 hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </section>
  )
}
