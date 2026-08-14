"use server"

import { getSessionUser } from "@/lib/auth/get-session-user"
import {
  formatMessageTime,
  formatRelativeTime,
  isUuid,
} from "@/lib/messages/format"
import type {
  DirectConversation,
  MessageableMember,
  MessageReaction,
  MessageReactionTarget,
  ThreadMessage,
} from "@/lib/messages-data"
import { formatJobPostedAt } from "@/lib/jobs/format"
import type { EngagementType, JobKind } from "@/lib/jobs-data"
import { profileIsOnline } from "@/lib/presence/is-online"
import {
  jobToSharePayload,
  mapRpcJobShare,
  type JobShareRpcRow,
} from "@/lib/messages/job-share"
import {
  mapRpcMemberShare,
  personToSharePayload,
  type MemberShareRpcRow,
} from "@/lib/messages/member-share"
import {
  mapRpcReply,
  mapSnapshotToReply,
  type ReplyRpcRow,
  type ReplySnapshot,
} from "@/lib/messages/reply"
import type { MemberSharePayload } from "@/lib/messages-data"
import { people } from "@/lib/people-data"
import { createClient } from "@/lib/supabase/server"

type ActionError = { ok: false; error: string }

export type ListConversationsResult =
  | { ok: true; conversations: DirectConversation[] }
  | ActionError

export type ConversationThreadResult =
  | {
      ok: true
      messages: ThreadMessage[]
      otherLastReadAt: string | null
      hasMore: boolean
    }
  | ActionError

export type UnreadCountResult = { ok: true; count: number } | ActionError

type InboxRow = {
  conversation_id: string
  other_profile_id: string
  other_name: string
  other_title: string
  other_avatar_url: string | null
  other_last_active_at: string | null
  other_appear_offline: boolean | null
  last_message_body: string | null
  last_message_sender_id: string | null
  last_message_at: string | null
  my_last_read_at: string | null
  conversation_updated_at: string
}

type ThreadRpcMessage = ReplyRpcRow &
  JobShareRpcRow &
  MemberShareRpcRow & {
  id: string
  sender_id: string
  body: string
  created_at: string
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
  other_last_read_at: string | null
  has_more: boolean
}

export type SendMessageResult =
  | { ok: true; message: ThreadMessage }
  | ActionError

export type ConversationIdResult =
  | { ok: true; conversationId: string; conversation: DirectConversation }
  | ActionError

export type MarkReadResult = { ok: true } | ActionError

export type SearchMessageableUsersResult =
  | { ok: true; users: MessageableMember[] }
  | ActionError

export type SetMessageReactionResult =
  | {
      ok: true
      reactions: MessageReaction[]
      attachmentReactions: MessageReaction[]
    }
  | ActionError

type ProfileRow = {
  id: string
  full_name: string | null
  title: string | null
  avatar_url: string | null
  last_active_at: string | null
  appear_offline: boolean | null
}

type MessageRow = ReplyRpcRow &
  JobShareRpcRow &
  MemberShareRpcRow & {
  id: string
  sender_id: string
  body: string
  created_at: string
  member_share_snapshot?: MemberSharePayload | null
  reply_snapshot?: ReplySnapshot | null
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

function mapThreadRpcMessage(
  message: ThreadRpcMessage,
  userId: string,
  otherLastReadAt: string | null,
): ThreadMessage {
  const jobShare = mapRpcJobShare(message)
  const memberShare = mapRpcMemberShare(message)
  return {
    id: message.id,
    from: message.sender_id === userId ? "me" : "them",
    text: message.body,
    time: formatMessageTime(message.created_at),
    createdAt: message.created_at,
    readReceipt: readReceiptForMessage(message, userId, otherLastReadAt),
    reactions: mapRpcReactions(message.reactions),
    attachmentReactions: mapRpcReactions(message.attachment_reactions),
    jobShare,
    memberShare,
    replyTo: mapRpcReply(message),
  }
}

function mapInsertedMessageRow(
  message: MessageRow,
  attachments?: {
    jobShare?: ThreadMessage["jobShare"]
    memberShare?: ThreadMessage["memberShare"]
    replyTo?: ThreadMessage["replyTo"]
  },
): ThreadMessage {
  return {
    id: message.id,
    from: "me",
    text: message.body,
    time: formatMessageTime(message.created_at),
    createdAt: message.created_at,
    readReceipt: "sent",
    jobShare: attachments?.jobShare ?? mapRpcJobShare(message),
    memberShare: attachments?.memberShare ?? mapRpcMemberShare(message),
    replyTo: attachments?.replyTo ?? mapRpcReply(message),
  }
}

async function fetchMemberSharePayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
): Promise<
  | { ok: true; memberShare: NonNullable<ThreadMessage["memberShare"]> }
  | ActionError
> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, title, avatar_url, status")
    .eq("id", profileId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }

  if (data && data.status === "active") {
    return {
      ok: true,
      memberShare: {
        id: data.id,
        name: data.full_name?.trim() || "Member",
        role: data.title?.trim() || "AWN Member",
        avatar: data.avatar_url ?? undefined,
      },
    }
  }

  const mockPerson = people.find((person) => person.id === profileId)
  if (mockPerson) {
    return { ok: true, memberShare: personToSharePayload(mockPerson) }
  }

  return { ok: false, error: "Member not found." }
}

export async function resolveMemberShareForInsert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
): Promise<
  | {
      ok: true
      memberShare: NonNullable<ThreadMessage["memberShare"]>
      sharedProfileId: string | null
      memberShareSnapshot: NonNullable<ThreadMessage["memberShare"]> | null
    }
  | ActionError
> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, title, avatar_url, status")
    .eq("id", profileId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }

  if (data && data.status === "active") {
    const memberShare = {
      id: data.id,
      name: data.full_name?.trim() || "Member",
      role: data.title?.trim() || "AWN Member",
      avatar: data.avatar_url ?? undefined,
    }
    return {
      ok: true,
      memberShare,
      sharedProfileId: profileId,
      memberShareSnapshot: null,
    }
  }

  const mockPerson = people.find((person) => person.id === profileId)
  if (mockPerson) {
    const memberShare = personToSharePayload(mockPerson)
    return {
      ok: true,
      memberShare,
      sharedProfileId: null,
      memberShareSnapshot: memberShare,
    }
  }

  return { ok: false, error: "Member not found." }
}

export type MemberSharePayloadResult =
  | { ok: true; memberShare: NonNullable<ThreadMessage["memberShare"]> }
  | ActionError

export async function getMemberSharePayload(
  profileId: string,
): Promise<MemberSharePayloadResult> {
  try {
    if (!isUuid(profileId)) {
      return { ok: false, error: "Invalid profile id." }
    }

    await requireUserId()
    const supabase = await createClient()
    return fetchMemberSharePayload(supabase, profileId)
  } catch (error) {
    return actionError(error)
  }
}

async function fetchJobSharePayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
): Promise<{ ok: true; jobShare: NonNullable<ThreadMessage["jobShare"]> } | ActionError> {
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

function buildPreview(
  body: string,
  senderId: string,
  currentUserId: string,
): string {
  const trimmed = body.trim()
  if (senderId === currentUserId) {
    return trimmed.startsWith("You:") ? trimmed : `You: ${trimmed}`
  }
  return trimmed
}

function readReceiptForMessage(
  message: MessageRow,
  currentUserId: string,
  otherLastReadAt: string | null,
): ThreadMessage["readReceipt"] | undefined {
  if (message.sender_id !== currentUserId) return undefined
  if (!otherLastReadAt) return "delivered"
  if (new Date(otherLastReadAt) >= new Date(message.created_at)) return "read"
  return "delivered"
}

function mapRpcReactions(
  reactions: ThreadRpcReaction[] | undefined,
): MessageReaction[] | undefined {
  if (!reactions?.length) return undefined
  return reactions.map((reaction) => ({
    emoji: reaction.emoji,
    count: reaction.count,
    reactedByMe: reaction.reacted_by_me,
    reactors: reaction.reactors ?? [],
  }))
}

async function fetchMessageReactions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  messageId: string,
  currentUserId: string,
): Promise<{
  reactions: MessageReaction[]
  attachmentReactions: MessageReaction[]
}> {
  const { data, error } = await supabase
    .from("dm_message_reactions")
    .select("emoji, profile_id, target, created_at, profiles(full_name)")
    .eq("message_id", messageId)

  if (error || !data?.length) {
    return { reactions: [], attachmentReactions: [] }
  }

  const bodyGrouped = new Map<
    string,
    { count: number; reactedByMe: boolean; reactors: { id: string; name: string }[] }
  >()
  const attachmentGrouped = new Map<
    string,
    { count: number; reactedByMe: boolean; reactors: { id: string; name: string }[] }
  >()

  for (const row of data) {
    const profileId = row.profile_id as string
    const emoji = row.emoji as string
    const target = (row.target as string | null) ?? "body"
    const profiles = row.profiles as
      | { full_name: string | null }
      | { full_name: string | null }[]
      | null
    const profile = Array.isArray(profiles) ? profiles[0] : profiles
    const name = profile?.full_name?.trim() || "Member"
    const grouped = target === "attachment" ? attachmentGrouped : bodyGrouped

    const existing = grouped.get(emoji)
    if (existing) {
      existing.count += 1
      existing.reactedByMe ||= profileId === currentUserId
      existing.reactors.push({ id: profileId, name })
    } else {
      grouped.set(emoji, {
        count: 1,
        reactedByMe: profileId === currentUserId,
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
  }

  return {
    reactions: toSortedReactions(bodyGrouped),
    attachmentReactions: toSortedReactions(attachmentGrouped),
  }
}

async function fetchOtherParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  currentUserId: string,
): Promise<ProfileRow | null> {
  const { data: participants, error } = await supabase
    .from("dm_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)

  if (error || !participants?.length) return null

  const otherId = participants.find((p) => p.profile_id !== currentUserId)
    ?.profile_id
  if (!otherId) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, title, avatar_url, last_active_at, appear_offline")
    .eq("id", otherId)
    .maybeSingle()

  return profile as ProfileRow | null
}

function profileToMessageableMember(profile: ProfileRow): MessageableMember {
  return {
    id: profile.id,
    name: profile.full_name?.trim() || "Member",
    role: profile.title?.trim() || "AWN Member",
    homeBase: "",
    avatar: profile.avatar_url ?? undefined,
    online: profileIsOnline(
      profile.last_active_at,
      profile.appear_offline ?? false,
    ),
  }
}

function profileToConversation(
  conversationId: string,
  profile: ProfileRow,
  preview: string,
  updatedAt: string,
  unread: boolean,
): DirectConversation {
  return {
    id: conversationId,
    name: profile.full_name?.trim() || "Member",
    role: profile.title?.trim() || "AWN Member",
    preview,
    time: formatRelativeTime(updatedAt),
    unread,
    online: profileIsOnline(
      profile.last_active_at,
      profile.appear_offline ?? false,
    ),
    avatar: profile.avatar_url ?? undefined,
    otherProfileId: profile.id,
    isPersisted: true,
  }
}

function inboxRowToConversation(
  row: InboxRow,
  currentUserId: string,
): DirectConversation {
  const online = profileIsOnline(
    row.other_last_active_at,
    row.other_appear_offline ?? false,
  )
  const preview = row.last_message_body
    ? buildPreview(
        row.last_message_body,
        row.last_message_sender_id ?? currentUserId,
        currentUserId,
      )
    : "New conversation"
  const updatedAt =
    row.last_message_at ?? row.conversation_updated_at
  const unread = row.last_message_at
    ? row.last_message_sender_id !== currentUserId &&
      (!row.my_last_read_at ||
        new Date(row.last_message_at) > new Date(row.my_last_read_at))
    : false

  return {
    id: row.conversation_id,
    name: row.other_name,
    role: row.other_title,
    preview,
    time: formatRelativeTime(updatedAt),
    unread,
    online,
    avatar: row.other_avatar_url ?? undefined,
    otherProfileId: row.other_profile_id,
    isPersisted: true,
  }
}

export async function listConversations(): Promise<ListConversationsResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("list_dm_inbox")

    if (error) {
      if (error.code === "42883" || error.code === "PGRST202") {
        return { ok: false, error: "DM performance migration not applied." }
      }
      if (error.code === "42P01") {
        return { ok: false, error: "DM tables not migrated." }
      }
      return { ok: false, error: error.message }
    }

    const conversations = ((data ?? []) as InboxRow[]).map((row) =>
      inboxRowToConversation(row, userId),
    )

    return { ok: true, conversations }
  } catch (error) {
    return actionError(error)
  }
}

export async function getUnreadCount(): Promise<UnreadCountResult> {
  try {
    await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_dm_unread_count")

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

export async function getConversationThread(
  conversationId: string,
  options?: { limit?: number; before?: string },
): Promise<ConversationThreadResult> {
  try {
    if (!isUuid(conversationId)) {
      return { ok: false, error: "Invalid conversation id." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_dm_thread", {
      p_conversation_id: conversationId,
      p_page_limit: options?.limit ?? 50,
      p_before: options?.before ?? null,
    })

    if (error) {
      if (error.code === "42883" || error.code === "PGRST202") {
        return { ok: false, error: "DM performance migration not applied." }
      }
      return { ok: false, error: error.message }
    }

    const payload = data as ThreadRpcResult
    const otherLastReadAt = payload.other_last_read_at ?? null

    const thread: ThreadMessage[] = (payload.messages ?? []).map((row) =>
      mapThreadRpcMessage(row as ThreadRpcMessage, userId, otherLastReadAt),
    )

    return {
      ok: true,
      messages: thread,
      otherLastReadAt,
      hasMore: Boolean(payload.has_more),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function sendMessage(
  conversationId: string,
  body: string,
  options?: {
    jobId?: string
    sharedProfileId?: string
    replyToMessageId?: string
    replySnapshot?: ReplySnapshot
  },
): Promise<SendMessageResult> {
  try {
    if (!isUuid(conversationId)) {
      return { ok: false, error: "Invalid conversation id." }
    }

    const text = body.trim()
    const jobId = options?.jobId
    const sharedProfileId = options?.sharedProfileId
    const replyToMessageId = options?.replyToMessageId
    const replySnapshot = options?.replySnapshot

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
        .from("dm_messages")
        .select("id")
        .eq("id", replyToMessageId)
        .eq("conversation_id", conversationId)
        .maybeSingle()

      if (parentError) return { ok: false, error: parentError.message }
      if (!parentMessage) {
        return { ok: false, error: "Reply target not found in this conversation." }
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

    const insertPayload = {
      conversation_id: conversationId,
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
    }

    const { data, error } = await supabase
      .from("dm_messages")
      .insert(insertPayload)
      .select(
        "id, sender_id, body, created_at, job_id, shared_profile_id, member_share_snapshot, reply_to_message_id, reply_snapshot",
      )
      .single()

    if (error) return { ok: false, error: error.message }

    const message = data as MessageRow
    const replyTo = replySnapshot
      ? mapSnapshotToReply(replySnapshot)
      : mapRpcReply(message)

    return {
      ok: true,
      message: mapInsertedMessageRow(message, {
        jobShare,
        memberShare,
        replyTo,
      }),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function markConversationRead(
  conversationId: string,
): Promise<MarkReadResult> {
  try {
    if (!isUuid(conversationId)) {
      return { ok: true }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("dm_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("profile_id", userId)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function getOrCreateConversation(
  otherProfileId: string,
): Promise<ConversationIdResult> {
  try {
    if (!isUuid(otherProfileId)) {
      return { ok: false, error: "Invalid profile id." }
    }

    const userId = await requireUserId()
    if (otherProfileId === userId) {
      return { ok: false, error: "You cannot message yourself." }
    }

    const supabase = await createClient()

    const { data: conversationId, error: rpcError } = await supabase.rpc(
      "get_or_create_dm_conversation",
      { other_profile_id: otherProfileId },
    )

    if (rpcError) {
      return { ok: false, error: rpcError.message }
    }

    if (!conversationId || typeof conversationId !== "string") {
      return { ok: false, error: "Failed to open conversation." }
    }

    const profile = await fetchOtherParticipant(
      supabase,
      conversationId,
      userId,
    )
    if (!profile) {
      return { ok: false, error: "Conversation participant not found." }
    }

    const { data: conversationRow } = await supabase
      .from("dm_conversations")
      .select(
        "updated_at, last_message_body, last_message_sender_id, last_message_at",
      )
      .eq("id", conversationId)
      .maybeSingle()

    const { data: membership } = await supabase
      .from("dm_participants")
      .select("last_read_at")
      .eq("conversation_id", conversationId)
      .eq("profile_id", userId)
      .maybeSingle()

    const preview = conversationRow?.last_message_body
      ? buildPreview(
          conversationRow.last_message_body,
          conversationRow.last_message_sender_id ?? userId,
          userId,
        )
      : "New conversation"
    const updatedAt =
      conversationRow?.last_message_at ??
      conversationRow?.updated_at ??
      new Date().toISOString()
    const unread = conversationRow?.last_message_at
      ? conversationRow.last_message_sender_id !== userId &&
        (!membership?.last_read_at ||
          new Date(conversationRow.last_message_at) >
            new Date(membership.last_read_at))
      : false

    const conversation = profileToConversation(
      conversationId,
      profile,
      preview,
      updatedAt,
      unread,
    )

    return {
      ok: true,
      conversationId,
      conversation,
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function searchMessageableUsers(
  query = "",
): Promise<SearchMessageableUsersResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()
    const trimmed = query.trim()

    let request = supabase
      .from("profiles")
      .select("id, full_name, title, avatar_url, last_active_at, appear_offline")
      .eq("status", "active")
      .neq("id", userId)
      .order("full_name", { ascending: true })
      .limit(50)

    if (trimmed) {
      const pattern = `%${trimmed.replace(/,/g, "")}%`
      request = request.or(
        `full_name.ilike.${pattern},title.ilike.${pattern},email.ilike.${pattern}`,
      )
    }

    const { data, error } = await request

    if (error) {
      if (error.code === "42P01") {
        return { ok: false, error: "Profiles table not available." }
      }
      return { ok: false, error: error.message }
    }

    const users = ((data ?? []) as ProfileRow[]).map(profileToMessageableMember)

    users.sort((a, b) => Number(b.online) - Number(a.online))

    return { ok: true, users }
  } catch (error) {
    return actionError(error)
  }
}

export async function setMessageReaction(
  messageId: string,
  emoji: string | null,
  target: MessageReactionTarget = "body",
): Promise<SetMessageReactionResult> {
  try {
    if (!isUuid(messageId)) {
      return { ok: false, error: "Invalid message id." }
    }

    if (target !== "body" && target !== "attachment") {
      return { ok: false, error: "Invalid reaction target." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: messageRow, error: messageError } = await supabase
      .from("dm_messages")
      .select("id, conversation_id")
      .eq("id", messageId)
      .maybeSingle()

    if (messageError) return { ok: false, error: messageError.message }
    if (!messageRow) return { ok: false, error: "Message not found." }

    const { data: participant } = await supabase
      .from("dm_participants")
      .select("profile_id")
      .eq("conversation_id", messageRow.conversation_id)
      .eq("profile_id", userId)
      .maybeSingle()

    if (!participant) {
      return { ok: false, error: "Not a participant in this conversation." }
    }

    const trimmedEmoji = emoji?.trim() ?? null

    const { data: existing } = await supabase
      .from("dm_message_reactions")
      .select("emoji")
      .eq("message_id", messageId)
      .eq("profile_id", userId)
      .eq("target", target)
      .maybeSingle()

    if (!trimmedEmoji || existing?.emoji === trimmedEmoji) {
      const { error: deleteError } = await supabase
        .from("dm_message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("profile_id", userId)
        .eq("target", target)

      if (deleteError) return { ok: false, error: deleteError.message }
    } else {
      const { error: upsertError } = await supabase
        .from("dm_message_reactions")
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

    const { reactions, attachmentReactions } = await fetchMessageReactions(
      supabase,
      messageId,
      userId,
    )
    return { ok: true, reactions, attachmentReactions }
  } catch (error) {
    return actionError(error)
  }
}

export type DeleteMessageResult = { ok: true } | ActionError

export async function deleteMessage(
  messageId: string,
): Promise<DeleteMessageResult> {
  try {
    if (!isUuid(messageId)) {
      return { ok: false, error: "Invalid message id." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: messageRow, error: messageError } = await supabase
      .from("dm_messages")
      .select("id, conversation_id, sender_id")
      .eq("id", messageId)
      .maybeSingle()

    if (messageError) return { ok: false, error: messageError.message }
    if (!messageRow) return { ok: false, error: "Message not found." }

    if (messageRow.sender_id !== userId) {
      return { ok: false, error: "You can only unsend your own messages." }
    }

    const { data: participant } = await supabase
      .from("dm_participants")
      .select("profile_id")
      .eq("conversation_id", messageRow.conversation_id)
      .eq("profile_id", userId)
      .maybeSingle()

    if (!participant) {
      return { ok: false, error: "Not a participant in this conversation." }
    }

    const { error: deleteError } = await supabase
      .from("dm_messages")
      .delete()
      .eq("id", messageId)

    if (deleteError) return { ok: false, error: deleteError.message }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
