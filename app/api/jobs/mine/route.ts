import { type EngagementType, type JobKind } from "@/lib/jobs-data"
import { jsonError, requireApiUser } from "@/lib/jobs/api-auth"
import { formatJobSavedAt } from "@/lib/jobs/format"
import { mapJobPostingRow } from "@/lib/jobs/map"

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
  expires_at: string | null
  filled_at: string | null
  created_at: string
  updated_at: string
  poster: PosterJoin | PosterJoin[] | null
}

type SavedJobRow = {
  created_at: string
  job: JobRow | JobRow[] | null
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
  expires_at,
  filled_at,
  created_at,
  updated_at,
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

function mapRow(
  row: JobRow,
  options: { saved?: boolean; savedAt?: string } = {},
) {
  return mapJobPostingRow(
    {
      ...row,
      kind: row.kind as JobKind,
      engagement: row.engagement as EngagementType,
      poster: normalizePoster(row.poster),
    },
    options,
  )
}

export async function GET(request: Request) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const tab = new URL(request.url).searchParams.get("tab")
  if (tab !== "created" && tab !== "saved") {
    return jsonError("tab must be created or saved", 400)
  }

  if (tab === "created") {
    const { data: rows, error: listError } = await supabase
      .from("job_postings")
      .select(JOB_SELECT)
      .eq("poster_id", user.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })

    if (listError) return jsonError(listError.message, 500)

    const jobs = ((rows ?? []) as JobRow[]).map((row) => mapRow(row))

    return Response.json({ jobs })
  }

  const { data: rows, error: listError } = await supabase
    .from("saved_jobs")
    .select(
      `
      created_at,
      job:job_postings!inner (${JOB_SELECT})
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (listError) return jsonError(listError.message, 500)

  const jobs = ((rows ?? []) as SavedJobRow[])
    .map((row) => {
      const jobRow = Array.isArray(row.job) ? row.job[0] : row.job
      if (!jobRow || jobRow.status === "deleted") return null
      return mapRow(jobRow, {
        saved: true,
        savedAt: formatJobSavedAt(row.created_at),
      })
    })
    .filter((job): job is NonNullable<typeof job> => job !== null)

  return Response.json({ jobs })
}
