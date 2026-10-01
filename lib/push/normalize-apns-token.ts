/** Normalize APNs device token from Capacitor (hex, no spaces). */
export function normalizeApnsToken(raw: string): string | null {
  const token = raw.replace(/\s+/g, "").replace(/[<>\s]/g, "").toUpperCase()
  if (!/^[0-9A-F]+$/.test(token)) {
    return null
  }
  // iOS device tokens are 32 bytes (64 hex chars); allow slight variance from tooling.
  if (token.length < 32) {
    return null
  }
  return token
}
