import { getAppOrigin } from "@/lib/email/constants"

export function buildInviteApplyUrl(token: string): string {
  return `${getAppOrigin()}/apply?token=${encodeURIComponent(token)}`
}
