import type { ReactNode } from "react"

import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"

export function LandingPage({ shader }: { shader: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col bg-neutral-950">
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        {shader}
      </div>
      <LandingHeader />
      <main className="relative z-10 flex flex-1 flex-col justify-center">
        <LandingHero />
      </main>
      <LandingFooter />
    </div>
  )
}
