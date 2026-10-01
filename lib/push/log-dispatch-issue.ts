import { logError } from "@/lib/logs/log-error"

import { isApnsSandboxMode } from "./send-apns"
import type { DispatchResult, NotificationDispatchInput } from "./types"

export async function logDispatchIssue(
  notification: NotificationDispatchInput,
  result: DispatchResult,
): Promise<void> {
  if (result.skipped) return
  if (result.sent > 0 && (result.failures?.length ?? 0) === 0) return

  await logError({
    level: result.sent === 0 ? "warning" : "warning",
    source: "server",
    message:
      result.reason ??
      (result.failures?.length
        ? `Push dispatch partial failure (${result.sent}/${result.total})`
        : "Push dispatch sent zero notifications"),
    context: "push",
    userId: notification.user_id,
    metadata: {
      notificationId: notification.id,
      kind: notification.kind,
      sent: result.sent,
      total: result.total,
      apnsSandboxMode: isApnsSandboxMode(),
      failures: result.failures ?? [],
    },
  })
}
