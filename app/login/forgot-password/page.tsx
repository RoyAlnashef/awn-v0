import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function ForgotPasswordPage() {
  const sessionUser = await getSessionUser()
  if (sessionUser) {
    redirect("/now")
  }

  return (
    <AuthShell
      subtitle="We'll email you a link to reset your password."
      footer={null}
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
