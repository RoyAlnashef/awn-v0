import {
  getTemplateDefaults,
  renderTemplateHtml,
  renderTemplateSupabaseHtml,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { EmailTheme } from "@/lib/email/templates/base"

export const magicLinkSubject = getTemplateDefaults("supabase-magic-link").subject

export function magicLinkSupabaseHtml(content?: EmailTemplateContent): string {
  return renderTemplateSupabaseHtml(
    "supabase-magic-link",
    content ?? getTemplateDefaults("supabase-magic-link"),
  )
}

export function magicLinkPreviewHtml(
  theme: EmailTheme = "dark",
  content?: EmailTemplateContent,
): string {
  return renderTemplateHtml(
    "supabase-magic-link",
    content ?? getTemplateDefaults("supabase-magic-link"),
    { theme },
  )
}
