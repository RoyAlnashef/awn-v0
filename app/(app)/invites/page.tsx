import { redirect } from "next/navigation"

import { AdminInvitesTable } from "@/components/invites/admin-invites-table"
import { InvitePopoverTrigger } from "@/components/invites/invite-popover"
import { PageShell } from "@/components/page-shell"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { listAllInvites } from "@/lib/invites/actions"
import { findNavItem } from "@/lib/nav"

const item = findNavItem("/invites")!

export default async function InvitesPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  const result = await listAllInvites()

  return (
    <PageShell
      title={item.title}
      description={item.description}
      actions={<InvitePopoverTrigger />}
    >
      <AdminInvitesTable
        initialInvites={result.ok ? result.invites : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
