import type {
  JobSharePayload,
  MemberSharePayload,
  MessageReplyPayload,
  ThreadMessage,
} from "@/lib/messages-data"
import { messageDisplayPreview } from "@/lib/messages/member-share"
import { mapRpcJobShare, type JobShareRpcRow } from "@/lib/messages/job-share"
import {
  mapRpcMemberShare,
  type MemberShareRpcRow,
} from "@/lib/messages/member-share"

export type ReplySnapshot = {
  messageId: string
  authorName: string
  preview: string
}

export type ReplyRpcRow = JobShareRpcRow &
  MemberShareRpcRow & {
    reply_to_message_id?: string | null
    reply_snapshot?: ReplySnapshot | null
    reply_body?: string | null
    reply_sender_id?: string | null
    reply_sender_name?: string | null
    reply_job_id?: string | null
    reply_job_role?: string | null
    reply_job_production?: string | null
    reply_job_location?: string | null
    reply_job_pay_rate?: string | null
    reply_job_start_date?: string | null
    reply_job_end_date?: string | null
    reply_job_engagement?: string | null
    reply_shared_profile_id?: string | null
    reply_shared_profile_name?: string | null
    reply_shared_profile_title?: string | null
    reply_shared_profile_avatar_url?: string | null
    reply_member_share_snapshot?: MemberSharePayload | null
  }

function previewFromParts(
  body: string | null | undefined,
  jobShare?: JobSharePayload,
  memberShare?: MemberSharePayload,
): string {
  return messageDisplayPreview(body ?? "", jobShare, memberShare)
}

export function buildReplyPreview(message: ThreadMessage): string {
  return messageDisplayPreview(
    message.text,
    message.jobShare,
    message.memberShare,
  )
}

export function buildReplySnapshot(
  message: ThreadMessage,
  authorName: string,
): ReplySnapshot {
  return {
    messageId: message.id,
    authorName,
    preview: buildReplyPreview(message),
  }
}

export function copyMessageText(message: ThreadMessage): string {
  return buildReplyPreview(message)
}

export function replyAuthorNameForMessage(
  message: ThreadMessage,
  options: {
    conversationName?: string
    currentUserName?: string
  },
): string {
  if (message.from === "me") {
    return options.currentUserName?.trim() || "You"
  }
  if (message.author?.trim()) return message.author.trim()
  return options.conversationName?.trim() || "Member"
}

export function mapSnapshotToReply(
  snapshot: ReplySnapshot,
  unavailable = false,
): MessageReplyPayload {
  return {
    messageId: snapshot.messageId,
    authorName: snapshot.authorName,
    preview: snapshot.preview,
    unavailable,
  }
}

export function mapRpcReply(row: ReplyRpcRow): MessageReplyPayload | undefined {
  const snapshot = row.reply_snapshot as ReplySnapshot | null | undefined
  const hasParentRow = row.reply_body != null || row.reply_sender_id != null

  if (hasParentRow) {
    const jobShare = mapRpcJobShare({
      job_id: row.reply_job_id,
      job_role: row.reply_job_role,
      job_production: row.reply_job_production,
      job_location: row.reply_job_location,
      job_pay_rate: row.reply_job_pay_rate,
      job_start_date: row.reply_job_start_date,
      job_end_date: row.reply_job_end_date,
      job_engagement: row.reply_job_engagement,
    })
    const memberShare = mapRpcMemberShare({
      shared_profile_id: row.reply_shared_profile_id,
      shared_profile_name: row.reply_shared_profile_name,
      shared_profile_title: row.reply_shared_profile_title,
      shared_profile_avatar_url: row.reply_shared_profile_avatar_url,
      member_share_snapshot: row.reply_member_share_snapshot,
    })

    return {
      messageId: row.reply_to_message_id ?? snapshot?.messageId ?? "",
      authorName:
        row.reply_sender_name?.trim() ||
        snapshot?.authorName ||
        "Member",
      preview: previewFromParts(row.reply_body, jobShare, memberShare),
    }
  }

  if (snapshot?.preview) {
    return mapSnapshotToReply(snapshot, !row.reply_to_message_id)
  }

  return undefined
}

export function buildPendingReplyPayload(
  message: ThreadMessage,
  authorName: string,
): MessageReplyPayload {
  return {
    messageId: message.id,
    authorName,
    preview: buildReplyPreview(message),
  }
}

/** Map reply metadata from a Supabase realtime INSERT row. */
export function mapRealtimeReply(row: {
  reply_to_message_id?: string | null
  reply_snapshot?: ReplySnapshot | null
}): MessageReplyPayload | undefined {
  const snapshot = row.reply_snapshot as ReplySnapshot | null | undefined

  if (snapshot?.preview) {
    return mapSnapshotToReply(snapshot, !row.reply_to_message_id)
  }

  if (row.reply_to_message_id) {
    return {
      messageId: row.reply_to_message_id,
      authorName: snapshot?.authorName ?? "Member",
      preview: "",
      unavailable: true,
    }
  }

  return undefined
}
