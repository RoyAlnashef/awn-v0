import type { EmailTheme } from "@/lib/email/templates/base"
import {
  renderSupabaseTemplate,
  substituteSupabaseTags,
} from "@/lib/email/templates/supabase/shared"

export const inviteUserSubject = "You're invited to AWN"

function inviteUserTemplate(theme: EmailTheme = "dark") {
  return {
    preview: "You're invited to A Wright Network",
    heading: "You're invited to AWN",
    paragraphs: [
      "You've been invited to join A Wright Network — the private network for touring live entertainment crew.",
      "Accept the invite to create your account and complete your profile.",
    ],
    buttonLabel: "Accept invite",
    buttonHref: "{{ .ConfirmationURL }}",
    theme,
  }
}

export function inviteUserSupabaseHtml(): string {
  return renderSupabaseTemplate(inviteUserTemplate("dark"))
}

export function inviteUserPreviewHtml(theme: EmailTheme = "dark"): string {
  return substituteSupabaseTags(renderSupabaseTemplate(inviteUserTemplate(theme)))
}
