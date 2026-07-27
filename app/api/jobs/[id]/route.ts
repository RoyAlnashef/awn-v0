import type { EngagementType, JobKind, JobStatus } from "@/lib/jobs-data"
import { jsonError, requireApiUser } from "@/lib/jobs/api-auth"
import { parseDateOnly } from "@/lib/jobs/format"
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

function normalizePoster(
  poster: PosterJoin | PosterJoin[] | null,
): PosterJoin | null {
  if (!poster) return null
  return Array.isArray(poster) ? (poster[0] ?? null) : poster
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const { id } = await context.params
  if (!isUuid(id)) return jsonError("Invalid job id", 400)

  const { data: row, error: fetchError } = await supabase
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
    .eq("id", id)
    .maybeSingle()

  if (fetchError) return jsonError(fetchError.message, 500)
  if (!row) return jsonError("Job not found", 404)

  const typedRow = row as JobRow

  const [{ count: applicantCount }, savedResult, appliedResult] =
    await Promise.all([
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true })
        .eq("job_id", id)
        .neq("status", "withdrawn"),
      supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user.id)
        .eq("job_id", id)
        .maybeSingle(),
      supabase
        .from("job_applications")
        .select("job_id")
        .eq("applicant_id", user.id)
        .eq("job_id", id)
        .neq("status", "withdrawn")
        .maybeSingle(),
    ])

  const job = mapJobPostingRow(
    {
      ...typedRow,
      kind: typedRow.kind as JobKind,
      engagement: typedRow.engagement as EngagementType,
      poster: normalizePoster(typedRow.poster),
    },
    {
      saved: Boolean(savedResult.data),
      applied: Boolean(appliedResult.data),
    },
  )

  return Response.json({ job, applicantCount: applicantCount ?? 0 })
}

type PatchJobBody = {
  status?: JobStatus
  role?: string
  production?: string
  location?: string
  payRate?: string
  startDate?: string
  endDate?: string
  deadline?: string | null
  engagement?: EngagementType
  details?: string
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const { id } = await context.params
  if (!isUuid(id)) return jsonError("Invalid job id", 400)

  let body: PatchJobBody
  try {
    body = (await request.json()) as PatchJobBody
  } catch {
    return jsonError("Invalid JSON body", 400)
  }

  const { data: existing, error: existingError } = await supabase
    .from("job_postings")
    .select("poster_id, status")
    .eq("id", id)
    .maybeSingle()

  if (existingError) return jsonError(existingError.message, 500)
  if (!existing) return jsonError("Job not found", 404)
  if (existing.poster_id !== user.id) {
    return jsonError("Forbidden", 403)
  }

  const patch: Record<string, unknown> = {}

  if (body.status) {
    patch.status = body.status
    if (body.status === "filled") {
      patch.filled_at = new Date().toISOString()
    }
  }
  if (body.role !== undefined) patch.role = body.role.trim()
  if (body.production !== undefined) patch.production = body.production.trim()
  if (body.location !== undefined) patch.location = body.location.trim()
  if (body.payRate !== undefined) patch.pay_rate = body.payRate.trim()
  if (body.startDate !== undefined) {
    const startDate = parseDateOnly(body.startDate)
    if (!startDate) return jsonError("Invalid start date", 400)
    patch.start_date = startDate
  }
  if (body.endDate !== undefined) {
    const endDate = parseDateOnly(body.endDate)
    if (!endDate) return jsonError("Invalid end date", 400)
    patch.end_date = endDate
  }
  if (body.deadline !== undefined) {
    patch.deadline = parseDateOnly(body.deadline)
  }
  if (body.engagement !== undefined) patch.engagement = body.engagement
  if (body.details !== undefined) patch.details = body.details.trim()

  if (Object.keys(patch).length === 0) {
    return jsonError("No fields to update", 400)
  }

  const { data: row, error: updateError } = await supabase
    .from("job_postings")
    .update(patch)
    .eq("id", id)
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

  if (updateError) return jsonError(updateError.message, 500)

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

  return Response.json({ job })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const { id } = await context.params
  if (!isUuid(id)) return jsonError("Invalid job id", 400)

  const { data: existing, error: existingError } = await supabase
    .from("job_postings")
    .select("poster_id")
    .eq("id", id)
    .maybeSingle()

  if (existingError) return jsonError(existingError.message, 500)
  if (!existing) return jsonError("Job not found", 404)
  if (existing.poster_id !== user.id) {
    return jsonError("Forbidden", 403)
  }

  const { error: updateError } = await supabase
    .from("job_postings")
    .update({ status: "deleted" })
    .eq("id", id)

  if (updateError) return jsonError(updateError.message, 500)

  return new Response(null, { status: 204 })
}
