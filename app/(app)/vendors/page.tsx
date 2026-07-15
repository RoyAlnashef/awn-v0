import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/vendors")!

export default function VendorsPage() {
  return <PageShell title={item.title} description={item.description} />
}
