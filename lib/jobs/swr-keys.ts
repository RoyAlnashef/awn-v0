import type { JobFilters } from "@/components/jobs/jobs-filters"
import type { EngagementType } from "@/lib/jobs-data"

export const jobsListKey = "/api/jobs"

export const myJobsKey = "/api/jobs/mine?tab=created"

export function accountJobsKey(tab: "created" | "saved"): string {
  return `/api/jobs/mine?tab=${tab}`
}

export function jobDetailKey(jobId: string | null): string | null {
  return jobId ? `/api/jobs/${jobId}` : null
}

export function jobApplicationsKey(jobId: string | null): string | null {
  return jobId ? `/api/jobs/${jobId}/applications` : null
}

export function jobsListKeyWithFilters(filters: JobFilters): string {
  const params = new URLSearchParams()

  const search = filters.search.trim()
  if (search) params.set("search", search)
  if (filters.department !== "all") params.set("department", filters.department)
  if (filters.engagements.length > 0) {
    params.set("engagement", filters.engagements.join(","))
  }
  if (filters.startFrom) {
    params.set("startFrom", toDateOnly(filters.startFrom))
  }
  if (filters.startTo) {
    params.set("startTo", toDateOnly(filters.startTo))
  }
  if (filters.saved) {
    params.set("saved", "true")
  }

  const query = params.toString()
  return query ? `${jobsListKey}?${query}` : jobsListKey
}

function toDateOnly(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseEngagementParam(value: string | null): EngagementType[] {
  if (!value) return []
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean) as EngagementType[]
}
