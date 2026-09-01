import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSubject,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export function inviteEmailHtml({
  inviterName,
  token,
  origin,
  theme = "dark",
  content,
}: {
  inviterName: string
  token: string
  origin?: string
  theme?: EmailTheme
  content?: EmailTemplateContent
}) {
  return renderTemplateHtml("invite", content ?? getTemplateDefaults("invite"), {
    inviterName,
    token,
    origin,
    theme,
  })
}

export function inviteEmailSubject(
  inviterName: string,
  content?: EmailTemplateContent,
) {
  return renderTemplateSubject(
    "invite",
    content ?? getTemplateDefaults("invite"),
    { inviterName },
  )
}
