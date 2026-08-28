import { emailButton, emailLayout } from "@/lib/email/templates/base"
import { buildInviteApplyUrl } from "@/lib/invites/urls"

export function inviteEmailHtml({
  inviterName,
  token,
}: {
  inviterName: string
  token: string
}) {
  const applyUrl = buildInviteApplyUrl(token)
  const preview = `${inviterName} invited you to join AWN`

  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;line-height:1.3;color:#fafafa;">
      You're invited to AWN
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#d4d4d8;">
      <strong style="color:#fafafa;">${inviterName}</strong> invited you to apply for membership on A Wright Network — the private network for touring live entertainment crew.
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#d4d4d8;">
      Complete your application to join. Membership is reviewed manually by our team.
    </p>
    ${emailButton(applyUrl, "Start your application")}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#71717a;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${applyUrl}" style="color:#a78bfa;word-break:break-all;">${applyUrl}</a>
    </p>
  `

  return emailLayout({ preview, body })
}

export function inviteEmailSubject(inviterName: string) {
  return `${inviterName} invited you to join A Wright Network`
}
