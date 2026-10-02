"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { DEFAULT_ROOM_EMOJI } from "@/lib/rooms/emoji"
import { formatJobPostedAt } from "@/lib/jobs/format"
import type { EngagementType, JobKind } from "@/lib/jobs-data"
import { getSessionUser } from "@/lib/auth/get-session-user"
import {
  jobToSharePayload,
  mapRpcJobShare,
  type JobShareRpcRow,
} from "@/lib/messages/job-share"
import {
  mapRpcMemberShare,
  type MemberShareRpcRow,
} from "@/lib/messages/member-share"
import { resolveMemberShareForInsert } from "@/lib/messages/actions"
import { mapRpcMentionSpans } from "@/lib/messages/mentions"
import {
  mapRpcReply,
  mapSnapshotToReply,
  type ReplyRpcRow,
  type ReplySnapshot,
} from "@/lib/messages/reply"
import type { MessageMentionSpan } from "@/lib/messages-data"
import { formatMessageTime, formatRelativeTime, isUuid } from "@/lib/messages/format"
import type {
  MessageReaction,
  MessageReactionTarget,
  ThreadMessage,
} from "@/lib/messages-data"
import { createNotification } from "@/lib/notifications/actions"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchBlockedProfileIdsForUser } from "@/lib/moderation/blocks"
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
  /** Whether the current user has muted this room. */
  muted: boolean
  isPrivate: boolean
  privateNote: string
  requiresJoinApproval: boolean
  joinRequestPending: boolean
}

type ActionError = { ok: false; error: string }

export type ListRoomsResult = { ok: true; rooms: RoomRecord[] } | ActionError
export type JoinRoomResult = { ok: true; requested?: boolean } | ActionError
export type CancelJoinRequestResult = { ok: true } | ActionError
export type LeaveRoomResult = { ok: true } | ActionError
export type MuteRoomResult = { ok: true } | ActionError
export type UnmuteRoomResult = { ok: true } | ActionError
export type MarkRoomReadResult = { ok: true } | ActionError
export type UnreadCountResult = { ok: true; count: number } | ActionError

export type RoomThreadResult =
  | { ok: true; messages: ThreadMessage[]; hasMore: boolean }
  | ActionError

export type RoomMemberPreview = {
  id: string
  name: string
  avatarUrl?: string
}

export type RoomMembersPreviewResult =
  | { ok: true; members: RoomMemberPreview[]; totalCount: number }
  | ActionError

export type SendRoomMessageResult =
  | { ok: true; message: ThreadMessage }
  | ActionError

export type SetRoomReactionResult =
  | {
      ok: true
      reactions: MessageReaction[]
      attachmentReactions: MessageReaction[]
    }
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
  isPrivate: boolean
  privateNote: string
  isArchived: boolean
  sortOrder: number
  memberCount: number
  pendingRequestCount: number
  createdAt: string
}

export type RoomAdminMember = {
  id: string
  name: string
  avatarUrl?: string
  joinedAt: string
}

export type RoomAdminPendingMember = {
  id: string
  name: string
  avatarUrl?: string
  requestedAt: string
}

export type RoomAdminBlockedMember = {
  id: string
  name: string
  avatarUrl?: string
  blockedAt: string
}

export type AdminRoomMembersResult =
  | {
      ok: true
      members: RoomAdminMember[]
      pending: RoomAdminPendingMember[]
      blocked: RoomAdminBlockedMember[]
    }
  | ActionError

export type AdminMemberActionResult = { ok: true } | ActionError

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
  muted: boolean
  is_private?: boolean
  private_note?: string
  requires_join_approval?: boolean
  join_request_pending?: boolean
}

type ThreadRpcMessage = ReplyRpcRow &
  JobShareRpcRow &
  MemberShareRpcRow & {
  id: string
  sender_id: string
  sender_name: string | null
  sender_avatar_url: string | null
  body: string
  created_at: string
  mention_spans?: unknown
  reactions?: ThreadRpcReaction[]
  attachment_reactions?: ThreadRpcReaction[]
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
  const memberShare = mapRpcMemberShare(row)
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
    attachmentReactions: mapRpcReactions(row.attachment_reactions),
    jobShare,
    memberShare,
    replyTo: mapRpcReply(row),
    mentions: mapRpcMentionSpans(row.mention_spans),
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
      "id, role, production, location, pay_rate, start_date, end_date, engagement, department, kind, created_at, status",
    )
    .eq("id", jobId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data || data.status === "deleted") {
    return { ok: false, error: "Job not found." }
  }

  return {
    ok: true,
    jobShare: jobToSharePayload({
      id: data.id,
      role: data.role,
      production: data.production ?? "",
      location: data.location ?? "",
      payRate: data.pay_rate ?? "",
      startDate: data.start_date,
      endDate: data.end_date,
      engagement: data.engagement as EngagementType,
      department: data.department ?? "",
      kind: data.kind as JobKind,
      postedAt: formatJobPostedAt(data.created_at),
    }),
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
  const muted = row.muted ?? false
  const unread =
    row.joined &&
    !muted &&
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
    muted,
    isPrivate: row.is_private ?? false,
    privateNote: row.private_note ?? "",
    requiresJoinApproval: row.requires_join_approval ?? false,
    joinRequestPending: row.join_request_pending ?? false,
  }
}

async function userHasRemovalRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roomId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("room_member_removals")
    .select("profile_id")
    .eq("room_id", roomId)
    .eq("profile_id", userId)
    .maybeSingle()

  return Boolean(data)
}

async function userIsBlockedFromRoom(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roomId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("room_member_blocks")
    .select("profile_id")
    .eq("room_id", roomId)
    .eq("profile_id", userId)
    .maybeSingle()

  return Boolean(data)
}

async function notifyAdminsOfJoinRequest(
  roomId: string,
  roomName: string,
  requesterId: string,
  requesterName: string,
) {
  const admin = createAdminClient()
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .in("role", ["owner", "admin"])
    .eq("status", "active")

  for (const adminProfile of admins ?? []) {
    if (adminProfile.id === requesterId) continue
    await createNotification({
      userId: adminProfile.id,
      kind: "room_join_request",
      title: `Join request for ${roomName}`,
      body: `${requesterName} requested to join ${roomName}.`,
      data: { roomId, profileId: requesterId },
    })
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

export async function requestJoinRoom(roomId: string): Promise<JoinRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: room, error: roomError } = await supabase
      .from("community_rooms")
      .select("id, name, is_private, is_archived")
      .eq("id", roomId)
      .maybeSingle()

    if (roomError) return { ok: false, error: roomError.message }
    if (!room || room.is_archived) {
      return { ok: false, error: "Group not found." }
    }

    if (await userIsBlockedFromRoom(supabase, roomId, userId)) {
      return { ok: false, error: "You cannot join this group." }
    }

    const removedByAdmin = await userHasRemovalRecord(supabase, roomId, userId)
    if (!room.is_private && !removedByAdmin) {
      return { ok: false, error: "This group does not require a join request." }
    }

    const { data: existingMember } = await supabase
      .from("room_memberships")
      .select("profile_id")
      .eq("room_id", roomId)
      .eq("profile_id", userId)
      .maybeSingle()

    if (existingMember) return { ok: true }

    const { error } = await supabase.from("room_join_requests").insert({
      room_id: roomId,
      profile_id: userId,
    })

    if (error) {
      if (error.code === "23505") return { ok: true, requested: true }
      return { ok: false, error: error.message }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle()

    await notifyAdminsOfJoinRequest(
      roomId,
      room.name,
      userId,
      profile?.full_name?.trim() || "A member",
    )

    return { ok: true, requested: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function cancelJoinRequest(
  roomId: string,
): Promise<CancelJoinRequestResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("room_join_requests")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", userId)

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function joinRoom(roomId: string): Promise<JoinRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: room, error: roomError } = await supabase
      .from("community_rooms")
      .select("is_private")
      .eq("id", roomId)
      .maybeSingle()

    if (roomError) return { ok: false, error: roomError.message }
    if (!room) return { ok: false, error: "Group not found." }

    if (await userIsBlockedFromRoom(supabase, roomId, userId)) {
      return { ok: false, error: "You cannot join this group." }
    }

    const removedByAdmin = await userHasRemovalRecord(supabase, roomId, userId)
    if (room.is_private || removedByAdmin) {
      return requestJoinRoom(roomId)
    }

    const { error } = await supabase.from("room_memberships").insert({
      room_id: roomId,
      profile_id: userId,
    })

    if (error) {
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

export async function muteRoom(roomId: string): Promise<MuteRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("room_memberships")
      .update({ muted_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("profile_id", userId)

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function unmuteRoom(roomId: string): Promise<UnmuteRoomResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("room_memberships")
      .update({ muted_at: null })
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

    const blockedIds = await fetchBlockedProfileIdsForUser(userId)

    const messages: ThreadMessage[] = (payload.messages ?? [])
      .filter(
        (row) =>
          !blockedIds.has((row as ThreadRpcMessage).sender_id),
      )
      .map((row) => mapRoomThreadMessage(row as ThreadRpcMessage, userId))

    return {
      ok: true,
      messages,
      hasMore: Boolean(payload.has_more),
    }
  } catch (error) {
    return actionError(error)
  }
}

type RoomMembershipProfileRow = {
  profile_id: string
  profiles:
    | {
        id: string
        full_name: string | null
        avatar_url: string | null
      }
    | {
        id: string
        full_name: string | null
        avatar_url: string | null
      }[]
    | null
}

function profileFromMembershipRow(
  row: RoomMembershipProfileRow,
): RoomMemberPreview | null {
  const profile = Array.isArray(row.profiles)
    ? row.profiles[0]
    : row.profiles
  if (!profile) return null

  return {
    id: profile.id,
    name: profile.full_name?.trim() || "Member",
    avatarUrl: profile.avatar_url ?? undefined,
  }
}

export async function getRoomMembersPreview(
  roomId: string,
): Promise<RoomMembersPreviewResult> {
  try {
    if (!isUuid(roomId)) {
      return { ok: false, error: "Invalid room id." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("room_memberships")
      .select("profile_id, profiles(id, full_name, avatar_url)")
      .eq("room_id", roomId)

    if (error) return { ok: false, error: error.message }
    const blockedIds = await fetchBlockedProfileIdsForUser(userId)

    const members = ((data ?? []) as unknown as RoomMembershipProfileRow[])
      .map(profileFromMembershipRow)
      .filter((member): member is RoomMemberPreview => member != null)
      .filter((member) => !blockedIds.has(member.id))

    return {
      ok: true,
      members,
      totalCount: members.length,
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function sendRoomMessage(
  roomId: string,
  body: string,
  options?: {
    jobId?: string
    sharedProfileId?: string
    replyToMessageId?: string
    replySnapshot?: ReplySnapshot
    mentionedProfileIds?: string[]
    mentionSpans?: MessageMentionSpan[]
  },
): Promise<SendRoomMessageResult> {
  try {
    if (!isUuid(roomId)) {
      return { ok: false, error: "Invalid room id." }
    }

    const text = body.trim()
    const jobId = options?.jobId
    const sharedProfileId = options?.sharedProfileId
    const replyToMessageId = options?.replyToMessageId
    const replySnapshot = options?.replySnapshot
    const mentionedProfileIds = options?.mentionedProfileIds ?? []
    const mentionSpans = options?.mentionSpans ?? []

    if (!text && !jobId && !sharedProfileId) {
      return { ok: false, error: "Message cannot be empty." }
    }
    if (replyToMessageId && !text) {
      return { ok: false, error: "Reply must include a message." }
    }
    if (jobId && sharedProfileId) {
      return { ok: false, error: "Cannot attach both a job and a member." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    if (replyToMessageId) {
      if (!isUuid(replyToMessageId)) {
        return { ok: false, error: "Invalid reply target." }
      }

      const { data: parentMessage, error: parentError } = await supabase
        .from("room_messages")
        .select("id")
        .eq("id", replyToMessageId)
        .eq("room_id", roomId)
        .maybeSingle()

      if (parentError) return { ok: false, error: parentError.message }
      if (!parentMessage) {
        return { ok: false, error: "Reply target not found in this room." }
      }
    }

    let jobShare: ThreadMessage["jobShare"]
    let memberShare: ThreadMessage["memberShare"]
    let sharedProfileIdForInsert: string | null = null
    let memberShareSnapshotForInsert: ThreadMessage["memberShare"] | null = null

    if (jobId) {
      if (!isUuid(jobId)) {
        return { ok: false, error: "Invalid job id." }
      }
      const jobResult = await fetchJobSharePayload(supabase, jobId)
      if (!jobResult.ok) return jobResult
      jobShare = jobResult.jobShare
    }

    if (sharedProfileId) {
      if (!isUuid(sharedProfileId)) {
        return { ok: false, error: "Invalid profile id." }
      }
      const memberResult = await resolveMemberShareForInsert(
        supabase,
        sharedProfileId,
      )
      if (!memberResult.ok) return memberResult
      memberShare = memberResult.memberShare
      sharedProfileIdForInsert = memberResult.sharedProfileId
      memberShareSnapshotForInsert = memberResult.memberShareSnapshot
    }

    if (mentionedProfileIds.length > 0) {
      const uniqueIds = [...new Set(mentionedProfileIds)]
      const { data: memberRows, error: memberError } = await supabase
        .from("room_memberships")
        .select("profile_id")
        .eq("room_id", roomId)
        .in("profile_id", uniqueIds)

      if (memberError) return { ok: false, error: memberError.message }

      const validIds = new Set(
        (memberRows ?? []).map((row) => row.profile_id as string),
      )
      const invalid = uniqueIds.filter((id) => !validIds.has(id))
      if (invalid.length > 0) {
        return { ok: false, error: "One or more mentioned members are not in this room." }
      }
    }

    const { data, error } = await supabase
      .from("room_messages")
      .insert({
        room_id: roomId,
        sender_id: userId,
        body: text,
        ...(jobId ? { job_id: jobId } : {}),
        ...(sharedProfileIdForInsert
          ? { shared_profile_id: sharedProfileIdForInsert }
          : {}),
        ...(memberShareSnapshotForInsert
          ? { member_share_snapshot: memberShareSnapshotForInsert }
          : {}),
        ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
        ...(replySnapshot ? { reply_snapshot: replySnapshot } : {}),
        ...(mentionedProfileIds.length > 0
          ? {
              mentioned_profile_ids: [...new Set(mentionedProfileIds)],
              mention_spans: mentionSpans,
            }
          : {}),
      })
      .select(
        "id, sender_id, body, created_at, job_id, shared_profile_id, member_share_snapshot, reply_to_message_id, reply_snapshot, mention_spans",
      )
      .single()

    if (error) return { ok: false, error: error.message }

    const replyTo = replySnapshot
      ? mapSnapshotToReply(replySnapshot)
      : mapRpcReply(data as ReplyRpcRow)

    return {
      ok: true,
      message: {
        id: data.id,
        from: "me",
        text: data.body,
        time: formatMessageTime(data.created_at),
        createdAt: data.created_at,
        jobShare,
        memberShare,
        replyTo,
        mentions: mapRpcMentionSpans(data.mention_spans),
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

    const { error: dismissError } = await supabase.rpc(
      "dismiss_room_notifications",
      { p_room_id: roomId },
    )

    if (dismissError && dismissError.code !== "42883" && dismissError.code !== "PGRST202") {
      return { ok: false, error: dismissError.message }
    }

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
  target: MessageReactionTarget = "body",
): Promise<SetRoomReactionResult> {
  try {
    if (!isUuid(messageId)) {
      return { ok: false, error: "Invalid message id." }
    }

    if (target !== "body" && target !== "attachment") {
      return { ok: false, error: "Invalid reaction target." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: msgRow, error: msgError } = await supabase
      .from("room_messages")
      .select("id, room_id")
      .eq("id", messageId)
      .maybeSingle()

    if (msgError) return { ok: false, error: msgError.message }
    if (!msgRow) return { ok: false, error: "Message not found." }

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
      .eq("target", target)
      .maybeSingle()

    if (!trimmedEmoji || existing?.emoji === trimmedEmoji) {
      const { error: deleteError } = await supabase
        .from("room_message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("profile_id", userId)
        .eq("target", target)

      if (deleteError) return { ok: false, error: deleteError.message }
    } else {
      const { error: upsertError } = await supabase
        .from("room_message_reactions")
        .upsert(
          {
            message_id: messageId,
            profile_id: userId,
            emoji: trimmedEmoji,
            target,
          },
          { onConflict: "message_id,profile_id,target" },
        )

      if (upsertError) return { ok: false, error: upsertError.message }
    }

    const { data: reactionsData } = await supabase
      .from("room_message_reactions")
      .select("emoji, profile_id, target, profiles(full_name)")
      .eq("message_id", messageId)

    if (!reactionsData?.length) {
      return { ok: true, reactions: [], attachmentReactions: [] }
    }

    const bodyGrouped = new Map<
      string,
      { count: number; reactedByMe: boolean; reactors: { id: string; name: string }[] }
    >()
    const attachmentGrouped = new Map<
      string,
      { count: number; reactedByMe: boolean; reactors: { id: string; name: string }[] }
    >()

    for (const row of reactionsData) {
      const profileId = row.profile_id as string
      const rowEmoji = row.emoji as string
      const rowTarget = (row.target as string | null) ?? "body"
      const profiles = row.profiles as
        | { full_name: string | null }
        | { full_name: string | null }[]
        | null
      const profile = Array.isArray(profiles) ? profiles[0] : profiles
      const name = profile?.full_name?.trim() || "Member"
      const grouped = rowTarget === "attachment" ? attachmentGrouped : bodyGrouped

      const existingGroup = grouped.get(rowEmoji)
      if (existingGroup) {
        existingGroup.count += 1
        existingGroup.reactedByMe ||= profileId === userId
        existingGroup.reactors.push({ id: profileId, name })
      } else {
        grouped.set(rowEmoji, {
          count: 1,
          reactedByMe: profileId === userId,
          reactors: [{ id: profileId, name }],
        })
      }
    }

    function toSortedReactions(
      grouped: Map<
        string,
        { count: number; reactedByMe: boolean; reactors: { id: string; name: string }[] }
      >,
    ): MessageReaction[] {
      return [...grouped.entries()]
        .map(([rowEmoji, value]) => ({
          emoji: rowEmoji,
          count: value.count,
          reactedByMe: value.reactedByMe,
          reactors: value.reactors,
        }))
        .sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count
          return a.emoji.localeCompare(b.emoji)
        })
    }

    return {
      ok: true,
      reactions: toSortedReactions(bodyGrouped),
      attachmentReactions: toSortedReactions(attachmentGrouped),
    }
  } catch (error) {
    return actionError(error)
  }
}

export type DeleteRoomMessageResult = { ok: true } | ActionError

export async function deleteRoomMessage(
  messageId: string,
): Promise<DeleteRoomMessageResult> {
  try {
    if (!isUuid(messageId)) {
      return { ok: false, error: "Invalid message id." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: msgRow, error: msgError } = await supabase
      .from("room_messages")
      .select("id, room_id, sender_id")
      .eq("id", messageId)
      .maybeSingle()

    if (msgError) return { ok: false, error: msgError.message }
    if (!msgRow) return { ok: false, error: "Message not found." }

    if (msgRow.sender_id !== userId) {
      return { ok: false, error: "You can only delete your own messages." }
    }

    const { data: membership } = await supabase
      .from("room_memberships")
      .select("profile_id")
      .eq("room_id", msgRow.room_id)
      .eq("profile_id", userId)
      .maybeSingle()

    if (!membership) {
      return { ok: false, error: "You must join the room to delete messages." }
    }

    const { error: deleteError } = await supabase
      .from("room_messages")
      .delete()
      .eq("id", messageId)

    if (deleteError) return { ok: false, error: deleteError.message }

    return { ok: true }
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
  isPrivate?: boolean
  privateNote?: string
  sortOrder?: number
}

type AdminRoomRow = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  is_default: boolean
  is_private: boolean
  private_note: string
  is_archived: boolean
  sort_order: number
  created_at: string
}

async function buildAdminRoomRecord(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  room: AdminRoomRow,
): Promise<AdminRoomRecord> {
  const [{ data: countsData }, { data: pendingData }] = await Promise.all([
    supabase.rpc("get_room_member_counts"),
    supabase.rpc("get_room_join_request_counts"),
  ])
  const counts = (countsData ?? {}) as Record<string, number>
  const pendingCounts = (pendingData ?? {}) as Record<string, number>

  return {
    id: room.id,
    name: room.name,
    slug: room.slug,
    description: room.description,
    icon: room.icon,
    isDefault: room.is_default,
    isPrivate: room.is_private,
    privateNote: room.private_note,
    isArchived: room.is_archived,
    sortOrder: room.sort_order,
    memberCount: counts[room.id] ?? 0,
    pendingRequestCount: pendingCounts[room.id] ?? 0,
    createdAt: room.created_at,
  }
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
      .select(
        "id, name, slug, description, icon, is_default, is_private, private_note, is_archived, sort_order, created_at",
      )
      .order("sort_order", { ascending: true })

    if (error) return { ok: false, error: error.message }

    const result: AdminRoomRecord[] = await Promise.all(
      (rooms ?? []).map((r) => buildAdminRoomRecord(supabase, r as AdminRoomRow)),
    )

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

    const isPrivate = input.isPrivate ?? false
    const isDefault = isPrivate ? false : input.isDefault
    const privateNote = isPrivate ? (input.privateNote ?? "").trim() : ""

    const { data, error } = await supabase
      .from("community_rooms")
      .insert({
        name,
        slug,
        description,
        icon,
        is_default: isDefault,
        is_private: isPrivate,
        private_note: privateNote,
        sort_order: input.sortOrder ?? 99,
      })
      .select(
        "id, name, slug, description, icon, is_default, is_private, private_note, is_archived, sort_order, created_at",
      )
      .single()

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "A room with that slug already exists." }
      }
      return { ok: false, error: error.message }
    }

    return {
      ok: true,
      room: await buildAdminRoomRecord(supabase, data as AdminRoomRow),
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
    if (input.isPrivate !== undefined) {
      patch.is_private = input.isPrivate
      if (input.isPrivate) {
        patch.is_default = false
      }
    }
    if (input.privateNote !== undefined) {
      patch.private_note = input.privateNote.trim()
    }
    if (input.isDefault !== undefined && input.isPrivate !== true) {
      patch.is_default = input.isDefault
    }
    if (input.isArchived !== undefined) patch.is_archived = input.isArchived
    if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder

    const { data, error } = await supabase
      .from("community_rooms")
      .update(patch)
      .eq("id", roomId)
      .select(
        "id, name, slug, description, icon, is_default, is_private, private_note, is_archived, sort_order, created_at",
      )
      .single()

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "A room with that slug already exists." }
      }
      return { ok: false, error: error.message }
    }

    return {
      ok: true,
      room: await buildAdminRoomRecord(supabase, data as AdminRoomRow),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminListRoomMembers(
  roomId: string,
): Promise<AdminRoomMembersResult> {
  try {
    if (!isUuid(roomId)) return { ok: false, error: "Invalid room id." }

    const { supabase } = await requireAdmin()

    const { data, error } = await supabase.rpc("get_room_admin_member_summary", {
      p_room_id: roomId,
    })

    if (error) return { ok: false, error: error.message }

    const payload = (data ?? { members: [], pending: [], blocked: [] }) as {
      members: {
        id: string
        name: string
        avatar_url: string | null
        joined_at: string
      }[]
      pending: {
        id: string
        name: string
        avatar_url: string | null
        requested_at: string
      }[]
      blocked: {
        id: string
        name: string
        avatar_url: string | null
        blocked_at: string
      }[]
    }

    return {
      ok: true,
      members: (payload.members ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        avatarUrl: m.avatar_url ?? undefined,
        joinedAt: m.joined_at,
      })),
      pending: (payload.pending ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        avatarUrl: m.avatar_url ?? undefined,
        requestedAt: m.requested_at,
      })),
      blocked: (payload.blocked ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        avatarUrl: m.avatar_url ?? undefined,
        blockedAt: m.blocked_at,
      })),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminApproveJoinRequest(
  roomId: string,
  profileId: string,
): Promise<AdminMemberActionResult> {
  try {
    if (!isUuid(roomId) || !isUuid(profileId)) {
      return { ok: false, error: "Invalid id." }
    }

    const { supabase } = await requireAdmin()

    const { data: request, error: requestError } = await supabase
      .from("room_join_requests")
      .select("room_id, profile_id")
      .eq("room_id", roomId)
      .eq("profile_id", profileId)
      .maybeSingle()

    if (requestError) return { ok: false, error: requestError.message }
    if (!request) return { ok: false, error: "Join request not found." }

    const { error: insertError } = await supabase.from("room_memberships").insert({
      room_id: roomId,
      profile_id: profileId,
    })

    if (insertError && insertError.code !== "23505") {
      return { ok: false, error: insertError.message }
    }

    const { error: deleteError } = await supabase
      .from("room_join_requests")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (deleteError) return { ok: false, error: deleteError.message }

    const { error: removalError } = await supabase
      .from("room_member_removals")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (removalError) return { ok: false, error: removalError.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminDenyJoinRequest(
  roomId: string,
  profileId: string,
): Promise<AdminMemberActionResult> {
  try {
    if (!isUuid(roomId) || !isUuid(profileId)) {
      return { ok: false, error: "Invalid id." }
    }

    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from("room_join_requests")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminBlockMember(
  roomId: string,
  profileId: string,
): Promise<AdminMemberActionResult> {
  try {
    if (!isUuid(roomId) || !isUuid(profileId)) {
      return { ok: false, error: "Invalid id." }
    }

    const { supabase, userId } = await requireAdmin()

    if (profileId === userId) {
      return { ok: false, error: "You cannot block yourself." }
    }

    const { data: targetProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", profileId)
      .maybeSingle()

    if (profileError) return { ok: false, error: profileError.message }
    if (!targetProfile) return { ok: false, error: "Member not found." }
    if (
      targetProfile.status === "active" &&
      (targetProfile.role === "owner" || targetProfile.role === "admin")
    ) {
      return { ok: false, error: "Admins cannot be blocked from a group." }
    }

    const { error: membershipError } = await supabase
      .from("room_memberships")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (membershipError) return { ok: false, error: membershipError.message }

    const { error: requestError } = await supabase
      .from("room_join_requests")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (requestError) return { ok: false, error: requestError.message }

    const { error: removalError } = await supabase
      .from("room_member_removals")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (removalError) return { ok: false, error: removalError.message }

    const { error: blockError } = await supabase.from("room_member_blocks").upsert(
      {
        room_id: roomId,
        profile_id: profileId,
        blocked_by: userId,
        blocked_at: new Date().toISOString(),
      },
      { onConflict: "room_id,profile_id" },
    )

    if (blockError) return { ok: false, error: blockError.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminUnblockMember(
  roomId: string,
  profileId: string,
): Promise<AdminMemberActionResult> {
  try {
    if (!isUuid(roomId) || !isUuid(profileId)) {
      return { ok: false, error: "Invalid id." }
    }

    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from("room_member_blocks")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (error) return { ok: false, error: error.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function adminRemoveMember(
  roomId: string,
  profileId: string,
): Promise<AdminMemberActionResult> {
  try {
    if (!isUuid(roomId) || !isUuid(profileId)) {
      return { ok: false, error: "Invalid id." }
    }

    const { supabase, userId } = await requireAdmin()

    const { error } = await supabase
      .from("room_memberships")
      .delete()
      .eq("room_id", roomId)
      .eq("profile_id", profileId)

    if (error) return { ok: false, error: error.message }

    const { error: removalError } = await supabase
      .from("room_member_removals")
      .upsert(
        {
          room_id: roomId,
          profile_id: profileId,
          removed_by: userId,
          removed_at: new Date().toISOString(),
        },
        { onConflict: "room_id,profile_id" },
      )

    if (removalError) return { ok: false, error: removalError.message }

    return { ok: true }
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
