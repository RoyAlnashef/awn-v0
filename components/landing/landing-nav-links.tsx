import Link from "next/link"

import { landingContent } from "@/components/landing/content"
import { cn } from "@/lib/utils"

type LandingNavLinksProps = {
  className?: string
}

export function LandingNavLinks({ className }: LandingNavLinksProps) {
  const { navLinks } = landingContent

  return (
    <nav
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:w-auto sm:justify-start",
        className,
      )}
    >
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="whitespace-nowrap text-xs font-medium tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
