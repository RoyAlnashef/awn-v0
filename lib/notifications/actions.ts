"use server"

import { after } from "next/server"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { dispatchPushForNotification } from "@/lib/push/dispatch"
import { formatRelativeTime, isUuid } from "@/lib/messages/format"
import {
  notificationDisplayKind,
  type AppNotification,
  type NotificationData,
} from "@/lib/notifications-data"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type ActionError = { ok: false; error: string }

export type ListNotificationsResult =
  | { ok: true; notifications: AppNotification[] }
  | ActionError

export type MarkNotificationReadResult = { ok: true } | ActionError

export type MarkAllNotificationsReadResult = { ok: true } | ActionError

export type CreateNotificationResult =
  | { ok: true; id: string }
  | ActionError

export type CreateNotificationInput = {
  userId: string
  kind: string
  title: string
  body: string
  data?: Record<string, unknown>
}

type NotificationRow = {
  id: string
  kind: string
  title: string
  body: string
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
  updated_at: string
  room_id: string | null
}

function mapNotificationData(
  data: Record<string, unknown> | null,
): NotificationData | undefined {
  if (!data) return undefined

  const conversationId =
    typeof data.conversationId === "string" ? data.conversationId : undefined
  const latestMessageId =
    typeof data.latestMessageId === "string" ? data.latestMessageId : undefined
  const messageCount =
    typeof data.messageCount === "number" ? data.messageCount : undefined
  const jobId = typeof data.jobId === "string" ? data.jobId : undefined
  const applicationId =
    typeof data.applicationId === "string" ? data.applicationId : undefined
  const roomId = typeof data.roomId === "string" ? data.roomId : undefined
  const profileId = typeof data.profileId === "string" ? data.profileId : undefined
  const mentionCount =
    typeof data.mentionCount === "number" ? data.mentionCount : undefined
  const replyCount =
    typeof data.replyCount === "number" ? data.replyCount : undefined

  if (
    !conversationId &&
    messageCount === undefined &&
    !latestMessageId &&
    !jobId &&
    !applicationId &&
    !roomId &&
    !profileId &&
    mentionCount === undefined &&
    replyCount === undefined
  ) {
    return undefined
  }

  return {
    ...(conversationId ? { conversationId } : {}),
    ...(messageCount !== undefined ? { messageCount } : {}),
    ...(latestMessageId ? { latestMessageId } : {}),
    ...(jobId ? { jobId } : {}),
    ...(applicationId ? { applicationId } : {}),
    ...(roomId ? { roomId } : {}),
    ...(profileId ? { profileId } : {}),
    ...(mentionCount !== undefined ? { mentionCount } : {}),
    ...(replyCount !== undefined ? { replyCount } : {}),
  }
}

function actionError(error: unknown): ActionError {
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: "Something went wrong." }
}

async function requireUserId(): Promise<string> {
  const user = await getSessionUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

function mapNotificationRow(row: NotificationRow): AppNotification {
  const sortTime = row.updated_at ?? row.created_at
  const mappedData = mapNotificationData(row.data)
  const roomId =
    mappedData?.roomId ??
    (typeof row.room_id === "string" ? row.room_id : undefined)
  const data =
    roomId && !mappedData?.roomId
      ? { ...mappedData, roomId }
      : mappedData

  return {
    id: row.id,
    dbKind: row.kind,
    kind: notificationDisplayKind(row.kind),
    title: row.title,
    body: row.body,
    time: formatRelativeTime(sortTime),
    read: row.read,
    data,
  }
}

export async function listNotifications(): Promise<ListNotificationsResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, kind, title, body, data, read, created_at, updated_at, room_id",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205") {
        return { ok: true, notifications: [] }
      }
      return { ok: false, error: error.message }
    }

    return {
      ok: true,
      notifications: (data ?? []).map((row) =>
        mapNotificationRow(row as NotificationRow),
      ),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function markNotificationRead(
  notificationId: string,
  read: boolean,
): Promise<MarkNotificationReadResult> {
  try {
    if (!isUuid(notificationId)) {
      return { ok: false, error: "Invalid notification." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("notifications")
      .update({ read })
      .eq("id", notificationId)
      .eq("user_id", userId)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

/** Inserts a notification via service role (RLS blocks client inserts). */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<CreateNotificationResult> {
  try {
    if (!isUuid(input.userId)) {
      return { ok: false, error: "Invalid user." }
    }

    const kind = input.kind.trim()
    const title = input.title.trim()
    const body = input.body.trim()

    if (!kind || !title || !body) {
      return { ok: false, error: "Kind, title, and body are required." }
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from("notifications")
      .insert({
        user_id: input.userId,
        kind,
        title,
        body,
        data: input.data ?? {},
      })
      .select("id")
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    after(async () => {
      try {
        await dispatchPushForNotification({
          id: data.id,
          user_id: input.userId,
          kind,
          title,
          body,
          data: (input.data ?? null) as Record<string, unknown> | null,
          room_id:
            typeof input.data?.roomId === "string" ? input.data.roomId : null,
        })
      } catch {
        // Push delivery is best-effort; in-app notification already exists.
      }
    })

    return { ok: true, id: data.id }
  } catch (error) {
    return actionError(error)
  }
}
