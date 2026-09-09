import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getMemberProfileWithTourCredits } from "@/lib/account/profile-actions"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { AccountLayoutShell } from "@/components/account/account-layout-shell"

export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  const [profileData, sessionUser] = await Promise.all([
    getMemberProfileWithTourCredits(),
    getSessionUser(),
  ])

  if (!profileData || !sessionUser) {
    redirect("/login")
  }

  return (
    <AccountLayoutShell
      initialProfile={profileData.profile}
      initialTourCredits={profileData.tourCredits}
      userId={profileData.profile.id}
      initialOnline={sessionUser.online}
    >
      {children}
    </AccountLayoutShell>
  )
}
