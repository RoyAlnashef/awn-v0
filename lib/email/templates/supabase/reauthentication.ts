import type { EmailTheme } from "@/lib/email/templates/base"
import { emailThemeColors } from "@/lib/email/templates/base"
import {
  renderSupabaseTemplate,
  substituteSupabaseTags,
} from "@/lib/email/templates/supabase/shared"

export const reauthenticationSubject = "Confirm it's you — AWN"

function reauthenticationTemplate(theme: EmailTheme = "dark") {
  const colors = emailThemeColors(theme)
  return {
    preview: "Confirm your identity on AWN",
    heading: "Confirm it's you",
    paragraphs: [
      "For your security, enter the code below to continue with a sensitive account action.",
    ],
    buttonLabel: "Continue",
    buttonHref: "{{ .ConfirmationURL }}",
    footerNote: `Your verification code: <strong style="color:${colors.strong};font-size:18px;letter-spacing:0.1em;">{{ .Token }}</strong>`,
    theme,
  }
}

export function reauthenticationSupabaseHtml(): string {
  return renderSupabaseTemplate(reauthenticationTemplate("dark"))
}

export function reauthenticationPreviewHtml(theme: EmailTheme = "dark"): string {
  return substituteSupabaseTags(renderSupabaseTemplate(reauthenticationTemplate(theme)))
}
