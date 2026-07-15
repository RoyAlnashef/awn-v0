import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/employers")!

export default function EmployersPage() {
  return <PageShell title={item.title} description={item.description} />
}
