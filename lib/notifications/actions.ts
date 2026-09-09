"use server"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { formatRelativeTime, isUuid } from "@/lib/messages/format"
import {
  notificationDisplayKind,
  type AppNotification,
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
  return {
    id: row.id,
    kind: notificationDisplayKind(row.kind),
    title: row.title,
    body: row.body,
    time: formatRelativeTime(row.created_at),
    read: row.read,
  }
}

export async function listNotifications(): Promise<ListNotificationsResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("notifications")
      .select("id, kind, title, body, data, read, created_at")
      .eq("user_id", userId)
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

    return { ok: true, id: data.id }
  } catch (error) {
    return actionError(error)
  }
}
