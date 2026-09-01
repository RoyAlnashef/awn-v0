import {
  emailLayout,
  emailTextStyle,
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"

export function applicationDeniedHtml({
  note,
  theme = "dark",
}: {
  note?: string | null
  theme?: EmailTheme
}) {
  const preview = "Update on your AWN application"
  const colors = emailThemeColors(theme)

  const noteBlock = note?.trim()
    ? `<p style="margin:16px 0 0;padding:16px;background:${colors.noteBg};border:1px solid ${colors.noteBorder};border-radius:12px;font-size:14px;line-height:1.6;color:${colors.body};">
        ${note.trim().replace(/\n/g, "<br />")}
      </p>`
    : ""

  const body = `
    <h1 style="${emailTextStyle(theme, "heading")}">
      Application update
    </h1>
    <p style="${emailTextStyle(theme, "body")}">
      Thank you for applying to A Wright Network. After review, we're unable to approve your application at this time.
    </p>
    ${noteBlock}
  `

  return emailLayout({ preview, body, theme })
}

export const applicationDeniedSubject =
  "Update on your AWN application"
