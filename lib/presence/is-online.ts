import { ONLINE_PRESENCE_MS } from "@/lib/presence/constants"

export function profileIsOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_PRESENCE_MS
}
