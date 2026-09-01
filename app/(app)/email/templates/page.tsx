import { EmailLayoutShell } from "@/components/email/email-layout-shell"
import { TemplatesPageContent } from "@/components/email/templates/templates-page-content"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/email")!

export default function EmailTemplatesPage() {
  return (
    <EmailLayoutShell title={item.title} description={item.description}>
      <TemplatesPageContent />
    </EmailLayoutShell>
  )
}
