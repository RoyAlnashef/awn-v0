import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  CalendarClock,
  Mail,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  UserPlus,
} from "lucide-react"

export type NotificationKind =
  | "job"
  | "message"
  | "connection"
  | "verification"
  | "deadline"
  | "invite"
  | "vouch"

export interface NotificationData {
  conversationId?: string
  messageCount?: number
  latestMessageId?: string
  jobId?: string
  applicationId?: string
  roomId?: string
  profileId?: string
  mentionCount?: number
  replyCount?: number
}

export interface AppNotification {
  id: string
  /** Raw DB kind (e.g. dm_message, invite_accepted). */
  dbKind: string
  kind: NotificationKind
  title: string
  body: string
  /** Relative time label (e.g. 12m, 2h, 3d). */
  time: string
  read: boolean
  data?: NotificationData
}

export const notificationIcons: Record<NotificationKind, LucideIcon> = {
  job: Briefcase,
  message: MessageSquare,
  connection: UserPlus,
  verification: ShieldCheck,
  deadline: CalendarClock,
  invite: Mail,
  vouch: ThumbsUp,
}

const INVITE_DB_KINDS = new Set(["invite_accepted", "application_denied"])
const VOUCH_DB_KINDS = new Set(["credit_vouched", "profile_vouched"])
const DM_DB_KINDS = new Set(["dm_message", "message"])
const JOB_DB_KINDS = new Set([
  "application_accepted",
  "job_application_received",
  "job_under_review",
  "job_review_released",
  "job_review_closed",
])

const JOB_POSTER_MANAGEMENT_DB_KINDS = new Set([
  "job_application_received",
  "job_under_review",
  "job_review_released",
  "job_review_closed",
])
const ROOM_MENTION_DB_KINDS = new Set(["room_mention"])
const ROOM_REPLY_DB_KINDS = new Set(["room_reply"])
const ROOM_JOIN_REQUEST_DB_KINDS = new Set(["room_join_request"])
const MENTION_TAB_DB_KINDS = new Set(["room_mention", "room_reply"])

/** Maps DB kind strings to UI icon/display kind. */
export function notificationDisplayKind(kind: string): NotificationKind {
  if (JOB_DB_KINDS.has(kind)) return "job"
  if (INVITE_DB_KINDS.has(kind)) return "invite"
  if (VOUCH_DB_KINDS.has(kind)) return "vouch"
  if (DM_DB_KINDS.has(kind)) return "message"
  if (kind in notificationIcons) return kind as NotificationKind
  return "message"
}

/** Whether this notification is an aggregated direct message. */
export function isDmNotification(notification: AppNotification): boolean {
  return notification.dbKind === "dm_message"
}

/** Whether this notification should appear in the notifications panel. */
export function isPanelNotification(notification: AppNotification): boolean {
  return !isDmNotification(notification)
}

/** Conversation id for navigating to a DM notification thread. */
export function getDmConversationId(
  notification: AppNotification,
): string | undefined {
  return notification.data?.conversationId
}

/** Whether a notification is an aggregated group @mention. */
export function isRoomMentionNotification(notification: AppNotification): boolean {
  return ROOM_MENTION_DB_KINDS.has(notification.dbKind)
}

/** Whether a notification is an aggregated group reply. */
export function isRoomReplyNotification(notification: AppNotification): boolean {
  return ROOM_REPLY_DB_KINDS.has(notification.dbKind)
}

/** Whether a notification belongs in the Mentions tab. */
export function isMentionTabNotification(notification: AppNotification): boolean {
  return MENTION_TAB_DB_KINDS.has(notification.dbKind)
}

/** @deprecated Use isMentionTabNotification for tab filtering. */
export function isMentionNotification(kind: NotificationKind): boolean {
  return kind === "message"
}

/** Room id for navigating to a group mention/reply notification. */
export function getRoomNotificationRoomId(
  notification: AppNotification,
): string | undefined {
  return notification.data?.roomId
}

/** Whether a notification is a private group join request for admins. */
export function isRoomJoinRequestNotification(
  notification: AppNotification,
): boolean {
  return ROOM_JOIN_REQUEST_DB_KINDS.has(notification.dbKind)
}

/** Whether a notification is job-related in the API feed. */
export function isJobApiNotification(dbKind: string): boolean {
  return JOB_DB_KINDS.has(dbKind)
}

/** Job notifications that should open poster management for a listing. */
export function isJobPosterManagementNotification(dbKind: string): boolean {
  return JOB_POSTER_MANAGEMENT_DB_KINDS.has(dbKind)
}

/** Job notifications that should scroll to the applicants table on the management page. */
export function isJobApplicantsSectionNotification(dbKind: string): boolean {
  return dbKind === "job_application_received"
}

/** Conversation id for navigating from a job acceptance notification. */
export function getJobNotificationConversationId(
  notification: AppNotification,
): string | undefined {
  return notification.data?.conversationId
}
