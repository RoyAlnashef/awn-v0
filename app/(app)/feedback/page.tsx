import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/feedback")!

export default function FeedbackPage() {
  return <PageShell title={item.title} description={item.description} />
}
