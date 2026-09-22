/** Notification kinds that should trigger a push dispatch from webhooks. */
export const PUSH_WORTHY_KINDS = new Set([
  "dm_message",
  "message",
  "room_mention",
  "room_reply",
  "application_accepted",
  "application_denied",
  "invite_accepted",
  "credit_vouched",
  "profile_vouched",
  "room_join_request",
])

export function isPushWorthyKind(kind: string): boolean {
  return PUSH_WORTHY_KINDS.has(kind)
}
