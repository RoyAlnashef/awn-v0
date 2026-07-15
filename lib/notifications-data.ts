import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  CalendarClock,
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

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  /** Relative time label for placeholder display. */
  time: string
  read: boolean
}

export const notificationIcons: Record<NotificationKind, LucideIcon> = {
  job: Briefcase,
  message: MessageSquare,
  connection: UserPlus,
  verification: ShieldCheck,
  deadline: CalendarClock,
}

export const notifications: AppNotification[] = [
  {
    id: "1",
    kind: "job",
    title: "New role matches your profile",
    body: "Monitor Engineer — Neon Tide, European Leg. Posted by Priya Anand.",
    time: "12m ago",
    read: false,
  },
  {
    id: "2",
    kind: "message",
    title: "Marcus Bell sent you a message",
    body: "“Are you around for the Ultraviolet stadium run in September?”",
    time: "40m ago",
    read: false,
  },
  {
    id: "3",
    kind: "connection",
    title: "Sofia Marín wants to connect",
    body: "Production Manager · 47 vouches · worked on Golden Hour.",
    time: "2h ago",
    read: false,
  },
  {
    id: "4",
    kind: "verification",
    title: "Credit verified",
    body: "Your role on Cassette Kids — World Tour was confirmed by the TM.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    kind: "deadline",
    title: "Application closing soon",
    body: "Lighting Director — Sable Residency closes in 2 days.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "6",
    kind: "message",
    title: "Aisha Khan replied in Riverbend crew",
    body: "“Load-in got pushed to 7am — heads up everyone.”",
    time: "2d ago",
    read: true,
  },
]
