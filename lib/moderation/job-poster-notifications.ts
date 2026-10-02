import { createNotification } from "@/lib/notifications/actions"

export const JOB_POSTER_REVIEW_NOTIFICATION_KINDS = [
  "job_under_review",
  "job_review_released",
  "job_review_closed",
] as const

export type JobPosterReviewNotificationKind =
  (typeof JOB_POSTER_REVIEW_NOTIFICATION_KINDS)[number]

export function isJobPosterReviewNotificationKind(
  kind: string,
): kind is JobPosterReviewNotificationKind {
  return (JOB_POSTER_REVIEW_NOTIFICATION_KINDS as readonly string[]).includes(
    kind,
  )
}

type NotifyJobPosterInput = {
  posterId: string
  jobId: string
  role: string
  event: "under_review" | "released" | "closed"
  closeStatus?: "filled" | "deleted"
}

function roleLabel(role: string): string {
  const trimmed = role.trim()
  return trimmed || "your job"
}

function notificationForEvent(input: NotifyJobPosterInput): {
  kind: JobPosterReviewNotificationKind
  title: string
  body: string
  data: Record<string, unknown>
} {
  const label = roleLabel(input.role)
  const baseData = { jobId: input.jobId }

  switch (input.event) {
    case "under_review":
      return {
        kind: "job_under_review",
        title: "Job under review",
        body: `AWN is reviewing ${label}. Editing is paused until review is complete.`,
        data: baseData,
      }
    case "released":
      return {
        kind: "job_review_released",
        title: "Review complete",
        body: `${label} is back under your control.`,
        data: baseData,
      }
    case "closed": {
      const status = input.closeStatus ?? "deleted"
      const statusLabel = status === "filled" ? "filled" : "removed"
      return {
        kind: "job_review_closed",
        title: "Job closed by AWN",
        body: `${label} was marked ${statusLabel} after review.`,
        data: { ...baseData, status },
      }
    }
  }
}

/** Best-effort: does not throw; moderation actions must not depend on success. */
export async function notifyJobPoster(input: NotifyJobPosterInput): Promise<void> {
  const { kind, title, body, data } = notificationForEvent(input)
  await createNotification({
    userId: input.posterId,
    kind,
    title,
    body,
    data,
  })
}
