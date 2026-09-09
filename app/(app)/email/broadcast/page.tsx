import { EmailLayoutShell } from "@/components/email/email-layout-shell"
import { BroadcastPageContent } from "@/components/email/broadcast/broadcast-page-content"
import { listBroadcastHistory } from "@/lib/email/broadcast-actions"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/email")!

export default async function EmailBroadcastPage() {
  const result = await listBroadcastHistory()

  return (
    <EmailLayoutShell title={item.title} description={item.description}>
      <BroadcastPageContent
        initialHistory={result.ok ? result.data.history : []}
        historyError={result.ok ? null : result.error}
      />
    </EmailLayoutShell>
  )
}
