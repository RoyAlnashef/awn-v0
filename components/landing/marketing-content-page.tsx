import type { ReactNode } from "react"

import { LandingBackground } from "@/components/landing/landing-background"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"

type MarketingContentPageProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function MarketingContentPage({
  title,
  subtitle,
  children,
}: MarketingContentPageProps) {
  return (
    <div className="relative min-h-svh">
      <LandingBackground />
      <LandingHeader />
      <main className="relative z-10 px-6 py-16 sm:px-8 sm:py-24">
        <article className="mx-auto max-w-3xl">
          <header className="mb-12">
            <h1 className="font-heading text-h1 font-medium tracking-tight text-balance">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 text-body-sm text-muted-foreground text-pretty sm:text-body">
                {subtitle}
              </p>
            ) : null}
          </header>
          {children}
        </article>
      </main>
      <LandingFooter />
    </div>
  )
}
