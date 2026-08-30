/** System-level access role for the admin users table (UI labels). */
export type UserRole = "Owner" | "Admin" | "Manager" | "Member"

export const userRoles: UserRole[] = ["Owner", "Admin", "Manager", "Member"]

/** Account lifecycle status (UI labels). */
export type UserStatus =
  | "Active"
  | "Invited"
  | "Pending"
  | "Denied"
  | "Suspended"

export const userStatuses: UserStatus[] = [
  "Active",
  "Invited",
  "Pending",
  "Denied",
  "Suspended",
]

/** DB enum values for `public.user_role`. */
export type DbUserRole = "owner" | "admin" | "manager" | "member"

/** DB enum values for `public.user_status`. */
export type DbUserStatus =
  | "active"
  | "invited"
  | "pending"
  | "denied"
  | "suspended"

/**
 * Visual treatment for each status badge, kept within the app palette:
 * Active uses the ember primary, Invited a neutral outline, Suspended a muted
 * destructive tone.
 */
export const statusConfig: Record<
  UserStatus,
  { variant: "default" | "secondary" | "outline" | "destructive"; dot: string }
> = {
  Active: { variant: "default", dot: "bg-success" },
  Invited: { variant: "secondary", dot: "bg-foreground/40" },
  Pending: { variant: "secondary", dot: "bg-amber-500" },
  Denied: { variant: "outline", dot: "bg-red-500" },
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
  email: string
  role: UserRole
  status: UserStatus
  /** Job title / profile title. */
  title: string
  /** Relative last-active label for display. */
  lastActive: string
  /** Whether two-factor auth is enabled on the account. */
  twoFactor: boolean
  avatar?: string
}

const roleToDb: Record<UserRole, DbUserRole> = {
  Owner: "owner",
  Admin: "admin",
  Manager: "manager",
  Member: "member",
}

const roleFromDb: Record<DbUserRole, UserRole> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  member: "Member",
}

const statusToDb: Record<UserStatus, DbUserStatus> = {
  Active: "active",
  Invited: "invited",
  Pending: "pending",
  Denied: "denied",
  Suspended: "suspended",
}

const statusFromDb: Record<DbUserStatus, UserStatus> = {
  active: "Active",
  invited: "Invited",
  pending: "Pending",
  denied: "Denied",
  suspended: "Suspended",
}

export function toDbRole(role: UserRole): DbUserRole {
  return roleToDb[role]
}

export function fromDbRole(role: string): UserRole {
  return roleFromDb[role as DbUserRole] ?? "Member"
}

export function toDbStatus(status: UserStatus): DbUserStatus {
  return statusToDb[status]
}

export function fromDbStatus(status: string): UserStatus {
  return statusFromDb[status as DbUserStatus] ?? "Pending"
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/** Format a relative last-active label for the admin table. */
export function formatLastActiveLabel(
  status: UserStatus,
  lastActiveAt: string | null | undefined,
): string {
  if (status === "Invited") return "Pending"
  if (status === "Pending" || status === "Denied") return "—"
  if (!lastActiveAt) return "—"

  const then = new Date(lastActiveAt).getTime()
  if (Number.isNaN(then)) return "—"

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export interface ProfileRow {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  title: string | null
  role: string
  status: string
  two_factor_enabled: boolean
  last_active_at: string | null
}

export function profileToAdminUser(row: ProfileRow): AdminUser {
  const status = fromDbStatus(row.status)
  const name = row.full_name?.trim() || row.email

  return {
    id: row.id,
    name,
    email: row.email,
    role: fromDbRole(row.role),
    status,
    title: row.title?.trim() || "",
    lastActive: formatLastActiveLabel(status, row.last_active_at),
    twoFactor: row.two_factor_enabled,
    avatar: row.avatar_url ?? undefined,
  }
}
