/** Builds an in-app deep link from a notification row (mirrors notifications.tsx routing). */
export function buildNotificationUrl(
  kind: string,
  data: Record<string, unknown> | null,
  roomId?: string | null,
): string {
  const payload = data ?? {}

  if (kind === "room_join_request") {
    const id =
      roomId ?? (typeof payload.roomId === "string" ? payload.roomId : undefined)
    if (id) {
      return `/groups/settings?room=${encodeURIComponent(id)}&members=1`
    }
  }

  const room =
    roomId ?? (typeof payload.roomId === "string" ? payload.roomId : undefined)

  if ((kind === "room_mention" || kind === "room_reply") && room) {
    const messageId =
      typeof payload.latestMessageId === "string"
        ? payload.latestMessageId
        : undefined
    return messageId
      ? `/rooms?room=${encodeURIComponent(room)}&message=${encodeURIComponent(messageId)}`
      : `/rooms?room=${encodeURIComponent(room)}`
  }

  const conversationId =
    typeof payload.conversationId === "string"
      ? payload.conversationId
      : undefined

  if (
    (kind === "dm_message" || kind === "application_accepted") &&
    conversationId
  ) {
    return `/messages?conversation=${encodeURIComponent(conversationId)}`
  }

  if (kind === "application_accepted") {
    return "/my-jobs/applications"
  }

  const jobId = typeof payload.jobId === "string" ? payload.jobId : undefined
  if (
    (kind === "job_under_review" ||
      kind === "job_review_released" ||
      kind === "job_review_closed") &&
    jobId
  ) {
    return `/jobs/${encodeURIComponent(jobId)}`
  }

  return "/"
}
