"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { DEFAULT_ROOM_EMOJI } from "@/lib/rooms/emoji"
import { getSessionUser } from "@/lib/auth/get-session-user"
import {
  mapRpcJobShare,
  type JobShareRpcRow,
} from "@/lib/messages/job-share"
import { formatMessageTime, formatRelativeTime, isUuid } from "@/lib/messages/format"
import type { MessageReaction, ThreadMessage } from "@/lib/messages-data"
import { createClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type RoomRecord = {
  id: string
  name: string
  slug: string
  description: string
  /** Emoji string stored in community_rooms.icon */
  icon: string
  isDefault: boolean
  isArchived: boolean
  sortOrder: number
  /** Whether the current user has joined this room. */
  joined: boolean
  /** Preview text from the last message. */
  preview: string
  /** Relative time label for the last activity. */
  time: string
  /** Whether there are unread messages for the current user (only relevant when joined). */
  unread: boolean
  unreadCount: number
}

type ActionError = { ok: false; error: string }

export type ListRoomsResult = { ok: true; rooms: RoomRecord[] } | ActionError
export type JoinRoomResult = { ok: true } | ActionError
export type LeaveRoomResult = { ok: true } | ActionError
export type MarkRoomReadResult = { ok: true } | ActionError
export type UnreadCountResult = { ok: true; count: number } | ActionError

export type RoomThreadResult =
  | { ok: true; messages: ThreadMessage[]; hasMore: boolean }
  | ActionError

export type SendRoomMessageResult =
  | { ok: true; message: ThreadMessage }
  | ActionError

export type SetRoomReactionResult =
  | { ok: true; reactions: MessageReaction[] }
  | ActionError

export type AdminRoomResult = { ok: true; room: AdminRoomRecord } | ActionError
export type AdminRoomsResult = { ok: true; rooms: AdminRoomRecord[] } | ActionError
export type ArchiveRoomResult = { ok: true } | ActionError

export type AdminRoomRecord = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  isDefault: boolean
  isArchived: boolean
  sortOrder: number
  memberCount: number
  createdAt: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type RoomRpcRow = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  is_default: boolean
  sort_order: number
  joined: boolean
  last_read_at: string | null
  last_message_body: string | null
  last_message_at: string | null
  last_message_sender_id: string | null
  unread_count: number
}

type ThreadRpcMessage = JobShareRpcRow & {
  id: string
  sender_id: string
  sender_name: string | null
  sender_avatar_url: string | null
  body: string
  created_at: string
  reactions?: ThreadRpcReaction[]
}

type ThreadRpcReaction = {
  emoji: string
  count: number
  reacted_by_me: boolean
  reactors: { id: string; name: string }[]
}

type ThreadRpcResult = {
  messages: ThreadRpcMessage[]
  has_more: boolean
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

function mapRoomThreadMessage(
  row: ThreadRpcMessage,
  userId: string,
): ThreadMessage {
  const jobShare = mapRpcJobShare(row)
  return {
    id: row.id,
    from: row.sender_id === userId ? "me" : "them",
    text: row.body,
    time: formatMessageTime(row.created_at),
    createdAt: row.created_at,
    author:
      row.sender_id !== userId
        ? (row.sender_name?.trim() || "Member")
        : undefined,
    authorId: row.sender_id !== userId ? row.sender_id : undefined,
    authorAvatarUrl:
      row.sender_id !== userId
        ? (row.sender_avatar_url ?? undefined)
        : undefined,
    reactions: mapRpcReactions(row.reactions),
    jobShare,
  }
}

async function fetchJobSharePayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
): Promise<
  | { ok: true; jobShare: NonNullable<ThreadMessage["jobShare"]> }
  | ActionError
> {
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      "id, role, production, location, pay_rate, start_date, end_date, engagement, status",
    )
    .eq("id", jobId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data || data.status === "deleted") {
    return { ok: false, error: "Job not found." }
  }

  return {
    ok: true,
    jobShare: {
      id: data.id,
      role: data.role,
      production: data.production ?? "",
      location: data.location ?? "",
      payRate: data.pay_rate ?? "",
      startDate: data.start_date,
      endDate: data.end_date,
      engagement: String(data.engagement),
    },
  }
}

function mapRpcReactions(
  reactions: ThreadRpcReaction[] | undefined,
): MessageReaction[] | undefined {
  if (!reactions?.length) return undefined
  return reactions.map((r) => ({
    emoji: r.emoji,
    count: r.count,
    reactedByMe: r.reacted_by_me,
    reactors: r.reactors ?? [],
  }))
}

function rpcRowToRoomRecord(row: RoomRpcRow, userId: string): RoomRecord {
  const preview = row.last_message_body?.trim() ?? ""
  const time = row.last_message_at
    ? formatRelativeTime(row.last_message_at)
    : ""
  const unread =
    row.joined &&
    row.unread_count > 0 &&
    row.last_message_sender_id !== userId

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    isDefault: row.is_default,
    isArchived: false,
    sortOrder: row.sort_order,
    joined: row.joined,
    preview,
    time,
    unread,
    unreadCount: row.unread_count,
  }
}

// ---------------------------------------------------------------------------
// Member actions
// ---------------------------------------------------------------------------

export async function listRooms(): Promise<ListRoomsResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("list_rooms_for_user")

    if (error) {
      if (error.code === "42P01") {
        return { ok: false, error: "Room tables not migrated." }
      }
      if (error.code === "42883" || error.code === "PGRST202") {
        return { ok: false, error: "list_rooms_for_user RPC not available." }
      }
      return { ok: false, error: error.message }
    }

    const rows = (data ?? []) as RoomRpcRow[]
    const rooms = rows.map((row) => rpcRowToRoomRecord(row, userId))

    return { ok: true, rooms }
  } catch (error) {
    return actionError(error)
  }
}

export async function joinRoom(roomId: string): Promise<JoinRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase.from("room_memberships").insert({
      room_id: roomId,
      profile_id: userId,
    })

    if (error) {
      // Already a member — treat as success
      if (error.code === "23505") return { ok: true }
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function leaveRoom(roomId: string): Promise<LeaveRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("room_memberships")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", userId)

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function getRoomThread(
  roomId: string,
  options?: { limit?: number; before?: string },
): Promise<RoomThreadResult> {
  try {
    if (!isUuid(roomId)) {
      return { ok: false, error: "Invalid room id." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_room_thread", {
      p_room_id: roomId,
      p_page_limit: options?.limit ?? 50,
      p_before: options?.before ?? null,
    })

    if (error) {
      if (error.code === "42883" || error.code === "PGRST202") {
        return { ok: false, error: "get_room_thread RPC not available." }
      }
      return { ok: false, error: error.message }
    }

    const payload = data as ThreadRpcResult

    const messages: ThreadMessage[] = (payload.messages ?? []).map((row) =>
      mapRoomThreadMessage(row as ThreadRpcMessage, userId),
    )

    return {
      ok: true,
      messages,
      hasMore: Boolean(payload.has_more),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function sendRoomMessage(
  roomId: string,
  body: string,
  options?: { jobId?: string },
): Promise<SendRoomMessageResult> {
  try {
    if (!isUuid(roomId)) {
      return { ok: false, error: "Invalid room id." }
    }

    const text = body.trim()
    const jobId = options?.jobId
    if (!text && !jobId) {
      return { ok: false, error: "Message cannot be empty." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    let jobShare: ThreadMessage["jobShare"]
    if (jobId) {
      if (!isUuid(jobId)) {
        return { ok: false, error: "Invalid job id." }
      }
      const jobResult = await fetchJobSharePayload(supabase, jobId)
      if (!jobResult.ok) return jobResult
      jobShare = jobResult.jobShare
    }

    const { data, error } = await supabase
      .from("room_messages")
      .insert({
        room_id: roomId,
        sender_id: userId,
        body: text,
        ...(jobId ? { job_id: jobId } : {}),
      })
      .select("id, sender_id, body, created_at, job_id")
      .single()

    if (error) return { ok: false, error: error.message }

    return {
      ok: true,
      message: {
        id: data.id,
        from: "me",
        text: data.body,
        time: formatMessageTime(data.created_at),
        createdAt: data.created_at,
        jobShare,
      },
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function markRoomRead(roomId: string): Promise<MarkRoomReadResult> {
  try {
    if (!isUuid(roomId)) return { ok: true }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("room_memberships")
      .update({ last_read_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("profile_id", userId)

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function getRoomsUnreadCount(): Promise<UnreadCountResult> {
  try {
    await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_rooms_unread_count")

    if (error) {
      if (error.code === "42883" || error.code === "PGRST202") {
        return { ok: true, count: 0 }
      }
      return { ok: false, error: error.message }
    }

    return { ok: true, count: typeof data === "number" ? data : 0 }
  } catch (error) {
    return actionError(error)
  }
}

export async function setRoomMessageReaction(
  messageId: string,
  emoji: string | null,
): Promise<SetRoomReactionResult> {
  try {
    if (!isUuid(messageId)) {
      return { ok: false, error: "Invalid message id." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    // Verify message exists and get its room_id
    const { data: msgRow, error: msgError } = await supabase
      .from("room_messages")
      .select("id, room_id")
      .eq("id", messageId)
      .maybeSingle()

    if (msgError) return { ok: false, error: msgError.message }
    if (!msgRow) return { ok: false, error: "Message not found." }

    // Verify user is a member
    const { data: membership } = await supabase
      .from("room_memberships")
      .select("profile_id")
      .eq("room_id", msgRow.room_id)
      .eq("profile_id", userId)
      .maybeSingle()

    if (!membership) {
      return { ok: false, error: "You must join the room to react." }
    }

    const trimmedEmoji = emoji?.trim() ?? null

    const { data: existing } = await supabase
      .from("room_message_reactions")
      .select("emoji")
      .eq("message_id", messageId)
      .eq("profile_id", userId)
      .maybeSingle()

    if (!trimmedEmoji || existing?.emoji === trimmedEmoji) {
      const { error: deleteError } = await supabase
        .from("room_message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("profile_id", userId)

      if (deleteError) return { ok: false, error: deleteError.message }
    } else {
      const { error: upsertError } = await supabase
        .from("room_message_reactions")
        .upsert(
          { message_id: messageId, profile_id: userId, emoji: trimmedEmoji },
          { onConflict: "message_id,profile_id" },
        )

      if (upsertError) return { ok: false, error: upsertError.message }
    }

    // Fetch updated reactions for this message
    const { data: reactionsData } = await supabase
      .from("room_message_reactions")
      .select("emoji, profile_id, profiles(full_name)")
      .eq("message_id", messageId)

    if (!reactionsData?.length) return { ok: true, reactions: [] }

    const grouped = new Map<
      string,
      { count: number; reactedByMe: boolean; reactors: { id: string; name: string }[] }
    >()

    for (const row of reactionsData) {
      const profileId = row.profile_id as string
      const emoji = row.emoji as string
      const profiles = row.profiles as
        | { full_name: string | null }
        | { full_name: string | null }[]
        | null
      const profile = Array.isArray(profiles) ? profiles[0] : profiles
      const name = profile?.full_name?.trim() || "Member"

      const existing = grouped.get(emoji)
      if (existing) {
        existing.count += 1
        existing.reactedByMe ||= profileId === userId
        existing.reactors.push({ id: profileId, name })
      } else {
        grouped.set(emoji, {
          count: 1,
          reactedByMe: profileId === userId,
          reactors: [{ id: profileId, name }],
        })
      }
    }

    const reactions: MessageReaction[] = [...grouped.entries()]
      .map(([emoji, value]) => ({
        emoji,
        count: value.count,
        reactedByMe: value.reactedByMe,
        reactors: value.reactors,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.emoji.localeCompare(b.emoji)
      })

    return { ok: true, reactions }
  } catch (error) {
    return actionError(error)
  }
}

// ---------------------------------------------------------------------------
// Admin actions
// ---------------------------------------------------------------------------

type CreateRoomInput = {
  name: string
  slug: string
  description: string
  icon: string
  isDefault: boolean
  sortOrder?: number
}

type UpdateRoomInput = Partial<Omit<CreateRoomInput, "slug">> & {
  slug?: string
  isArchived?: boolean
}

export async function adminListRooms(): Promise<AdminRoomsResult> {
  try {
    const { supabase } = await requireAdmin()

    const { data: rooms, error } = await supabase
      .from("community_rooms")
      .select("id, name, slug, description, icon, is_default, is_archived, sort_order, created_at")
      .order("sort_order", { ascending: true })

    if (error) return { ok: false, error: error.message }

    // Get member counts via RPC
    const { data: countsData } = await supabase.rpc("get_room_member_counts")
    const counts = (countsData ?? {}) as Record<string, number>

    const result: AdminRoomRecord[] = (rooms ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      icon: r.icon,
      isDefault: r.is_default,
      isArchived: r.is_archived,
      sortOrder: r.sort_order,
      memberCount: counts[r.id] ?? 0,
      createdAt: r.created_at,
    }))

    return { ok: true, rooms: result }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminCreateRoom(
  input: CreateRoomInput,
): Promise<AdminRoomResult> {
  try {
    const { supabase } = await requireAdmin()

    const name = input.name.trim()
    const slug = input.slug.trim()
    const description = input.description.trim()

    if (!name) return { ok: false, error: "Room name is required." }
    if (!slug) return { ok: false, error: "Room slug is required." }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens only." }
    }

    const icon = input.icon.trim() || DEFAULT_ROOM_EMOJI
    if (!icon) return { ok: false, error: "Room emoji is required." }

    const { data, error } = await supabase
      .from("community_rooms")
      .insert({
        name,
        slug,
        description,
        icon,
        is_default: input.isDefault,
        sort_order: input.sortOrder ?? 99,
      })
      .select("id, name, slug, description, icon, is_default, is_archived, sort_order, created_at")
      .single()

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "A room with that slug already exists." }
      }
      return { ok: false, error: error.message }
    }

    return {
      ok: true,
      room: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        isDefault: data.is_default,
        isArchived: data.is_archived,
        sortOrder: data.sort_order,
        memberCount: 0,
        createdAt: data.created_at,
      },
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminUpdateRoom(
  roomId: string,
  input: UpdateRoomInput,
): Promise<AdminRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const { supabase } = await requireAdmin()

    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name.trim()
    if (input.slug !== undefined) {
      const slug = input.slug.trim()
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens only." }
      }
      patch.slug = slug
    }
    if (input.description !== undefined) patch.description = input.description.trim()
    if (input.icon !== undefined) {
      const icon = input.icon.trim()
      if (!icon) return { ok: false, error: "Room emoji is required." }
      patch.icon = icon
    }
    if (input.isDefault !== undefined) patch.is_default = input.isDefault
    if (input.isArchived !== undefined) patch.is_archived = input.isArchived
    if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder

    const { data, error } = await supabase
      .from("community_rooms")
      .update(patch)
      .eq("id", roomId)
      .select("id, name, slug, description, icon, is_default, is_archived, sort_order, created_at")
      .single()

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "A room with that slug already exists." }
      }
      return { ok: false, error: error.message }
    }

    // Get member count
    const { data: countsData } = await supabase.rpc("get_room_member_counts")
    const counts = (countsData ?? {}) as Record<string, number>

    return {
      ok: true,
      room: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        isDefault: data.is_default,
        isArchived: data.is_archived,
        sortOrder: data.sort_order,
        memberCount: counts[data.id] ?? 0,
        createdAt: data.created_at,
      },
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminArchiveRoom(
  roomId: string,
  archived = true,
): Promise<ArchiveRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from("community_rooms")
      .update({ is_archived: archived })
      .eq("id", roomId)

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
