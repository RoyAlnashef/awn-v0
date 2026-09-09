import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSubject,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export function applicationConfirmationHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
) {
  return renderTemplateHtml(
    "application-confirmation",
    content ?? getTemplateDefaults("application-confirmation"),
    { theme },
  )
}

export function applicationConfirmationSubject(content?: EmailTemplateContent) {
  return (content ?? getTemplateDefaults("application-confirmation")).subject
}
