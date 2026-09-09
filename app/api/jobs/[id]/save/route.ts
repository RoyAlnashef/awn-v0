import { jsonError, requireApiUser } from "@/lib/jobs/api-auth"

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const { id } = await context.params
  if (!isUuid(id)) return jsonError("Invalid job id", 400)

  const { data: job, error: jobError } = await supabase
    .from("job_postings")
    .select("id, status")
    .eq("id", id)
    .maybeSingle()

  if (jobError) return jsonError(jobError.message, 500)
  if (!job) return jsonError("Job not found", 404)
  if (job.status === "deleted") return jsonError("Job not found", 404)

  const { data: existing, error: existingError } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("job_id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingError) return jsonError(existingError.message, 500)

  if (existing) {
    const { error: deleteError } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", id)
      .eq("user_id", user.id)

    if (deleteError) return jsonError(deleteError.message, 500)
    return Response.json({ saved: false })
  }

  const { error: insertError } = await supabase.from("saved_jobs").insert({
    job_id: id,
    user_id: user.id,
  })

  if (insertError) return jsonError(insertError.message, 500)

  return Response.json({ saved: true })
}
