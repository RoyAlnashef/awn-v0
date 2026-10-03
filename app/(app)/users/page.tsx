import Link from "next/link"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { InviteUserDialog } from "@/components/users/invite-user-dialog"
import { UsersTable } from "@/components/users/users-table"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { adminNav } from "@/lib/nav"
import { listUsers } from "@/lib/users/actions"

const item = adminNav.find((i) => i.href === "/users")!

export default async function UsersPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  const result = await listUsers()

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
          <InviteUserDialog disabled={!result.ok} />
        </>
      }
    >
      <UsersTable
        initialUsers={result.users}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
