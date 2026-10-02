import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { CommunityReportsLayoutShell } from "@/components/reports/community-reports-layout-shell"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { findNavItem } from "@/lib/nav"

const item = findNavItem("/community-reports")!

export default async function CommunityReportsLayout({
  children,
}: {
  children: ReactNode
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  return (
    <CommunityReportsLayoutShell
      title={item.title}
      description={item.description}
    >
      {children}
    </CommunityReportsLayoutShell>
  )
}
