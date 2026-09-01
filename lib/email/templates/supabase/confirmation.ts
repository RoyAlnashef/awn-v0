import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSupabaseHtml,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export const confirmationSubject =
  getTemplateDefaults("supabase-confirmation").subject

export function confirmationSupabaseHtml(
  content?: EmailTemplateContent,
): string {
  return renderTemplateSupabaseHtml(
    "supabase-confirmation",
    content ?? getTemplateDefaults("supabase-confirmation"),
  )
}

export function confirmationPreviewHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
): string {
  return renderTemplateHtml(
    "supabase-confirmation",
    content ?? getTemplateDefaults("supabase-confirmation"),
    { theme },
  )
}
