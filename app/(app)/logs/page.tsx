import { redirect } from "next/navigation"

import { LogsTable } from "@/components/logs/logs-table"
import { PageShell } from "@/components/page-shell"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { listErrorLogs } from "@/lib/logs/actions"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/logs")!

export default async function LogsPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  const result = await listErrorLogs()

  return (
    <PageShell title={item.title} description={item.description}>
      <LogsTable
        initialLogs={result.ok ? result.logs : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
