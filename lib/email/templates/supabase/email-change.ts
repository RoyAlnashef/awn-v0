import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSupabaseHtml,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export const emailChangeSubject =
  getTemplateDefaults("supabase-email-change").subject

export function emailChangeSupabaseHtml(content?: EmailTemplateContent): string {
  return renderTemplateSupabaseHtml(
    "supabase-email-change",
    content ?? getTemplateDefaults("supabase-email-change"),
  )
}

export function emailChangePreviewHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
): string {
  return renderTemplateHtml(
    "supabase-email-change",
    content ?? getTemplateDefaults("supabase-email-change"),
    { theme },
  )
}
