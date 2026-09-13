import type { ApplicationStatus, JobKind, JobStatus } from "@/lib/jobs-data"
import { parseDateOnly as parseJobDateOnly } from "@/lib/jobs-data"
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

/** Absolute date label for application deadlines (e.g. Aug 27, 2026). */
export function formatJobDeadline(deadline: string): string {
  return format(parseJobDateOnly(deadline), "MMM d, yyyy")
}

export const urgentBadgeStyles =
  "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-600"

export const urgentJobCardBorderStyles =
  "border-border hover:border-amber-600/50"

export const urgentAccentTextStyles = "text-amber-700 dark:text-amber-600"

export const urgentBookmarkSavedStyles =
  "fill-current text-amber-700 dark:text-amber-600"

export const urgentApplyButtonStyles =
  "bg-amber-800 text-white hover:bg-amber-800/90 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-700/90"

export function canApplyToJob(job: {
  status: JobStatus
  applied?: boolean
}): boolean {
  return job.status === "open" && !job.applied
}

export function jobApplyButtonLabel(job: {
  status: JobStatus
  applied?: boolean
  kind: JobKind
}): string {
  if (job.applied) return "Applied"
  if (job.status === "open") return "Apply"
  if (job.status === "expired") {
    return job.kind === "urgent" ? "Expired" : "Closed"
  }
  return "Closed"
}

export const jobStatusStyles: Record<JobStatus, string> = {
  open: "border-success/30 bg-success/10 text-success",
  draft: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  filled: "border-border bg-muted text-muted-foreground",
  expired: "border-border bg-muted text-muted-foreground",
  deleted: "border-border bg-muted text-muted-foreground",
}

export const jobStatusLabels: Record<JobStatus, string> = {
  open: "Open",
  draft: "Paused",
  filled: "Filled",
  expired: "Expired",
  deleted: "Deleted",
}

/** Lower values sort first when ascending (active jobs before closed). */
export const jobStatusSortOrder: Record<JobStatus, number> = {
  open: 0,
  draft: 1,
  filled: 2,
  expired: 3,
  deleted: 4,
}

export function employerSelectableStatuses(current: JobStatus): JobStatus[] {
  if (current === "expired" || current === "deleted") return ["open"]
  return ["open", "draft", "filled"]
}

export const applicationStatusStyles: Record<ApplicationStatus, string> = {
  pending: urgentBadgeStyles,
  approved: "border-success/30 bg-success/10 text-success",
  maybe: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  declined: "border-border bg-muted text-muted-foreground",
  withdrawn: "border-border bg-muted text-muted-foreground",
}

export const applicationStatusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: applicationStatusStyles.pending },
  approved: { label: "Approved", className: applicationStatusStyles.approved },
  maybe: { label: "Maybe", className: applicationStatusStyles.maybe },
  declined: { label: "Declined", className: applicationStatusStyles.declined },
  withdrawn: { label: "Withdrawn", className: applicationStatusStyles.withdrawn },
}

/** Statuses visible to job applicants (excludes employer-only `maybe`). */
export type ApplicantApplicationStatus = Extract<
  ApplicationStatus,
  "pending" | "approved" | "declined"
>

export function toApplicantApplicationStatus(
  status: ApplicationStatus,
): ApplicantApplicationStatus {
  if (status === "maybe" || status === "withdrawn") return "pending"
  return status
}

export const applicantApplicationStatusConfig: Record<
  ApplicantApplicationStatus,
  { label: string; className: string }
> = {
  pending: applicationStatusConfig.pending,
  approved: applicationStatusConfig.approved,
  declined: applicationStatusConfig.declined,
}
