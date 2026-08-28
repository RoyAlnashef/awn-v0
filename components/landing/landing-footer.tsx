import Link from "next/link"

import { landingContent } from "@/components/landing/content"

export function LandingFooter() {
  const { brand, footer } = landingContent

  return (
    <footer className="relative z-10 border-t border-border/50 px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <Link href="/" className="font-medium text-primary">
          {brand}
        </Link>

        <p className="text-center text-pretty">
          {footer.copyright} · {footer.legal}
        </p>

        <a
          href={`mailto:${footer.email}`}
          className="transition-colors hover:text-foreground"
        >
          {footer.email}
        </a>
      </div>
    </footer>
  )
}
