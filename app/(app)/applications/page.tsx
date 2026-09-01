import { redirect } from "next/navigation"

import { ApplicationsTable } from "@/components/applications/applications-table"
import { PageShell } from "@/components/page-shell"
import { listApplications } from "@/lib/applications/actions"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { findNavItem } from "@/lib/nav"

const item = findNavItem("/applications")!

export default async function ApplicationsPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  const result = await listApplications()

  return (
    <PageShell title={item.title} description={item.description}>
      <ApplicationsTable
        initialApplications={result.ok ? result.applications : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
