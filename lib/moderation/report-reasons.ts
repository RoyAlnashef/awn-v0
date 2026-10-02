export const MEMBER_REPORT_REASONS = [
  {
    value: "fake_or_misleading_profile",
    label: "Fake or misleading profile",
  },
  {
    value: "harassment_or_threatening",
    label: "Harassment or threatening behaviour",
  },
  {
    value: "spam_or_solicitation",
    label: "Spam or solicitation",
  },
  {
    value: "inappropriate_content",
    label: "Inappropriate content",
  },
  {
    value: "impersonating_someone",
    label: "Impersonating someone",
  },
  {
    value: "other",
    label: "Other",
  },
] as const

export type MemberReportReason =
  (typeof MEMBER_REPORT_REASONS)[number]["value"]

const reasonValues = new Set<string>(
  MEMBER_REPORT_REASONS.map((reason) => reason.value),
)

export function isMemberReportReason(value: string): value is MemberReportReason {
  return reasonValues.has(value)
}

export function memberReportReasonLabel(reason: MemberReportReason): string {
  return (
    MEMBER_REPORT_REASONS.find((entry) => entry.value === reason)?.label ??
    reason
  )
}
