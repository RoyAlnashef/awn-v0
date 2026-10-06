import { Suspense } from "react"
import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { safeRedirectPath } from "@/lib/auth/safe-redirect"
import { suspendedLoginSearchParams } from "@/lib/auth/suspended-message"
import { createClient } from "@/lib/supabase/server"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const sessionUser = await getSessionUser()
  if (sessionUser) {
    if (sessionUser.isSuspended) {
      const supabase = await createClient()
      await supabase.auth.signOut()
      redirect(`/login?${suspendedLoginSearchParams()}`)
    }
    if (!sessionUser.isApproved) {
      redirect("/pending")
    }
    redirect(safeRedirectPath(params.next))
  }

  const errorMessage = params.error
    ? decodeURIComponent(params.error)
    : null

  return (
    <AuthShell showAppIcon title="Sign In" subtitle="">
      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded-xl bg-muted/40" />
        }
      >
        <LoginForm initialError={errorMessage} />
      </Suspense>
    </AuthShell>
  )
}
