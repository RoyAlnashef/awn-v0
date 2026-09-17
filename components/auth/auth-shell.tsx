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
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
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
