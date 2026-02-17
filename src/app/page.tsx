import { BacklogGroomer } from '@/components/backlog-refiner'
import { HeroSection } from '@/components/hero-section'
import { SocialProofSection } from '@/components/social-proof-section'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { ExampleSection } from '@/components/example-section'
import { FeaturesSection } from '@/components/features-section'
import { PricingSection } from '@/components/pricing-section'
import { FAQSection } from '@/components/faq-section'
import { TrustSection } from '@/components/trust-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="relative">
        <HeroSection />
        <SocialProofSection />
        <HowItWorksSection />
        <BacklogGroomer />
        <ExampleSection />
        <FeaturesSection />
        <PricingSection />
        <TrustSection />
        <FAQSection />
        <Footer />
      </div>
    </main>
  )
}
