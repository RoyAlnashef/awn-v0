import {
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"
import {
  renderSupabaseTemplate,
  substituteSupabaseTags,
} from "@/lib/email/templates/supabase/shared"

export const magicLinkSubject = "Your AWN sign-in link"

function magicLinkTemplate(theme: EmailTheme = "dark") {
  const colors = emailThemeColors(theme)
  return {
    preview: "Sign in to A Wright Network",
    heading: "Sign in to AWN",
    paragraphs: [
      "Use the button below to sign in to your A Wright Network account. This link expires soon.",
      "If you didn't request this email, you can safely ignore it.",
    ],
    buttonLabel: "Sign in to AWN",
    buttonHref: "{{ .ConfirmationURL }}",
    footerNote: `Or enter this code: <strong style="color:${colors.strong};">{{ .Token }}</strong>`,
    theme,
  }
}

export function magicLinkSupabaseHtml(): string {
  return renderSupabaseTemplate(magicLinkTemplate("dark"))
}

export function magicLinkPreviewHtml(theme: EmailTheme = "dark"): string {
  return substituteSupabaseTags(renderSupabaseTemplate(magicLinkTemplate(theme)))
}
