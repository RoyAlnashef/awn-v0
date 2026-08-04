import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getMemberProfile } from "@/lib/account/profile-actions"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { AccountLayoutShell } from "@/components/account/account-layout-shell"

export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  const [profile, sessionUser] = await Promise.all([
    getMemberProfile(),
    getSessionUser(),
  ])

  if (!profile || !sessionUser) {
    redirect("/login")
  }

  return (
    <AccountLayoutShell
      initialProfile={profile}
      userId={profile.id}
      initialOnline={sessionUser.online}
    >
      {children}
    </AccountLayoutShell>
  )
}
