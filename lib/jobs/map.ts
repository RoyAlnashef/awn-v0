import type {
  EngagementType,
  Job,
  JobKind,
  JobPoster,
  JobStatus,
} from "@/lib/jobs-data"
import { formatJobPostedAt } from "@/lib/jobs/format"

type PosterProfile = {
  full_name: string | null
  title: string | null
  avatar_url: string | null
}

export type JobPostingSource = {
  id: string
  kind: JobKind | string
  status: JobStatus | string
  poster_id: string
  role: string
  department: string
  production: string
  location: string
  pay_rate: string
  start_date: string
  end_date: string
  deadline: string | null
  engagement: EngagementType | string
  details: string
  created_at: string
  poster?: PosterProfile | null
}

export function mapPoster(profile: PosterProfile | null): JobPoster {
  return {
    name: profile?.full_name?.trim() || "Member",
    role: profile?.title?.trim() || "Member",
    avatar: profile?.avatar_url ?? undefined,
  }
}

export function mapJobPostingRow(
  row: JobPostingSource,
  options: { saved?: boolean; applied?: boolean } = {},
): Job {
  return {
    id: row.id,
    kind: row.kind as JobKind,
    posterId: row.poster_id,
    role: row.role,
    department: row.department,
    production: row.production,
    location: row.location,
    payRate: row.pay_rate,
    startDate: row.start_date,
    endDate: row.end_date,
    deadline: row.deadline ?? row.end_date,
    engagement: row.engagement as EngagementType,
    details: row.details,
    postedBy: mapPoster(row.poster ?? null),
    postedAt: formatJobPostedAt(row.created_at),
    saved: options.saved ?? false,
    applied: options.applied ?? false,
  }
}
