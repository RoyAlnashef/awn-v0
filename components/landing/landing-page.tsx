import { LandingBackground } from "@/components/landing/landing-background"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingOperate } from "@/components/landing/landing-operate"

export function LandingPage() {
  return (
    <div className="relative min-h-svh">
      <LandingBackground />
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingOperate />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
