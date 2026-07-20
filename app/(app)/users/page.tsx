import { PageShell } from "@/components/page-shell"
import { UsersTable } from "@/components/users/users-table"
import { adminNav } from "@/lib/nav"
import { listUsers } from "@/lib/users/actions"

const item = adminNav.find((i) => i.href === "/users")!

export default async function UsersPage() {
  const result = await listUsers()

  return (
    <PageShell title={item.title} description={item.description}>
      <UsersTable
        initialUsers={result.users}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
