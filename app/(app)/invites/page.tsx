import { redirect } from "next/navigation"

import { AdminInvitesTable } from "@/components/invites/admin-invites-table"
import { PageShell } from "@/components/page-shell"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { listAllInvites } from "@/lib/invites/actions"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/invites")!

export default async function InvitesPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  const result = await listAllInvites()

  return (
    <PageShell title={item.title} description={item.description}>
      <AdminInvitesTable
        initialInvites={result.ok ? result.invites : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
