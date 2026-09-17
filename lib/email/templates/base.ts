import {
  EMAIL_BRAND_LOGO_URL,
  EMAIL_MARKETING_SITE_URL,
} from "@/lib/email/constants"

export type EmailTheme = "dark" | "light"

export type EmailThemeColors = {
  pageBg: string
  cardBg: string
  cardBorder: string
  brandLabel: string
  bodyText: string
  heading: string
  body: string
  muted: string
  link: string
  strong: string
  noteBg: string
  noteBorder: string
  buttonBg: string
  buttonText: string
  buttonBorder: string
}

/** Hex values aligned with app/globals.css primary tokens (oklch white primary theme). */
export const EMAIL_PRIMARY = {
  bright: "#ffffff",
  dark: "#fafafa",
  foreground: "#18181b",
} as const

/** Matches app button `rounded-md` → `--radius-md` (0.625rem × 0.8 = 0.5rem). */
export const EMAIL_BUTTON_RADIUS = "0.5rem"

const EMAIL_THEMES: Record<EmailTheme, EmailThemeColors> = {
  dark: {
    pageBg: "#0a0a0b",
    cardBg: "#141416",
    cardBorder: "#27272a",
    brandLabel: "#a1a1aa",
    bodyText: EMAIL_PRIMARY.dark,
    heading: EMAIL_PRIMARY.dark,
    body: "#d4d4d8",
    muted: "#71717a",
    link: EMAIL_PRIMARY.dark,
    strong: EMAIL_PRIMARY.dark,
    noteBg: "#18181b",
    noteBorder: "#27272a",
    buttonBg: EMAIL_PRIMARY.bright,
    buttonText: EMAIL_PRIMARY.foreground,
    buttonBorder: "transparent",
  },
  light: {
    pageBg: "#f4f4f5",
    cardBg: "#ffffff",
    cardBorder: "#e4e4e7",
    brandLabel: "#71717a",
    bodyText: EMAIL_PRIMARY.foreground,
    heading: EMAIL_PRIMARY.foreground,
    body: "#52525b",
    muted: "#71717a",
    link: EMAIL_PRIMARY.foreground,
    strong: EMAIL_PRIMARY.foreground,
    noteBg: "#f4f4f5",
    noteBorder: "#e4e4e7",
    buttonBg: EMAIL_PRIMARY.bright,
    buttonText: EMAIL_PRIMARY.foreground,
    buttonBorder: "#e4e4e7",
  },
}

export function emailThemeColors(theme: EmailTheme = "dark"): EmailThemeColors {
  return EMAIL_THEMES[theme]
}

export type EmailTextRole = "heading" | "body" | "muted" | "strong" | "link"

export function emailTextStyle(
  theme: EmailTheme = "dark",
  role: EmailTextRole,
): string {
  const colors = emailThemeColors(theme)
  const color = colors[role === "strong" ? "strong" : role]
  const base = "font-size:15px;line-height:1.6"

  switch (role) {
    case "heading":
      return `margin:0 0 12px;font-size:24px;font-weight:600;line-height:1.3;color:${colors.heading}`
    case "body":
      return `margin:0;${base};color:${colors.body}`
    case "muted":
      return `margin:24px 0 0;font-size:12px;line-height:1.5;color:${colors.muted}`
    case "strong":
      return `color:${colors.strong}`
    case "link":
      return `color:${color};word-break:break-all`
    default:
      return `${base};color:${color}`
  }
}

const EMAIL_BRAND_LOGO_SIZE = 56

export function emailBrandLogo(src: string = EMAIL_BRAND_LOGO_URL): string {
  return `<img src="${src}" alt="A Wright Network" width="${EMAIL_BRAND_LOGO_SIZE}" height="${EMAIL_BRAND_LOGO_SIZE}" style="display:block;border-radius:22%;" />`
}

export function emailLayout({
  preview,
  body,
  theme = "dark",
  logoSrc,
}: {
  preview: string
  body: string
  theme?: EmailTheme
  logoSrc?: string
}): string {
  const colors = emailThemeColors(theme)
  const brandLogo = emailBrandLogo(logoSrc)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${preview}</title>
</head>
<body style="margin:0;padding:0;background:${colors.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${preview}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${colors.pageBg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:${colors.cardBg};border:1px solid ${colors.cardBorder};border-radius:16px;overflow:hidden;">
          <tr>
            <td align="left" style="padding:32px 28px 8px;">
              ${brandLogo}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 32px;color:${colors.bodyText};">
              ${body}
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;text-align:center;">
          <a href="${EMAIL_MARKETING_SITE_URL}" style="color:${colors.brandLabel};text-decoration:none;">A Wright Network</a>
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:${colors.muted};text-align:center;">
          People. Community. Opportunity.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailButton(
  href: string,
  label: string,
  theme: EmailTheme = "dark",
): string {
  const colors = emailThemeColors(theme)
  const border =
    colors.buttonBorder === "transparent"
      ? ""
      : `border:1px solid ${colors.buttonBorder};`

  return `<p style="margin:28px 0 0;">
  <a href="${href}" style="display:inline-block;background:${colors.buttonBg};color:${colors.buttonText};${border}text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:${EMAIL_BUTTON_RADIUS};">
    ${label}
  </a>
</p>`
}

export function emailPreviewPageBg(theme: EmailTheme = "dark"): string {
  return emailThemeColors(theme).pageBg
}
