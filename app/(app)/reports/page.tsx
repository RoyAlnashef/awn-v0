import Link from "next/link"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/page-shell"
import { MemberReportsTable } from "@/components/reports/member-reports-table"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { listMemberReports } from "@/lib/moderation/actions"
import { findNavItem } from "@/lib/nav"

const item = findNavItem("/reports")!

export default async function ReportsPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  const result = await listMemberReports()

  return (
    <PageShell
      title={item.title}
      description={item.description}
      actions={
        <>
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={<Link href="/users" />}
          >
            Users
          </Button>
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={<Link href="/invites" />}
          >
            Invites
          </Button>
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={<Link href="/applications" />}
          >
            Applications
          </Button>
        </>
      }
    >
      <MemberReportsTable
        initialReports={result.ok ? result.reports : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
