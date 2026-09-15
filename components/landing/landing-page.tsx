import { LandingBackground } from "@/components/landing/landing-background"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"

export function LandingPage() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <LandingBackground />
      <LandingHeader />
      <main className="flex flex-1 flex-col justify-center">
        <LandingHero />
      </main>
      <LandingFooter />
    </div>
  )
}
