import { getAppOrigin } from "@/lib/email/constants"

export function buildInviteApplyUrl(token: string, origin?: string): string {
  const base = normalizeOrigin(origin ?? getAppOrigin())
  return `${base}/apply?token=${encodeURIComponent(token)}`
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "")
}
