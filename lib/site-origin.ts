export const PUBLIC_SITE_ORIGIN = "https://awn-v0.vercel.app/"

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "")
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return hostname === "localhost" || hostname === "127.0.0.1"
  } catch {
    return /localhost|127\.0\.0\.1/.test(origin)
  }
}

/** Canonical origin for public shareable URLs (crew profiles, PDF footer, QR codes). */
export function getPublicSiteOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (explicit) {
    const normalized = normalizeOrigin(explicit)
    if (!isLocalhostOrigin(normalized)) {
      return normalized
    }
  }

  return PUBLIC_SITE_ORIGIN
}
