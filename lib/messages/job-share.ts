import type { Job } from "@/lib/jobs-data"
import type { JobSharePayload } from "@/lib/messages-data"

export type JobShareRpcRow = {
  job_id?: string | null
  job_role?: string | null
  job_production?: string | null
  job_location?: string | null
  job_pay_rate?: string | null
  job_start_date?: string | null
  job_end_date?: string | null
  job_engagement?: string | null
}

export function mapRpcJobShare(
  row: JobShareRpcRow,
): JobSharePayload | undefined {
  if (!row.job_id || !row.job_role) return undefined

  return {
    id: row.job_id,
    role: row.job_role,
    production: row.job_production ?? "",
    location: row.job_location ?? "",
    payRate: row.job_pay_rate ?? "",
    startDate: row.job_start_date ?? "",
    endDate: row.job_end_date ?? "",
    engagement: row.job_engagement ?? "",
  }
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
