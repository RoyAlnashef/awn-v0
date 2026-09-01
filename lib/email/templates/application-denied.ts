import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSubject,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export function applicationDeniedHtml({
  note,
  theme = "dark",
  content,
}: {
  note?: string | null
  theme?: EmailTheme
  content?: EmailTemplateContent
}) {
  return renderTemplateHtml(
    "application-denied",
    content ?? getTemplateDefaults("application-denied"),
    { note, theme },
  )
}

export function applicationDeniedSubject(content?: EmailTemplateContent) {
  return (content ?? getTemplateDefaults("application-denied")).subject
}
