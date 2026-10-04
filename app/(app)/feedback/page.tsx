import { redirect } from "next/navigation"

import { FeedbackInbox } from "@/components/feedback/feedback-inbox"
import { PageShell } from "@/components/page-shell"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { listFeedback } from "@/lib/feedback/actions"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/feedback")!

export default async function FeedbackPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  const result = await listFeedback()

  return (
    <PageShell title={item.title} description={item.description}>
      <FeedbackInbox
        initialItems={result.items}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
