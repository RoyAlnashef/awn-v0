import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/groups")!

export default function GroupsPage() {
  return <PageShell title={item.title} description={item.description} />
}
