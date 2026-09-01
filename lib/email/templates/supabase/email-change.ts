import type { EmailTheme } from "@/lib/email/templates/base"
import {
  renderSupabaseTemplate,
  substituteSupabaseTags,
} from "@/lib/email/templates/supabase/shared"

export const emailChangeSubject = "Confirm your new AWN email"

function emailChangeTemplate(theme: EmailTheme = "dark") {
  return {
    preview: "Confirm your new AWN email address",
    heading: "Confirm email change",
    paragraphs: [
      "You requested to change the email on your AWN account from {{ .OldEmail }} to {{ .NewEmail }}.",
      "Confirm this change using the button below.",
    ],
    buttonLabel: "Confirm new email",
    buttonHref: "{{ .ConfirmationURL }}",
    theme,
  }
}

export function emailChangeSupabaseHtml(): string {
  return renderSupabaseTemplate(emailChangeTemplate("dark"))
}

export function emailChangePreviewHtml(theme: EmailTheme = "dark"): string {
  return substituteSupabaseTags(renderSupabaseTemplate(emailChangeTemplate(theme)))
}
