import { headers } from "next/headers"

export const DEFAULT_EMAIL_FROM = "AWN <onboarding@resend.dev>"

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

export async function getRequestAppOrigin(): Promise<string> {
  try {
    const h = await headers()
    const host = (h.get("x-forwarded-host") ?? h.get("host"))
      ?.split(",")[0]
      ?.trim()
    const proto =
      h.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https"

    if (
      host &&
      !host.startsWith("localhost") &&
      !host.startsWith("127.0.0.1")
    ) {
      return `${proto}://${host}`
    }
  } catch {
    // Not in a request context
  }

  return getAppOrigin()
}
