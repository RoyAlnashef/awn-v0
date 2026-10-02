import type { MemberReportReason } from "@/lib/moderation/report-reasons"

export type BlockedMemberSummary = {
  id: string
  name: string
  role: string
  avatar?: string
  blockedAt: string
}

export type MemberReportRow = {
  id: string
  reason: MemberReportReason
  createdAt: string
  reporter: {
    id: string
    name: string
    email: string
    avatar?: string
    status: string
  }
  reportee: {
    id: string
    name: string
    email: string
    avatar?: string
    status: string
  }
}
