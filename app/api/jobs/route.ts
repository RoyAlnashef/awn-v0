import { departmentByRole, type EngagementType, type JobKind } from "@/lib/jobs-data"
import { jsonError, requireApiUser } from "@/lib/jobs/api-auth"
import { parseDateOnly } from "@/lib/jobs/format"
import { mapJobPostingRow } from "@/lib/jobs/map"
import { parseEngagementParam } from "@/lib/jobs/swr-keys"

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

function normalizePoster(
  poster: PosterJoin | PosterJoin[] | null,
): PosterJoin | null {
  if (!poster) return null
  return Array.isArray(poster) ? (poster[0] ?? null) : poster
}

export async function GET(request: Request) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const url = new URL(request.url)
  const search = url.searchParams.get("search")?.trim().toLowerCase() ?? ""
  const department = url.searchParams.get("department")
  const engagements = parseEngagementParam(url.searchParams.get("engagement"))
  const startFrom = parseDateOnly(url.searchParams.get("startFrom"))
  const startTo = parseDateOnly(url.searchParams.get("startTo"))

  let query = supabase
    .from("job_postings")
    .select(
      `
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
    `,
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })

  if (department && department !== "all") {
    query = query.eq("department", department)
  }

  if (engagements.length > 0) {
    query = query.in("engagement", engagements)
  }

  if (startFrom) {
    query = query.gte("start_date", startFrom)
  }

  if (startTo) {
    query = query.lte("start_date", startTo)
  }

  const { data: rows, error: listError } = await query

  if (listError) {
    return jsonError(listError.message, 500)
  }

  const now = Date.now()
  const filtered = ((rows ?? []) as JobRow[]).filter((row) => {
    if (row.expires_at && new Date(row.expires_at).getTime() <= now) {
      return false
    }
    if (row.deadline && row.deadline < new Date().toISOString().slice(0, 10)) {
      return false
    }
    if (search) {
      const haystack =
        `${row.role} ${row.production} ${row.location}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })

  const jobIds = filtered.map((row) => row.id)

  const [savedResult, appliedResult] = await Promise.all([
    jobIds.length > 0
      ? supabase
          .from("saved_jobs")
          .select("job_id")
          .eq("user_id", user.id)
          .in("job_id", jobIds)
      : Promise.resolve({ data: [] as { job_id: string }[], error: null }),
    jobIds.length > 0
      ? supabase
          .from("job_applications")
          .select("job_id")
          .eq("applicant_id", user.id)
          .in("job_id", jobIds)
          .neq("status", "withdrawn")
      : Promise.resolve({ data: [] as { job_id: string }[], error: null }),
  ])

  if (savedResult.error) {
    return jsonError(savedResult.error.message, 500)
  }
  if (appliedResult.error) {
    return jsonError(appliedResult.error.message, 500)
  }

  const savedIds = new Set(
    (savedResult.data ?? []).map((row) => row.job_id),
  )
  const appliedIds = new Set(
    (appliedResult.data ?? []).map((row) => row.job_id),
  )

  const jobs = filtered.map((row) =>
    mapJobPostingRow(
      {
        ...row,
        kind: row.kind as JobKind,
        engagement: row.engagement as EngagementType,
        poster: normalizePoster(row.poster),
      },
      {
        saved: savedIds.has(row.id),
        applied: appliedIds.has(row.id),
      },
    ),
  )

  return Response.json({ jobs })
}

type CreateJobBody = {
  kind?: JobKind
  role?: string
  production?: string
  location?: string
  payRate?: string
  startDate?: string
  endDate?: string
  deadline?: string | null
  engagement?: EngagementType
  details?: string
  status?: "draft" | "open"
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  let body: CreateJobBody
  try {
    body = (await request.json()) as CreateJobBody
  } catch {
    return jsonError("Invalid JSON body", 400)
  }

  const kind: JobKind = body.kind === "urgent" ? "urgent" : "full"
  const role = body.role?.trim() ?? ""
  const requestedStatus =
    kind === "urgent" ? "open" : body.status === "draft" ? "draft" : "open"
  const isDraft = requestedStatus === "draft"

  if (!role) return jsonError("Role is required", 400)

  const startDate = parseDateOnly(body.startDate) ?? (isDraft ? todayDateOnly() : null)
  const endDate = parseDateOnly(body.endDate) ?? (isDraft ? startDate : null)

  if (!isDraft) {
    if (!startDate) return jsonError("Start date is required", 400)
    if (!endDate) return jsonError("End date is required", 400)
    if (endDate < startDate) {
      return jsonError("End date must be on or after start date", 400)
    }
  }

  const department = departmentByRole[role] ?? "Production"
  const expiresAt =
    kind === "urgent"
      ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      : null

  const deadline =
    kind === "full" ? parseDateOnly(body.deadline ?? null) : null

  const { data: row, error: insertError } = await supabase
    .from("job_postings")
    .insert({
      kind,
      status: requestedStatus,
      poster_id: user.id,
      role,
      department,
      production: body.production?.trim() ?? "",
      location: body.location?.trim() ?? "",
      pay_rate: body.payRate?.trim() ?? "",
      start_date: startDate ?? todayDateOnly(),
      end_date: endDate ?? startDate ?? todayDateOnly(),
      deadline,
      engagement: body.engagement ?? "Touring",
      details: body.details?.trim() ?? "",
      expires_at: expiresAt,
    })
    .select(
      `
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
    `,
    )
    .single()

  if (insertError) {
    return jsonError(insertError.message, 500)
  }

  const typedRow = row as JobRow
  const job = mapJobPostingRow(
    {
      ...typedRow,
      kind: typedRow.kind as JobKind,
      engagement: typedRow.engagement as EngagementType,
      poster: normalizePoster(typedRow.poster),
    },
    { saved: false, applied: false },
  )

  return Response.json({ job }, { status: 201 })
}
