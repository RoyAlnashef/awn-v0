import {
  emailButton,
  emailLayout,
  emailTextStyle,
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"
import { buildInviteApplyUrl } from "@/lib/invites/urls"

export function inviteEmailHtml({
  inviterName,
  token,
  origin,
  theme = "dark",
}: {
  inviterName: string
  token: string
  origin?: string
  theme?: EmailTheme
}) {
  const applyUrl = buildInviteApplyUrl(token, origin)
  const preview = `${inviterName} invited you to join AWN`
  const colors = emailThemeColors(theme)

  const body = `
    <h1 style="${emailTextStyle(theme, "heading")}">
      You're invited to AWN
    </h1>
    <p style="${emailTextStyle(theme, "body")}">
      <strong style="${emailTextStyle(theme, "strong")}">${inviterName}</strong> invited you to apply for membership on A Wright Network — the private network for touring live entertainment crew.
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:${colors.body};">
      Complete your application to join. Membership is reviewed manually by our team.
    </p>
    ${emailButton(applyUrl, "Start your application")}
    <p style="${emailTextStyle(theme, "muted")}">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${applyUrl}" style="${emailTextStyle(theme, "link")}">${applyUrl}</a>
    </p>
  `

  return emailLayout({ preview, body, theme })
}

export function inviteEmailSubject(inviterName: string) {
  return `${inviterName} invited you to join A Wright Network`
}
