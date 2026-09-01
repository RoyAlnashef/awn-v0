import { getAppOrigin } from "@/lib/email/constants"
import {
  emailButton,
  emailLayout,
  emailTextStyle,
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"

export function applicationConfirmationHtml(theme: EmailTheme = "dark") {
  const pendingUrl = `${getAppOrigin()}/pending`
  const preview = "Your AWN application was received"
  const colors = emailThemeColors(theme)

  const body = `
    <h1 style="${emailTextStyle(theme, "heading")}">
      Application received
    </h1>
    <p style="${emailTextStyle(theme, "body")}">
      Thanks for applying to A Wright Network. Our team will review your application and you'll hear from us soon.
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:${colors.body};">
      You can sign in anytime to check your application status.
    </p>
    ${emailButton(pendingUrl, "View application status")}
  `

  return emailLayout({ preview, body, theme })
}

export const applicationConfirmationSubject =
  "We received your AWN application"
