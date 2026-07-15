import { PageShell } from "@/components/page-shell"
import { UsersTable } from "@/components/users/users-table"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/users")!

export default function UsersPage() {
  return (
    <PageShell title={item.title} description={item.description}>
      <UsersTable />
    </PageShell>
  )
}
