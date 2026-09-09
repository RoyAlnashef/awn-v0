import type { Job, JobKind } from "@/lib/jobs-data"
import type { JobSharePayload } from "@/lib/messages-data"
import { formatJobPostedAt } from "@/lib/jobs/format"

export type JobShareRpcRow = {
  job_id?: string | null
  job_role?: string | null
  job_production?: string | null
  job_location?: string | null
  job_pay_rate?: string | null
  job_start_date?: string | null
  job_end_date?: string | null
  job_engagement?: string | null
  job_department?: string | null
  job_kind?: string | null
  job_created_at?: string | null
}

function parseJobKind(value: string | null | undefined): JobKind {
  return value === "urgent" ? "urgent" : "full"
}

function buildJobSharePayload(row: JobShareRpcRow): JobSharePayload {
  return {
    id: row.job_id!,
    role: row.job_role!,
    production: row.job_production ?? "",
    location: row.job_location ?? "",
    payRate: row.job_pay_rate ?? "",
    startDate: row.job_start_date ?? "",
    endDate: row.job_end_date ?? "",
    engagement: row.job_engagement ?? "",
    department: row.job_department ?? "",
    kind: parseJobKind(row.job_kind),
    postedAt: row.job_created_at ? formatJobPostedAt(row.job_created_at) : "",
  }
}

export function mapRpcJobShare(
  row: JobShareRpcRow,
): JobSharePayload | undefined {
  if (!row.job_id || !row.job_role) return undefined
  return buildJobSharePayload(row)
}

export function jobToSharePayload(
  job: Pick<
    Job,
    | "id"
    | "role"
    | "production"
    | "location"
    | "payRate"
    | "startDate"
    | "endDate"
    | "engagement"
    | "department"
    | "kind"
    | "postedAt"
  >,
): JobSharePayload {
  return {
    id: job.id,
    role: job.role,
    production: job.production,
    location: job.location,
    payRate: job.payRate,
    startDate: job.startDate,
    endDate: job.endDate,
    engagement: job.engagement,
    department: job.department,
    kind: job.kind,
    postedAt: job.postedAt,
  }
}

export function sharePreviewText(jobShare: JobSharePayload): string {
  return `Shared a job · ${jobShare.role}`
}

export function messageDisplayPreview(
  text: string,
  jobShare?: JobSharePayload,
): string {
  const trimmed = text.trim()
  if (trimmed) return trimmed
  if (jobShare) return sharePreviewText(jobShare)
  return ""
}
