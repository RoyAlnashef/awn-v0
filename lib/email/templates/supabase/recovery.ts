import type { EmailTheme } from "@/lib/email/templates/base"
import { emailThemeColors } from "@/lib/email/templates/base"
import {
  renderSupabaseTemplate,
  substituteSupabaseTags,
} from "@/lib/email/templates/supabase/shared"

export const recoverySubject = "Reset your AWN password"

function recoveryTemplate(theme: EmailTheme = "dark") {
  const colors = emailThemeColors(theme)
  return {
    preview: "Reset your A Wright Network password",
    heading: "Reset your password",
    paragraphs: [
      "We received a request to reset the password for your AWN account.",
      "If you didn't request a reset, you can ignore this email.",
    ],
    buttonLabel: "Reset password",
    buttonHref: "{{ .ConfirmationURL }}",
    footerNote: `Or enter this code: <strong style="color:${colors.strong};">{{ .Token }}</strong>`,
    theme,
  }
}

export function recoverySupabaseHtml(): string {
  return renderSupabaseTemplate(recoveryTemplate("dark"))
}

export function recoveryPreviewHtml(theme: EmailTheme = "dark"): string {
  return substituteSupabaseTags(renderSupabaseTemplate(recoveryTemplate(theme)))
}
