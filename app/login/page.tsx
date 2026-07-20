import { Suspense } from "react"
import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { safeRedirectPath } from "@/lib/auth/safe-redirect"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const sessionUser = await getSessionUser()
  if (sessionUser) {
    redirect(safeRedirectPath(params.next))
  }

  const errorMessage = params.error
    ? decodeURIComponent(params.error)
    : null

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.08_40_/_0.35),transparent_55%),radial-gradient(ellipse_at_bottom,oklch(0.22_0.04_250_/_0.4),transparent_50%)]"
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-heading text-3xl font-medium tracking-tight text-balance">
            A. Wright Network
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Touring crew, connected. Sign in to continue.
          </p>
        </div>

        <div className="rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-xl bg-muted/40" />
            }
          >
            <LoginForm initialError={errorMessage} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground text-pretty">
          Invite-only. Need access? Ask a member for an invite.
        </p>
      </div>
    </div>
  )
}
