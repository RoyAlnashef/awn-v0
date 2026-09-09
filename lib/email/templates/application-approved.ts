import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSubject,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export function applicationApprovedHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
) {
  return renderTemplateHtml(
    "application-approved",
    content ?? getTemplateDefaults("application-approved"),
    { theme },
  )
}

export function applicationApprovedSubject(content?: EmailTemplateContent) {
  return (content ?? getTemplateDefaults("application-approved")).subject
}
