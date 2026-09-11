import { cache } from "react"

import type { Job } from "@/lib/jobs-data"
import { mapJobPostingRow } from "@/lib/jobs/map"
import { createClient } from "@/lib/supabase/server"

type PosterJoin = {
  full_name: string | null
  title: string | null
  avatar_url: string | null
}

type JobRow = {
  id: string
  kind: string
  status: string
  poster_id: string
  role: string
  department: string
  production: string
  location: string
  pay_rate: string
  start_date: string
  end_date: string
  deadline: string | null
  engagement: string
  details: string
  view_count: number
  share_count: number
  created_at: string
  poster: PosterJoin | PosterJoin[] | null
}

const JOB_SELECT = `
  id,
  kind,
  status,
  poster_id,
  role,
  department,
  production,
  location,
  pay_rate,
  start_date,
  end_date,
  deadline,
  engagement,
  details,
  view_count,
  share_count,
  created_at,
  poster:profiles!job_postings_poster_id_fkey (
    full_name,
    title,
    avatar_url
  )
`

function normalizePoster(
  poster: PosterJoin | PosterJoin[] | null,
): PosterJoin | null {
  if (!poster) return null
  return Array.isArray(poster) ? (poster[0] ?? null) : poster
}

export const getJobForManagement = cache(
  async (jobId: string, userId: string): Promise<Job | null> => {
    const supabase = await createClient()

    const { data: row, error } = await supabase
      .from("job_postings")
      .select(JOB_SELECT)
      .eq("id", jobId)
      .neq("status", "deleted")
      .maybeSingle()

    if (error || !row) return null

    const typedRow = row as JobRow
    if (typedRow.poster_id !== userId) return null

    const { count: applicationCount } = await supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId)
      .neq("status", "withdrawn")

    return mapJobPostingRow(
      {
        ...typedRow,
        kind: typedRow.kind as Job["kind"],
        engagement: typedRow.engagement as Job["engagement"],
        poster: normalizePoster(typedRow.poster),
      },
      {
        viewCount: typedRow.view_count,
        applicationCount: applicationCount ?? 0,
        shareCount: typedRow.share_count,
      },
    )
  },
)
