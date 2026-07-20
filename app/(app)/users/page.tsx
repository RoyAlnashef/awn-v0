import { PageShell } from "@/components/page-shell"
import { InviteUserDialog } from "@/components/users/invite-user-dialog"
import { UsersTable } from "@/components/users/users-table"
import { adminNav } from "@/lib/nav"
import { listUsers } from "@/lib/users/actions"

const item = adminNav.find((i) => i.href === "/users")!

export default async function UsersPage() {
  const result = await listUsers()

  return (
    <PageShell
      title={item.title}
      description={item.description}
      actions={<InviteUserDialog disabled={!result.ok} />}
    >
      <UsersTable
        initialUsers={result.users}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
