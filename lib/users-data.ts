import { people, initials, type Person } from "@/lib/people-data"

/** System-level access role for the admin users table. */
export type UserRole = "Owner" | "Admin" | "Manager" | "Member"

export const userRoles: UserRole[] = ["Owner", "Admin", "Manager", "Member"]

/** Account lifecycle status. */
export type UserStatus = "Active" | "Invited" | "Suspended"

export const userStatuses: UserStatus[] = ["Active", "Invited", "Suspended"]

/**
 * Visual treatment for each status badge, kept within the app palette:
 * Active uses the ember primary, Invited a neutral outline, Suspended a muted
 * destructive tone.
 */
export const statusConfig: Record<
  UserStatus,
  { variant: "default" | "secondary" | "outline" | "destructive"; dot: string }
> = {
  Active: { variant: "default", dot: "bg-primary" },
  Invited: { variant: "secondary", dot: "bg-foreground/40" },
  Suspended: { variant: "outline", dot: "bg-destructive" },
}

/** Role badge treatment — Owner/Admin emphasized, others muted. */
export const roleConfig: Record<
  UserRole,
  { variant: "default" | "secondary" | "outline" }
> = {
  Owner: { variant: "default" },
  Admin: { variant: "secondary" },
  Manager: { variant: "outline" },
  Member: { variant: "outline" },
}

export interface AdminUser {
  id: string
  name: string
  /** Derived login email. */
  email: string
  role: UserRole
  status: UserStatus
  /** Job title carried over from the member's profile. */
  title: string
  /** Relative last-active label for placeholder display. */
  lastActive: string
  /** Whether two-factor auth is enabled on the account. */
  twoFactor: boolean
  avatar?: string
}

/** Deterministic pick from a list based on an index (stable placeholder data). */
function pick<T>(list: T[], index: number): T {
  return list[index % list.length]
}

const lastActiveLabels = [
  "Just now",
  "5m ago",
  "1h ago",
  "3h ago",
  "Yesterday",
  "2d ago",
  "1w ago",
  "3w ago",
]

function emailFor(person: Person): string {
  const handle = person.name.toLowerCase().replace(/[^a-z]+/g, ".")
  return `${handle}@awright.network`
}

/**
 * Admin users derived from the member directory so avatars and names stay in
 * sync, with admin-only fields (role, status, last active, 2FA) layered on.
 */
export const adminUsers: AdminUser[] = people.map((person, i) => {
  // First member is the Owner; sprinkle a couple of admins/managers, rest members.
  const role: UserRole =
    i === 0
      ? "Owner"
      : i % 7 === 1
        ? "Admin"
        : i % 5 === 2
          ? "Manager"
          : "Member"

  const status: UserStatus =
    i % 9 === 4 ? "Invited" : i % 11 === 7 ? "Suspended" : "Active"

  return {
    id: person.id,
    name: person.name,
    email: emailFor(person),
    role,
    status,
    title: person.role,
    lastActive: status === "Invited" ? "Pending" : pick(lastActiveLabels, i),
    twoFactor: i % 3 !== 0,
    avatar: person.avatar,
  }
})

export { initials }
