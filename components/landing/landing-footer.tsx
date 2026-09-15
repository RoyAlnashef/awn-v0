import Link from "next/link"

import { landingContent } from "@/components/landing/content"
import { LandingNavLinks } from "@/components/landing/landing-nav-links"

export function LandingFooter() {
  const { brand, footer } = landingContent

  return (
    <footer className="relative z-10 flex flex-col items-center gap-4 border-t border-border/50 px-6 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8 sm:text-left">
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-8">
        <Link
          href="/"
          className="font-sans text-lg font-medium leading-none tracking-tight text-foreground"
        >
          {brand}
        </Link>
        <LandingNavLinks />
      </div>

      <p className="shrink-0 whitespace-nowrap sm:ml-auto sm:text-right">{footer.copyright}</p>
    </footer>
  )
}
