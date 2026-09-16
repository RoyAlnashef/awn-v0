import {
  emailButton,
  emailLayout,
  emailTextStyle,
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"

export const SUPABASE_SAMPLE_DATA = {
  ConfirmationURL:
    "https://project-ref.supabase.co/auth/v1/verify?token=sample-token-hash&type=magiclink&redirect_to=https://app.example.com/auth/callback",
  Token: "482910",
  TokenHash: "sample-token-hash",
  SiteURL: "https://app.example.com",
  RedirectTo: "https://app.example.com/auth/callback",
  Email: "member@example.com",
  NewEmail: "new@example.com",
  OldEmail: "old@example.com",
} as const

type SupabaseBodyOptions = {
  preview: string
  heading: string
  paragraphs: string[]
  buttonLabel?: string
  buttonHref: string
  footerNote?: string
  theme?: EmailTheme
}

function buildBody({
  heading,
  paragraphs,
  buttonLabel,
  buttonHref,
  footerNote,
  theme = "dark",
}: Omit<SupabaseBodyOptions, "preview">): string {
  const colors = emailThemeColors(theme)

  const paragraphHtml = paragraphs
    .map(
      (p, index) =>
        `<p style="margin:0${index > 0 ? ";margin-top:16px" : ""};font-size:15px;line-height:1.6;color:${colors.body};">${p}</p>`,
    )
    .join("")

  const buttonHtml =
    buttonLabel && buttonHref
      ? emailButton(buttonHref, buttonLabel, theme)
      : ""

  const footerHtml = footerNote
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:${colors.muted};">${footerNote}</p>`
    : ""

  return `
    <h1 style="${emailTextStyle(theme, "heading")}">
      ${heading}
    </h1>
    ${paragraphHtml}
    ${buttonHtml}
    ${footerHtml}
  `
}

export function renderSupabaseTemplate(
  options: SupabaseBodyOptions,
): string {
  const { theme = "dark", preview, ...bodyOptions } = options
  return emailLayout({
    preview,
    body: buildBody({ ...bodyOptions, theme }),
    theme,
  })
}

export function substituteSupabaseTags(
  html: string,
  sampleData: Record<string, string> = SUPABASE_SAMPLE_DATA,
): string {
  return html
    .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, sampleData.ConfirmationURL ?? "")
    .replace(/\{\{\s*\.Token\s*\}\}/g, sampleData.Token ?? "")
    .replace(/\{\{\s*\.TokenHash\s*\}\}/g, sampleData.TokenHash ?? "")
    .replace(/\{\{\s*\.SiteURL\s*\}\}/g, sampleData.SiteURL ?? "")
    .replace(/\{\{\s*\.RedirectTo\s*\}\}/g, sampleData.RedirectTo ?? "")
    .replace(/\{\{\s*\.Email\s*\}\}/g, sampleData.Email ?? "")
    .replace(/\{\{\s*\.NewEmail\s*\}\}/g, sampleData.NewEmail ?? "")
    .replace(/\{\{\s*\.OldEmail\s*\}\}/g, sampleData.OldEmail ?? "")
}
