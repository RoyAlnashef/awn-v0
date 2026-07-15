import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/invites")!

export default function InvitesPage() {
  return <PageShell title={item.title} description={item.description} />
}
