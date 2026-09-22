import { createAdminClient } from "@/lib/supabase/admin"

import { buildNotificationUrl } from "./build-notification-url"
import { logDispatchIssue } from "./log-dispatch-issue"
import { sendApnsPush } from "./send-apns"
import { sendFcmPush } from "./send-fcm"
import { sendWebPush } from "./send-web"
import { shouldSendPushForNotification } from "./should-send"
import type {
  DispatchResult,
  NotificationDispatchInput,
  PushPayload,
  PushSubscriptionRow,
} from "./types"

function buildPayload(notification: NotificationDispatchInput): PushPayload {
  return {
    title: notification.title,
    body: notification.body,
    url: buildNotificationUrl(
      notification.kind,
      notification.data,
      notification.room_id,
    ),
    tag: notification.kind,
  }
}

async function loadSubscriptions(
  userId: string,
): Promise<PushSubscriptionRow[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, subscription")
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as PushSubscriptionRow[]
}

async function pruneExpiredEndpoints(endpoints: string[]) {
  if (endpoints.length === 0) return

  const admin = createAdminClient()
  await admin.from("push_subscriptions").delete().in("endpoint", endpoints)
}

export async function dispatchPushForNotification(
  notification: NotificationDispatchInput,
): Promise<DispatchResult> {
  const gate = await shouldSendPushForNotification(notification)
  if (!gate.ok) {
    return { sent: 0, total: 0, skipped: true, reason: gate.reason }
  }

  const subscriptions = await loadSubscriptions(notification.user_id)
  if (subscriptions.length === 0) {
    const result: DispatchResult = {
      sent: 0,
      total: 0,
      reason: "no_subscriptions",
    }
    await logDispatchIssue(notification, result)
    return result
  }

  const payload = buildPayload(notification)
  const webRows = subscriptions.filter(
    (row) =>
      typeof row.subscription === "object" &&
      row.subscription !== null &&
      (row.subscription as { type?: string }).type === "web",
  )
  const nativeRows = subscriptions.filter(
    (row) =>
      typeof row.subscription === "object" &&
      row.subscription !== null &&
      (row.subscription as { type?: string }).type === "native",
  )

  const [webResult, fcmResult, apnsResult] = await Promise.all([
    sendWebPush(webRows, payload),
    sendFcmPush(nativeRows, payload),
    sendApnsPush(nativeRows, payload),
  ])

  await pruneExpiredEndpoints(webResult.expiredEndpoints)

  const failures = [
    ...webResult.failures,
    ...fcmResult.failures,
    ...apnsResult.failures,
  ]
  const sent = webResult.sent + fcmResult.sent + apnsResult.sent

  const result: DispatchResult = {
    sent,
    total: subscriptions.length,
    ...(failures.length > 0 ? { failures } : {}),
    ...(sent === 0 && failures.length === 0 ? { reason: "send_failed" } : {}),
  }

  await logDispatchIssue(notification, result)

  return result
}

export async function dispatchPushByNotificationId(
  notificationId: string,
): Promise<DispatchResult> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("notifications")
    .select("id, user_id, kind, title, body, data, room_id")
    .eq("id", notificationId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return { sent: 0, total: 0, reason: "notification_not_found" }
  }

  return dispatchPushForNotification(data as NotificationDispatchInput)
}
