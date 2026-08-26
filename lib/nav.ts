import {
  Radio,
  Briefcase,
  Contact,
  MessagesSquare,
  Group,
  UserCheck,
  ClipboardList,
  MailPlus,
  type LucideIcon,
} from "lucide-react"

export type NavSubItem = {
  title: string
  href: string
}

export type NavItem = {
  title: string
  href: string
  description: string
  icon: LucideIcon
  badge?: string
  /** When set, sidebar reads a live count from the matching provider. */
  liveBadge?: "messages" | "rooms"
  live?: boolean
  items?: NavSubItem[]
}

export const mainNav: NavItem[] = [
  {
    title: "Now",
    href: "/now",
    description:
      "Live availability, Help Now callouts, and who's on the road right now.",
    icon: Radio,
    live: true,
  },
  {
    title: "Jobs",
    href: "/jobs",
    description:
      "Open calls, tour gigs, and one-off shifts matched to your skills.",
    icon: Briefcase,
    badge: "12",
    items: [
      { title: "My Jobs", href: "/my-jobs/created" },
      { title: "My Applications", href: "/my-jobs/applications" },
    ],
  },
  {
    title: "People",
    href: "/people",
    description:
      "Find and connect with trusted touring crew across every department.",
    icon: Contact,
  },
  {
    title: "Messages",
    href: "/messages",
    description: "Direct messages and private 1:1 conversations.",
    icon: MessagesSquare,
    liveBadge: "messages",
  },
  {
    title: "Rooms",
    href: "/rooms",
    description:
      "Discipline-specific community channels for touring crew.",
    icon: Group,
    liveBadge: "rooms",
  },
]

export const adminNav: NavItem[] = [
  {
    title: "Users",
    href: "/users",
    description: "Review, verify, and manage member accounts and invites.",
    icon: UserCheck,
    badge: "6",
  },
  {
    title: "Applications",
    href: "/applications",
    description: "Review membership applications and verify new crew.",
    icon: ClipboardList,
  },
  {
    title: "Invites",
    href: "/invites",
    description: "Track sent invitations and manage pending referrals.",
    icon: MailPlus,
  },
]

export const allNav: NavItem[] = [...mainNav, ...adminNav]
