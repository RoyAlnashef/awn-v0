import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSupabaseHtml,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export const recoverySubject = getTemplateDefaults("supabase-recovery").subject

export function recoverySupabaseHtml(content?: EmailTemplateContent): string {
  return renderTemplateSupabaseHtml(
    "supabase-recovery",
    content ?? getTemplateDefaults("supabase-recovery"),
  )
}

export function recoveryPreviewHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
): string {
  return renderTemplateHtml(
    "supabase-recovery",
    content ?? getTemplateDefaults("supabase-recovery"),
    { theme },
  )
}
