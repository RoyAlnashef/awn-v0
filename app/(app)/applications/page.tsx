import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/applications")!

export default function ApplicationsPage() {
  return <PageShell title={item.title} description={item.description} />
}
