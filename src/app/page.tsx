import { BacklogGroomer } from '@/components/backlog-groomer'
import { HeroSection } from '@/components/hero-section'
import { ExampleSection } from '@/components/example-section'
import { FeaturesSection } from '@/components/features-section'
import { PricingSection } from '@/components/pricing-section'
import { FAQSection } from '@/components/faq-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="relative">
        <HeroSection />
        <BacklogGroomer />
        <ExampleSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <Footer />
      </div>
    </main>
  )
}