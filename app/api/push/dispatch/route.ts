import { NextResponse } from "next/server"

import {
  dispatchPushByNotificationId,
  dispatchPushForNotification,
} from "@/lib/push/dispatch"
import { isPushWorthyKind } from "@/lib/push/push-worthy-kinds"
import type { NotificationDispatchInput } from "@/lib/push/types"

type DispatchBody = {
  notificationId?: string
  record?: NotificationDispatchInput & {
    user_id?: string
    kind?: string
    title?: string
    body?: string
    read?: boolean
    data?: Record<string, unknown> | null
    room_id?: string | null
  }
  type?: string
  table?: string
}

function isAuthorized(request: Request): boolean {
  const secret = request.headers.get("x-internal-secret")
  return Boolean(
    secret &&
      process.env.INTERNAL_API_SECRET &&
      secret === process.env.INTERNAL_API_SECRET,
  )
}

function shouldSkipWebhookDispatch(body: DispatchBody): string | null {
  if (body.type === "DELETE") {
    return "webhook_delete_event"
  }

  const record = body.record
  if (!record?.kind) {
    return null
  }

  if (record.read === true) {
    return "notification_already_read"
  }

  if (!isPushWorthyKind(record.kind)) {
    return "kind_not_push_worthy"
  }

  return null
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: DispatchBody
  try {
    body = (await request.json()) as DispatchBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    if (body.notificationId) {
      const result = await dispatchPushByNotificationId(body.notificationId)
      return NextResponse.json({ ok: true, ...result })
    }

    const skipReason = shouldSkipWebhookDispatch(body)
    if (skipReason) {
      return NextResponse.json({
        ok: true,
        sent: 0,
        total: 0,
        skipped: true,
        reason: skipReason,
      })
    }

    if (body.record?.id && body.record.user_id && body.record.kind) {
      const result = await dispatchPushForNotification({
        id: body.record.id,
        user_id: body.record.user_id,
        kind: body.record.kind,
        title: body.record.title ?? "AWN",
        body: body.record.body ?? "",
        data: body.record.data ?? null,
        room_id: body.record.room_id ?? null,
      })
      return NextResponse.json({ ok: true, ...result })
    }

    return NextResponse.json(
      { error: "Missing notificationId or record" },
      { status: 400 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dispatch failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
