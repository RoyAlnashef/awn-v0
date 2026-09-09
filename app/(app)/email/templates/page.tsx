import { EmailLayoutShell } from "@/components/email/email-layout-shell"
import { TemplatesPageContent } from "@/components/email/templates/templates-page-content"
import { getAllTemplateContent, type AllTemplateContentMap } from "@/lib/email/template-actions"
import { EMAIL_TEMPLATE_IDS, getTemplateDefaults } from "@/lib/email/template-content"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/email")!

function fallbackContent(): AllTemplateContentMap {
  return Object.fromEntries(
    EMAIL_TEMPLATE_IDS.map((id) => [
      id,
      {
        ...getTemplateDefaults(id),
        isCustomized: false,
        updatedAt: null,
      },
    ]),
  ) as AllTemplateContentMap
}

export default async function EmailTemplatesPage() {
  const contentResult = await getAllTemplateContent()
  const initialContent = contentResult.ok
    ? contentResult.data
    : fallbackContent()

  return (
    <EmailLayoutShell
      title={item.title}
      description={item.description}
      showMobilePagePreview={false}
    >
      <div className="w-full overflow-hidden">
        <TemplatesPageContent initialContent={initialContent} />
      </div>
    </EmailLayoutShell>
  )
}
