import Link from "next/link"

import { landingContent } from "@/components/landing/content"
import { cn } from "@/lib/utils"

type LandingNavLinksProps = {
  className?: string
}

export function LandingNavLinks({ className }: LandingNavLinksProps) {
  const { navLinks } = landingContent

  return (
    <nav className={cn("flex items-center gap-3 sm:gap-6", className)}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-xs font-medium tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
