import { getAppOrigin } from "@/lib/email/constants"
import {
  emailButton,
  emailLayout,
  emailTextStyle,
  type EmailTheme,
} from "@/lib/email/templates/base"

export function applicationApprovedHtml(theme: EmailTheme = "dark") {
  const loginUrl = `${getAppOrigin()}/login`
  const preview = "Welcome to A Wright Network"

  const body = `
    <h1 style="${emailTextStyle(theme, "heading")}">
      You're approved
    </h1>
    <p style="${emailTextStyle(theme, "body")}">
      Welcome to A Wright Network. Your membership application has been approved — sign in to start connecting with touring crew.
    </p>
    ${emailButton(loginUrl, "Sign in to AWN")}
  `

  return emailLayout({ preview, body, theme })
}

export const applicationApprovedSubject =
  "Welcome to A Wright Network — you're approved"
