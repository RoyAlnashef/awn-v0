import { redirect } from "next/navigation"

import { ApplyForm } from "@/components/apply/apply-form"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function RequestAccessPage() {
  const user = await getSessionUser()

  if (user) {
    redirect(user.isApproved ? "/now" : "/pending")
  }

  return <ApplyForm mode="request_access" />
}
