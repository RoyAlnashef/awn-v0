import type { JobReportReason } from "@/lib/moderation/job-report-reasons"
import type { MemberReportReason } from "@/lib/moderation/report-reasons"
import type { JobStatus } from "@/lib/jobs-data"

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

export type JobReportRow = {
  id: string
  reason: JobReportReason
  createdAt: string
  reporter: {
    id: string
    name: string
    email: string
    avatar?: string
    status: string
  }
  job: {
    id: string
    role: string
    production: string
    status: JobStatus
    posterId: string
    posterName: string
    posterEmail: string
    posterStatus: string
    underReviewAt: string | null
  }
}
