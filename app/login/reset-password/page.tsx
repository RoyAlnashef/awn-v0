import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { createClient } from "@/lib/supabase/server"

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <AuthShell
        subtitle="This reset link is invalid or has expired."
        footer={null}
      >
        <div className="grid gap-4 text-center">
          <p className="text-sm text-muted-foreground text-pretty">
            Request a new password reset link and try again.
          </p>
          <Link
            href="/login/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Request a new link
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell subtitle="Set your password to continue." footer={null}>
      <ResetPasswordForm />
    </AuthShell>
  )
}
