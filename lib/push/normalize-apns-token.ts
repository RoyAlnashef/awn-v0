/** Normalize APNs device token from Capacitor (hex, no spaces). */
export function normalizeApnsToken(raw: string): string | null {
  const token = raw.replace(/\s+/g, "").replace(/[<>\s]/g, "").toLowerCase()
  if (!/^[0-9a-f]+$/.test(token)) {
    return null
  }
  // iOS device tokens are 32 bytes (64 hex chars); allow slight variance from tooling.
  if (token.length < 32) {
    return null
  }
  return token
}
