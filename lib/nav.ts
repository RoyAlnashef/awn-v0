import {
  Radio,
  Briefcase,
  Contact,
  MessagesSquare,
  Users,
  UserCheck,
  Mail,
  ScrollText,
  Flag,
  type LucideIcon,
} from "lucide-react"

export type NavSubItem = {
  title: string
  href: string
  description?: string
}

export type NavItem = {
  title: string
  href: string
  description: string
  icon: LucideIcon
  badge?: string
  /** When set, sidebar reads a live count from the matching provider. */
  liveBadge?: "messages" | "rooms" | "logs"
  live?: boolean
  items?: NavSubItem[]
}

export const mainNav: NavItem[] = [
  {
    title: "Now",
    href: "/now",
    description:
      "Get help now, find your people, and stay connected while you're on the move.",
    icon: Radio,
    live: true,
  },
  {
    title: "Groups",
    href: "/groups",
    description:
      "Chat in the AWN communities.",
    icon: Users,
    liveBadge: "rooms",
  },
  {
    title: "People",
    href: "/people",
    description:
      "Find and connect with trusted crew across every department.",
    icon: Contact,
  },
  {
    title: "Jobs",
    href: "/jobs",
    description:
      "Open calls, gigs, and one-off shifts matched to your skills.",
    icon: Briefcase,
    items: [
      { title: "Saved Jobs", href: "/my-jobs/saved" },
      { title: "My Applications", href: "/my-jobs/applications" },
      { title: "Jobs Posted", href: "/my-jobs/created" },
    ],
  },
  {
    title: "Messages",
    href: "/messages",
    description: "Direct messages and private 1:1 conversations.",
    icon: MessagesSquare,
    liveBadge: "messages",
  },
]

export const adminNav: NavItem[] = [
  {
    title: "Users",
    href: "/users",
    description: "Review, verify, and manage member accounts.",
    icon: UserCheck,
    items: [
      {
        title: "Invites",
        href: "/invites",
        description: "Track sent invitations and manage pending referrals.",
      },
      {
        title: "Applications",
        href: "/applications",
        description: "Review membership applications and verify new crew.",
      },
    ],
  },
  {
    title: "Community Reports",
    href: "/community-reports",
    description: "Review member and job reports from the community.",
    icon: Flag,
  },
  {
    title: "Emails",
    href: "/email",
    description:
      "Preview transactional templates and broadcast messages to members.",
    icon: Mail,
  },
  {
    title: "Logs",
    href: "/logs",
    description: "Review client and server errors to diagnose issues.",
    icon: ScrollText,
    liveBadge: "logs",
  },
]

export function isNavRouteActive(pathname: string, href: string) {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    pathname === `/popout${href}` ||
    pathname.startsWith(`/popout${href}/`)
  )
}

export function findNavItem(href: string) {
  for (const item of [...mainNav, ...adminNav]) {
    if (item.href === href) {
      return { title: item.title, description: item.description }
    }
    for (const sub of item.items ?? []) {
      if (sub.href === href) {
        return {
          title: sub.title,
          description: sub.description ?? item.description,
        }
      }
    }
  }
}

export const allNav: NavItem[] = [...mainNav, ...adminNav]
