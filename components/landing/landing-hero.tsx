import Link from "next/link"

import { landingContent } from "@/components/landing/content"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  const { hero } = landingContent

  return (
    <section className="relative z-10 flex flex-col items-center px-6 py-24 text-center sm:px-8 sm:py-32">
      <h1 className="max-w-2xl font-heading text-4xl font-medium tracking-tight text-balance sm:text-5xl">
        {hero.title}
      </h1>
      <p className="mt-6 max-w-xl text-sm text-muted-foreground text-pretty sm:text-base">
        {hero.subtitle}
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" type="button" aria-disabled className="min-w-40">
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

      <div className="mt-16 flex flex-col items-center gap-8 sm:flex-row sm:gap-16">
        {hero.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="font-heading text-4xl font-medium">{stat.value}</span>
            <span className="text-xs tracking-widest text-muted-foreground uppercase">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-12 text-xs tracking-widest text-muted-foreground uppercase">
        — {hero.tagline} —
      </p>
    </section>
  )
}
