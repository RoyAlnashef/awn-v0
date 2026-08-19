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

export const jobPanelNotifications: JobPanelNotification[] = [
  {
    id: "jp-1",
    kind: "deadline",
    title: "Application closing soon",
    body: "Lighting Director — Sable Residency closes in 2 days.",
    time: "1h ago",
    read: false,
  },
  {
    id: "jp-2",
    kind: "saved_update",
    title: "Saved job was filled",
    body: "Monitor Engineer — Neon Tide European Leg is no longer accepting applications.",
    time: "5h ago",
    read: false,
  },
  {
    id: "jp-3",
    kind: "saved_update",
    title: "Saved job was reposted",
    body: "Backline Tech — Golden Hour Tour has been updated with new dates.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "jp-4",
    kind: "deadline",
    title: "Deadline tomorrow",
    body: "FOH Engineer — Riverbend Festival. Apply before Aug 19.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "jp-5",
    kind: "saved_update",
    title: "Pay rate updated",
    body: "Video Director — Ultraviolet Stadium Run now lists $850/day.",
    time: "2d ago",
    read: true,
  },
  {
    id: "jp-6",
    kind: "saved_update",
    title: "New details on saved job",
    body: "Production Manager — Cassette Kids added load-in and travel notes.",
    time: "3d ago",
    read: true,
  },
]
