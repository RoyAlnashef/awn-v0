import { redirect } from "next/navigation"

import { PendingStatus } from "@/components/pending/pending-status"
import { AuthShell } from "@/components/auth/auth-shell"
import { getApplicationStatus } from "@/lib/applications/actions"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function PendingPage() {
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    redirect("/login?next=/pending")
  }

  if (sessionUser.isApproved) {
    redirect("/now")
  }

  const result = await getApplicationStatus()

  if (!result.ok) {
    return (
      <AuthShell subtitle="Application status unavailable">
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </AuthShell>
    )
  }

  return <PendingStatus application={result.application} />
}
