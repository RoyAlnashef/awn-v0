import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

import { landingContent } from "@/components/landing/content"

const DEFAULT_FOOTER =
  "Invite-only. Need access? Ask a member for an invite."

export function AuthShell({
  title = "A Wright Network",
  subtitle = "Sign in to continue.",
  showAppIcon = false,
  children,
  footer = DEFAULT_FOOTER,
}: {
  title?: string
  subtitle?: string
  showAppIcon?: boolean
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_35%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom,oklch(0.22_0.04_250/0.4),transparent_50%)]"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          {showAppIcon ? (
            <Link
              href="/"
              className="mb-6 block transition-opacity hover:opacity-80"
            >
              <Image
                src="/apple-touch-icon.png"
                alt={landingContent.brand}
                width={180}
                height={180}
                priority
                className="size-18 rounded-[22%] shadow-lg sm:size-20"
              />
            </Link>
          ) : null}
          <Link
            href="/"
            className="font-heading text-h2 font-medium tracking-tight text-balance transition-opacity hover:opacity-80"
          >
            {title}
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
          {children}
        </div>

        {footer ? (
          <p className="mt-6 text-center text-xs text-muted-foreground text-pretty">
            {footer}
          </p>
        ) : null}
      </div>
    </div>
  )
}
