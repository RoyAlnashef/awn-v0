import type { ApplicationStatus, JobStatus } from "@/lib/jobs-data"
import { differenceInCalendarDays, format, startOfDay } from "date-fns"

/** Compact relative label for job cards (e.g. Today, 2h ago, Yesterday). */
export function formatJobPostedAt(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 60_000) return "Today"

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = differenceInCalendarDays(startOfDay(now), startOfDay(date))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export function toDateOnly(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseDateOnly(value: string | null | undefined): string | null {
  if (!value) return null
  return value.slice(0, 10)
}

/** Absolute date label for saved-job rows (e.g. Jul 22, 2026). */
export function formatJobSavedAt(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy")
}

export const jobStatusStyles: Record<JobStatus, string> = {
  open: "border-green-500/30 bg-green-500/10 text-green-600",
  draft: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  filled: "border-border bg-muted text-muted-foreground",
  expired: "border-border bg-muted text-muted-foreground",
  deleted: "border-border bg-muted text-muted-foreground",
}

export const applicationStatusStyles: Record<ApplicationStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  approved: "border-green-500/30 bg-green-500/10 text-green-600",
  maybe: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  declined: "border-border bg-muted text-muted-foreground",
  withdrawn: "border-border bg-muted text-muted-foreground",
}
