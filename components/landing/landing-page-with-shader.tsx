import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { MeshGradientBackground } from "@/components/landing/mesh-gradient-background"

export function LandingPageWithShader() {
  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <MeshGradientBackground />
      <LandingHeader />
      <main className="relative z-10 flex flex-1 flex-col justify-center">
        <LandingHero />
      </main>
      <LandingFooter />
    </div>
  )
}
