import Link from "next/link"

import { landingContent } from "@/components/landing/content"

export function LandingHeader() {
  const { brand, header } = landingContent

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-8">
      <Link
        href="/"
        className="font-sans text-lg font-medium tracking-tight text-foreground"
      >
        {brand}
      </Link>

      <nav className="flex items-center gap-4 sm:gap-6">
        {header.shaderLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="text-xs font-medium tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          {header.signIn}
        </Link>
      </nav>
    </header>
  )
}
