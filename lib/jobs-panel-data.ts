import type { LucideIcon } from "lucide-react"
import { Bookmark, Briefcase, CalendarClock } from "lucide-react"

export type JobPanelNotificationKind =
  | "saved_update"
  | "deadline"
  | "search_match"

export interface JobPanelNotification {
  id: string
  kind: JobPanelNotificationKind
  title: string
  body: string
  /** Relative time label for placeholder display. */
  time: string
  read: boolean
  comingSoon?: boolean
}

export const jobPanelNotificationIcons: Record<
  JobPanelNotificationKind,
  LucideIcon
> = {
  saved_update: Bookmark,
  deadline: CalendarClock,
  search_match: Briefcase,
}

/** Placeholder until job notifications are backed by the API. */
export const jobPanelNotifications: JobPanelNotification[] = []
