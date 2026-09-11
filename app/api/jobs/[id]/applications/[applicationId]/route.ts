import type { ApplicationStatus } from "@/lib/jobs-data"
import { jsonError, requireApiUser } from "@/lib/jobs/api-auth"

const REVIEW_STATUSES = new Set<ApplicationStatus>([
  "approved",
  "maybe",
  "declined",
])

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

type RouteContext = {
  params: Promise<{ id: string; applicationId: string }>
}

type PatchBody = {
  status?: ApplicationStatus
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const { id, applicationId } = await context.params
  if (!isUuid(id)) return jsonError("Invalid job id", 400)
  if (!isUuid(applicationId)) return jsonError("Invalid application id", 400)

  let body: PatchBody = {}
  try {
    const text = await request.text()
    if (text.trim()) {
      body = JSON.parse(text) as PatchBody
    }
  } catch {
    return jsonError("Invalid JSON body", 400)
  }

  if (!body.status || !REVIEW_STATUSES.has(body.status)) {
    return jsonError("Invalid application status", 400)
  }

  const { data: job, error: jobError } = await supabase
    .from("job_postings")
    .select("poster_id")
    .eq("id", id)
    .maybeSingle()

  if (jobError) return jsonError(jobError.message, 500)
  if (!job) return jsonError("Job not found", 404)
  if (job.poster_id !== user.id) return jsonError("Forbidden", 403)

  const { data: application, error: fetchError } = await supabase
    .from("job_applications")
    .select("id, status")
    .eq("id", applicationId)
    .eq("job_id", id)
    .maybeSingle()

  if (fetchError) return jsonError(fetchError.message, 500)
  if (!application) return jsonError("Application not found", 404)

  const { error: updateError } = await supabase
    .from("job_applications")
    .update({ status: body.status })
    .eq("id", applicationId)

  if (updateError) return jsonError(updateError.message, 500)

  return Response.json({ ok: true, status: body.status })
}
