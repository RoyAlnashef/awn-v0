import Image from "next/image"
import Link from "next/link"

import { landingContent } from "@/components/landing/content"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  const { brand, hero } = landingContent

  return (
    <section className="relative flex flex-col items-center px-6 py-16 text-center sm:px-8">
      <Image
        src="/apple-touch-icon.png"
        alt={brand}
        width={180}
        height={180}
        priority
        className="mb-8 size-18 rounded-[22%] shadow-lg sm:size-20"
      />

      <h1 className="max-w-2xl font-heading text-h2 sm:text-h1 font-medium text-foreground tracking-tight text-balance">
        {hero.title}
      </h1>

      <p className="mt-4 text-body-sm text-muted-foreground">{hero.subtitle}</p>

      <div className="mt-10 flex flex-col items-center gap-8">
        <Button
          size="lg"
          className="min-w-40"
          nativeButton={false}
          render={<Link href="/request-access" />}
        >
          {hero.primaryCta}
        </Button>

        <p className="text-body-sm text-muted-foreground">{hero.tagline}</p>
      </div>
    </section>
  )
}
