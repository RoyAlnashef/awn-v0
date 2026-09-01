import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSupabaseHtml,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export const reauthenticationSubject =
  getTemplateDefaults("supabase-reauthentication").subject

export function reauthenticationSupabaseHtml(
  content?: EmailTemplateContent,
): string {
  return renderTemplateSupabaseHtml(
    "supabase-reauthentication",
    content ?? getTemplateDefaults("supabase-reauthentication"),
  )
}

export function reauthenticationPreviewHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
): string {
  return renderTemplateHtml(
    "supabase-reauthentication",
    content ?? getTemplateDefaults("supabase-reauthentication"),
    { theme },
  )
}
