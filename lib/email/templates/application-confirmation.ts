import { getAppOrigin } from "@/lib/email/constants"
import { emailButton, emailLayout } from "@/lib/email/templates/base"

export function applicationConfirmationHtml() {
  const pendingUrl = `${getAppOrigin()}/pending`
  const preview = "Your AWN application was received"

  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;line-height:1.3;color:#fafafa;">
      Application received
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#d4d4d8;">
      Thanks for applying to A Wright Network. Our team will review your application and you'll hear from us soon.
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#d4d4d8;">
      You can sign in anytime to check your application status.
    </p>
    ${emailButton(pendingUrl, "View application status")}
  `

  return emailLayout({ preview, body })
}

export const applicationConfirmationSubject =
  "We received your AWN application"
