export const DEFAULT_EMAIL_FROM = "AWN <onboarding@resend.dev>"

export const EMAIL_MARKETING_SITE_URL = "https://awrightnetwork.com/"

export const EMAIL_BRAND_LOGO_URL =
  "https://awrightnetwork.com/apple-touch-icon.png"

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM
}

function isProduction(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  )
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return hostname === "localhost" || hostname === "127.0.0.1"
  } catch {
    return /localhost|127\.0\.0\.1/.test(origin)
  }
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "")
}

export function getAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (explicit) {
    const normalized = normalizeOrigin(explicit)
    if (!(isProduction() && isLocalhostOrigin(normalized))) {
      return normalized
    }
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel}`

  if (explicit) return normalizeOrigin(explicit)

  return "http://localhost:3000"
}
