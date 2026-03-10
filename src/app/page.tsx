import { HeroSection } from '@/components/hero-section'
import { HowItWorksSection } from '@/components/how-it-works'
import { SpecTesterSection } from '@/components/spec-tester'
import { ScoreBreakdownSection } from '@/components/score-breakdown'
import { RemediationSection } from '@/components/remediation-section'
import { AgentPipelineSection } from '@/components/agent-pipeline'
import { CustomerZeroSection } from '@/components/customer-zero'
import { GitHubActionSection } from '@/components/github-action'
import { PricingSection } from '@/components/pricing-section'
import { FAQSection } from '@/components/faq-section'
import { ForAIAgentsSection } from '@/components/for-ai-agents'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <HeroSection />
      <div id="how-it-works" className="scroll-mt-16">
        <HowItWorksSection />
      </div>
      <div id="try-it" className="scroll-mt-16">
        <SpecTesterSection />
      </div>
      <div id="scoring" className="scroll-mt-16">
        <ScoreBreakdownSection />
      </div>
      <RemediationSection />
      <AgentPipelineSection />
      <CustomerZeroSection />
      <GitHubActionSection />
      <div id="pricing" className="scroll-mt-16">
        <PricingSection />
      </div>
      <FAQSection />
      <ForAIAgentsSection />
      <Footer />
    </main>
  )
}
