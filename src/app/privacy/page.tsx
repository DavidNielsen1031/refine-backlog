import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — Refine Backlog",
  description: "How Refine Backlog handles your data. Plain English, no legalese.",
  alternates: {
    canonical: "https://refinebacklog.com/privacy",
  },
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-6 lg:px-8 py-24">
        <Link href="/" className="text-emerald-400 hover:underline text-sm mb-8 inline-block">
          ← Back to Refine Backlog
        </Link>

        <header className="mb-12">
          <p className="text-sm text-muted-foreground mb-4">Effective February 17, 2026</p>
          <h1 className="text-4xl font-bold font-space-grotesk mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Plain English explanation of how Refine Backlog handles your data. Operated by Perpetual Agility LLC.
          </p>
        </header>

        <div className="prose prose-invert prose-emerald max-w-none space-y-6">
          <h2 className="text-2xl font-semibold mt-12 mb-4">What We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">If you use the free tier:</strong> your IP address, used solely for rate limiting. It&apos;s stored for 24 hours, then automatically deleted.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">If you subscribe:</strong> your email address, payment information (processed by Stripe — we never see your full card number), license key, and plan tier.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Usage metadata:</strong> request counts, timestamps, and tier. This helps us enforce rate limits and improve the service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What We Do NOT Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">We do not store your backlog content.</strong> Your refinement inputs and outputs are processed in memory and returned to your browser. Nothing is written to our database.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">We do not use cookies for tracking.</strong> No analytics cookies. No advertising cookies.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Third-Party Data Processing</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Anthropic</strong> (AI provider): Your backlog items are sent to Anthropic&apos;s Claude API for refinement. Anthropic retains API logs for 7 days for trust and safety monitoring, then automatically deletes them. Anthropic does not use API data for model training.{" "}
            <a href="https://privacy.claude.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Anthropic Privacy</a>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Stripe</strong> (payments): Processes subscription payments. Stripe&apos;s privacy policy applies to payment data.{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Stripe Privacy</a>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Vercel</strong> (hosting): Hosts the application. Vercel processes requests through their edge network but does not persist request/response bodies. Function logs are retained for up to 1 day.{" "}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Vercel Privacy</a>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Upstash</strong> (database): Stores rate limit counters and subscription data. No backlog content is stored in Upstash. Data encrypted at rest (AES-256) and in transit (TLS).{" "}
            <a href="https://upstash.com/trust" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Upstash Trust</a>
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Rate limit counters:</strong> 24 hours</li>
            <li><strong className="text-foreground">Subscription data:</strong> until you cancel or request deletion</li>
            <li><strong className="text-foreground">Anthropic API logs:</strong> 7 days (managed by Anthropic)</li>
            <li><strong className="text-foreground">Vercel function logs:</strong> up to 1 day</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Encryption</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>All data in transit is encrypted via TLS 1.3</li>
            <li>Subscription data at rest is encrypted via Upstash&apos;s AES-256</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can request deletion of your subscription data by emailing us. Free tier users have no persistent data to delete — rate limits expire automatically.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Email: <a href="mailto:privacy@refinebacklog.com" className="text-emerald-400 hover:underline">privacy@refinebacklog.com</a>{" "}
            (or <a href="mailto:david@perpetualagility.com" className="text-emerald-400 hover:underline">david@perpetualagility.com</a> as fallback)
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Changes</h2>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;ll update this page when our practices change. Last updated: February 17, 2026.
          </p>
        </div>
      </article>
    </main>
  )
}
