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

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  /** Relative time label (e.g. 12m, 2h, 3d). */
  time: string
  read: boolean
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

/** Maps DB kind strings to UI icon/display kind. */
export function notificationDisplayKind(kind: string): NotificationKind {
  if (INVITE_DB_KINDS.has(kind)) return "invite"
  if (VOUCH_DB_KINDS.has(kind)) return "vouch"
  if (kind in notificationIcons) return kind as NotificationKind
  return "message"
}

/** Whether a notification belongs in the Mentions tab. */
export function isMentionNotification(kind: NotificationKind): boolean {
  return kind === "message"
}

/** Whether a notification is job-related in the API feed. */
export function isJobApiNotification(kind: NotificationKind): boolean {
  return kind === "job" || kind === "deadline"
}
