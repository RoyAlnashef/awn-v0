import { createAdminClient } from "@/lib/supabase/admin"

import type { NotificationDispatchInput } from "./types"

const DM_KINDS = new Set(["dm_message", "message"])
const ROOM_KINDS = new Set(["room_mention", "room_reply"])

export async function shouldSendPushForNotification(
  notification: NotificationDispatchInput,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const admin = createAdminClient()

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("viewing_conversation_id, viewing_room_id")
    .eq("id", notification.user_id)
    .maybeSingle()

  if (profileError) {
    return { ok: false, reason: profileError.message }
  }

  const data = notification.data ?? {}
  const conversationId =
    typeof data.conversationId === "string" ? data.conversationId : null
  const roomId =
    notification.room_id ??
    (typeof data.roomId === "string" ? data.roomId : null)

  if (
    DM_KINDS.has(notification.kind) &&
    conversationId &&
    profile?.viewing_conversation_id === conversationId
  ) {
    return { ok: false, reason: "user_viewing_conversation" }
  }

  if (
    ROOM_KINDS.has(notification.kind) &&
    roomId &&
    profile?.viewing_room_id === roomId
  ) {
    return { ok: false, reason: "user_viewing_room" }
  }

  if (roomId) {
    const { data: membership, error: membershipError } = await admin
      .from("room_memberships")
      .select("muted_at")
      .eq("room_id", roomId)
      .eq("profile_id", notification.user_id)
      .maybeSingle()

    if (membershipError) {
      return { ok: false, reason: membershipError.message }
    }

    if (membership?.muted_at) {
      return { ok: false, reason: "room_muted" }
    }
  }

  return { ok: true }
}
