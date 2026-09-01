import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSupabaseHtml,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export const inviteUserSubject =
  getTemplateDefaults("supabase-invite-user").subject

export function inviteUserSupabaseHtml(content?: EmailTemplateContent): string {
  return renderTemplateSupabaseHtml(
    "supabase-invite-user",
    content ?? getTemplateDefaults("supabase-invite-user"),
  )
}

export function inviteUserPreviewHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
): string {
  return renderTemplateHtml(
    "supabase-invite-user",
    content ?? getTemplateDefaults("supabase-invite-user"),
    { theme },
  )
}
