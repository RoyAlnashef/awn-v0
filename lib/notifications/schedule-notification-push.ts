import { after } from "next/server"

import { dispatchPushForNotification } from "@/lib/push/dispatch"

import type { CreateNotificationInput } from "@/lib/notifications/create-notification-types"

export function scheduleNotificationPush(
  persisted: {
    id: string
    kind: string
    title: string
    body: string
  },
  input: CreateNotificationInput,
): void {
  after(async () => {
    try {
      await dispatchPushForNotification({
        id: persisted.id,
        user_id: input.userId,
        kind: persisted.kind,
        title: persisted.title,
        body: persisted.body,
        data: (input.data ?? null) as Record<string, unknown> | null,
        room_id:
          typeof input.data?.roomId === "string" ? input.data.roomId : null,
      })
    } catch {
      // Push delivery is best-effort; in-app notification already exists.
    }
  })
}
