import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  CalendarClock,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserPlus,
} from "lucide-react"

export type NotificationKind =
  | "job"
  | "message"
  | "connection"
  | "verification"
  | "deadline"
  | "invite"

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
}

const INVITE_DB_KINDS = new Set(["invite_accepted", "application_denied"])

/** Maps DB kind strings to UI icon/display kind. */
export function notificationDisplayKind(kind: string): NotificationKind {
  if (INVITE_DB_KINDS.has(kind)) return "invite"
  if (kind in notificationIcons) return kind as NotificationKind
  return "message"
}
