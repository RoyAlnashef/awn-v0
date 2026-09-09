import Link from "next/link"

import { landingContent } from "@/components/landing/content"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  const { hero } = landingContent

  return (
    <section className="relative z-10 flex flex-col items-center px-6 py-24 text-center sm:px-8 sm:py-32">
      <h1 className="max-w-2xl font-heading text-h1 font-medium tracking-tight text-balance">
        {hero.title}
      </h1>
      <p className="mt-6 max-w-xl text-body-sm text-muted-foreground text-pretty sm:text-body">
        {hero.subtitle}
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          size="lg"
          className="min-w-40"
          nativeButton={false}
          render={<Link href="/request-access" />}
        >
          {hero.primaryCta}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="min-w-40"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          {hero.secondaryCta}
        </Button>
      </div>

      <p className="mt-10 text-body-mini tracking-widest text-muted-foreground uppercase">
        — {hero.tagline} —
      </p>
    </section>
  )
}
