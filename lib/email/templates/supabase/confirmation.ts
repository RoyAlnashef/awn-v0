import type { EmailTheme } from "@/lib/email/templates/base"
import {
  renderSupabaseTemplate,
  substituteSupabaseTags,
} from "@/lib/email/templates/supabase/shared"

export const confirmationSubject = "Confirm your AWN account"

function confirmationTemplate(theme: EmailTheme = "dark") {
  return {
    preview: "Confirm your A Wright Network account",
    heading: "Confirm your email",
    paragraphs: [
      "Thanks for signing up for A Wright Network. Confirm your email address to finish setting up your account.",
    ],
    buttonLabel: "Confirm email",
    buttonHref: "{{ .ConfirmationURL }}",
    theme,
  }
}

export function confirmationSupabaseHtml(): string {
  return renderSupabaseTemplate(confirmationTemplate("dark"))
}

export function confirmationPreviewHtml(theme: EmailTheme = "dark"): string {
  return substituteSupabaseTags(renderSupabaseTemplate(confirmationTemplate(theme)))
}
