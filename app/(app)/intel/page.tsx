import { PageShell } from "@/components/page-shell"
import { mainNav } from "@/lib/nav"

const item = mainNav.find((i) => i.href === "/intel")!

export default function IntelPage() {
  return <PageShell title={item.title} description={item.description} />
}
