import type { ReactNode } from "react"

const DEFAULT_FOOTER =
  "Invite-only. Need access? Ask a member for an invite."

export function AuthShell({
  title = "A Wright Network",
  subtitle = "Touring crew, connected. Sign in to continue.",
  children,
  footer = DEFAULT_FOOTER,
}: {
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.08_40_/_0.35),transparent_55%),radial-gradient(ellipse_at_bottom,oklch(0.22_0.04_250_/_0.4),transparent_50%)]"
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-heading text-3xl font-medium tracking-tight text-balance">
            {title}
          </p>
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
