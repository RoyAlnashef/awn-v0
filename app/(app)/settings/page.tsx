import { PageShell } from "@/components/page-shell"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/settings")!

export default function SettingsPage() {
  return <PageShell title={item.title} description={item.description} />
}
