import { landingContent } from "@/components/landing/content"
import { LandingNavLinks } from "@/components/landing/landing-nav-links"

export function LandingFooter() {
  const { footer } = landingContent

  return (
    <footer className="relative z-10 flex flex-col items-center gap-6 border-t border-border/50 px-6 py-6 text-center text-xs text-muted-foreground sm:px-8 sm:py-8">
      <LandingNavLinks />
      <p className="whitespace-nowrap">{footer.copyright}</p>
    </footer>
  )
}
