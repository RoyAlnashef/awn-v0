import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/email")!

export default function EmailPage() {
  return <PageShell title={item.title} description={item.description} />
}
