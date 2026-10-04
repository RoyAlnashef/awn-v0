/**
 * Feedback domain model. Shapes mirror the planned `feedback` and
 * `feedback_attachments` tables so the in-memory store can be swapped
 * for Supabase without touching UI code.
 */

export const FEEDBACK_TYPES = ["bug", "ux", "idea", "praise"] as const
export type FeedbackType = (typeof FEEDBACK_TYPES)[number]

export const FEEDBACK_STATUSES = [
  "new",
  "triaged",
  "planned",
  "resolved",
  "wont_fix",
] as const
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

export const FEEDBACK_IMPACTS = ["blocking", "annoying", "minor"] as const
export type FeedbackImpact = (typeof FEEDBACK_IMPACTS)[number]

export const FEEDBACK_LIMITS = {
  summaryMax: 120,
  detailsMin: 10,
  detailsMax: 4000,
  maxAttachments: 5,
  /** Per-file limit before client-side compression. */
  maxFileBytes: 10 * 1024 * 1024,
  /** Total payload after compression; keeps us under serverActions.bodySizeLimit. */
  maxTotalUploadBytes: 3.5 * 1024 * 1024,
  noteMax: 2000,
} as const

export const FEEDBACK_ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const

export type FeedbackAttachment = {
  id: string
  name: string
  url: string
  contentType: string
  sizeBytes: number
  width?: number
  height?: number
}

export type FeedbackContext = {
  url: string
  pageTitle: string
  userAgent: string
  viewport: string
  platform: "web" | "ios" | "android"
  appVersion?: string
}

export type FeedbackSubmitter = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  initials: string
}

export type Feedback = {
  id: string
  /** Short human reference shown to members and admins, e.g. FB-1042. */
  reference: string
  type: FeedbackType
  status: FeedbackStatus
  impact: FeedbackImpact | null
  area: string
  summary: string
  details: string
  allowContact: boolean
  attachments: FeedbackAttachment[]
  context: FeedbackContext
  submitter: FeedbackSubmitter
  adminNote: string
  createdAt: string
  updatedAt: string
}

export type FeedbackTypeConfig = {
  label: string
  short: string
  description: string
  summaryPlaceholder: string
  detailsLabel: string
  detailsPlaceholder: string
  asksImpact: boolean
}

export const FEEDBACK_TYPE_CONFIG: Record<FeedbackType, FeedbackTypeConfig> = {
  bug: {
    label: "Bug",
    short: "Something broke",
    description: "An error, crash, or something not working as expected.",
    summaryPlaceholder: "e.g. Map doesn't load after checking in",
    detailsLabel: "What happened?",
    detailsPlaceholder:
      "Steps you took, what you expected, and what happened instead.",
    asksImpact: true,
  },
  ux: {
    label: "Confusing",
    short: "Hard to use",
    description: "Works, but it's unclear, slow, or frustrating.",
    summaryPlaceholder: "e.g. Couldn't find where to edit my availability",
    detailsLabel: "What felt off?",
    detailsPlaceholder:
      "What were you trying to do, and where did you get stuck?",
    asksImpact: true,
  },
  idea: {
    label: "Idea",
    short: "Nice to have",
    description: "A feature or improvement you'd like to see.",
    summaryPlaceholder: "e.g. Let me save favorite venues",
    detailsLabel: "Tell us more",
    detailsPlaceholder:
      "What problem would this solve for you? How would you use it?",
    asksImpact: false,
  },
  praise: {
    label: "Praise",
    short: "Love it",
    description: "Something that's working really well for you.",
    summaryPlaceholder: "e.g. Help Now found me a sub in 10 minutes",
    detailsLabel: "What's working?",
    detailsPlaceholder: "What did you like, and why does it matter to you?",
    asksImpact: false,
  },
}

export const FEEDBACK_STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; description: string }
> = {
  new: { label: "New", description: "Not yet reviewed" },
  triaged: { label: "Triaged", description: "Reviewed and categorized" },
  planned: { label: "Planned", description: "Scheduled for a fix or build" },
  resolved: { label: "Resolved", description: "Fixed or shipped" },
  wont_fix: { label: "Won't fix", description: "Closed without changes" },
}

export const FEEDBACK_IMPACT_CONFIG: Record<
  FeedbackImpact,
  { label: string; description: string }
> = {
  blocking: { label: "Blocking me", description: "I can't continue" },
  annoying: { label: "Annoying", description: "There's a workaround" },
  minor: { label: "Minor", description: "Small polish issue" },
}

export const FEEDBACK_GENERAL_AREA = "General"

export function isFeedbackType(value: unknown): value is FeedbackType {
  return FEEDBACK_TYPES.includes(value as FeedbackType)
}

export function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return FEEDBACK_STATUSES.includes(value as FeedbackStatus)
}

export function isFeedbackImpact(value: unknown): value is FeedbackImpact {
  return FEEDBACK_IMPACTS.includes(value as FeedbackImpact)
}
