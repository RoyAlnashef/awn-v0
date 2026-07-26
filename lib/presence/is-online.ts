import { ONLINE_PRESENCE_MS } from "@/lib/presence/constants"

export function profileIsOnline(
  lastActiveAt: string | null,
  appearOffline = false,
): boolean {
  if (appearOffline) return false
  if (!lastActiveAt) return false
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_PRESENCE_MS
}
