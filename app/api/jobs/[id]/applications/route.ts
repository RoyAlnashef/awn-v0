import type { ApplicationStatus } from "@/lib/jobs-data"
import { jsonError, requireApiUser } from "@/lib/jobs/api-auth"

type ApplicantJoin = {
  full_name: string | null
  title: string | null
  avatar_url: string | null
}

type ApplicationRow = {
  id: string
  job_id: string
  applicant_id: string
  note: string
  resume_url: string | null
  status: ApplicationStatus
  created_at: string
  applicant: ApplicantJoin | ApplicantJoin[] | null
}

function normalizeApplicant(
  applicant: ApplicantJoin | ApplicantJoin[] | null,
): ApplicantJoin | null {
  if (!applicant) return null
  return Array.isArray(applicant) ? (applicant[0] ?? null) : applicant
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

  const { data: job, error: jobError } = await supabase
    .from("job_postings")
    .select("poster_id")
    .eq("id", id)
    .maybeSingle()

  if (jobError) return jsonError(jobError.message, 500)
  if (!job) return jsonError("Job not found", 404)
  if (job.poster_id !== user.id) return jsonError("Forbidden", 403)

  const { data: rows, error: listError } = await supabase
    .from("job_applications")
    .select(
      `
      id,
      job_id,
      applicant_id,
      note,
      resume_url,
      status,
      created_at,
      applicant:profiles!job_applications_applicant_id_fkey (
        full_name,
        title,
        avatar_url
      )
    `,
    )
    .eq("job_id", id)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false })

  if (listError) return jsonError(listError.message, 500)

  const applications = ((rows ?? []) as ApplicationRow[]).map((row) => {
    const profile = normalizeApplicant(row.applicant)
    return {
      id: row.id,
      jobId: row.job_id,
      applicantId: row.applicant_id,
      note: row.note,
      resumeUrl: row.resume_url ?? undefined,
      status: row.status,
      createdAt: row.created_at,
      applicant: {
        name: profile?.full_name?.trim() || "Member",
        title: profile?.title?.trim() || "Member",
        avatar: profile?.avatar_url ?? undefined,
      },
    }
  })

  return Response.json({ applications })
}
