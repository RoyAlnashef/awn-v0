import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getMemberProfile } from "@/lib/account/profile-actions"
import { AccountLayoutShell } from "@/components/account/account-layout-shell"

export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  const profile = await getMemberProfile()

  if (!profile) {
    redirect("/login")
  }

  return (
    <AccountLayoutShell initialProfile={profile} userId={profile.id}>
      {children}
    </AccountLayoutShell>
  )
}
