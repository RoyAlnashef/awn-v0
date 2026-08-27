import { getAppOrigin } from "@/lib/email/constants"
import { emailButton, emailLayout } from "@/lib/email/templates/base"

export function applicationApprovedHtml() {
  const loginUrl = `${getAppOrigin()}/login`
  const preview = "Welcome to A Wright Network"

  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;line-height:1.3;color:#fafafa;">
      You're approved
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#d4d4d8;">
      Welcome to A Wright Network. Your membership application has been approved — sign in to start connecting with touring crew.
    </p>
    ${emailButton(loginUrl, "Sign in to AWN")}
  `

  return emailLayout({ preview, body })
}

export const applicationApprovedSubject =
  "Welcome to A Wright Network — you're approved"
