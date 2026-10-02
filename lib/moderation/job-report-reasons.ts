export const JOB_REPORT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "fake_or_misleading", label: "Fake or misleading information" },
  { value: "privacy_violation", label: "Privacy violation" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "job_posting_issue", label: "Job posting issue" },
  { value: "impersonation", label: "Impersonation" },
  { value: "safety_concern", label: "Safety concern" },
  { value: "other", label: "Other" },
] as const

export type JobReportReason = (typeof JOB_REPORT_REASONS)[number]["value"]

const JOB_REPORT_REASON_SET = new Set<string>(
  JOB_REPORT_REASONS.map((reason) => reason.value),
)

export function isJobReportReason(value: string): value is JobReportReason {
  return JOB_REPORT_REASON_SET.has(value)
}

export function jobReportReasonLabel(reason: JobReportReason): string {
  return (
    JOB_REPORT_REASONS.find((entry) => entry.value === reason)?.label ?? reason
  )
}
