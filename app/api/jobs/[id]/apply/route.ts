import { jsonError, requireApiUser } from "@/lib/jobs/api-auth"
import { expireStaleJobs } from "@/lib/jobs/expire"
import { notifyJobPosterOfApplication } from "@/lib/jobs/job-poster-application-notifications"
import type { SupabaseClient } from "@supabase/supabase-js"

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

type RouteContext = {
  params: Promise<{ id: string }>
}

type ApplyBody = {
  note?: string
}

async function loadApplicantDisplayName(
  supabase: SupabaseClient,
  applicantId: string,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", applicantId)
    .maybeSingle()

  return profile?.full_name?.trim() || "Someone"
}

async function notifyPosterForApplication(
  supabase: SupabaseClient,
  input: {
    applicantId: string
    posterId: string
    jobId: string
    applicationId: string
    role: string
  },
): Promise<void> {
  const applicantName = await loadApplicantDisplayName(supabase, input.applicantId)
  await notifyJobPosterOfApplication({
    posterId: input.posterId,
    jobId: input.jobId,
    applicationId: input.applicationId,
    role: input.role,
    applicantName,
  })
}

export async function POST(request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const { id } = await context.params
  if (!isUuid(id)) return jsonError("Invalid job id", 400)

  let body: ApplyBody = {}
  try {
    const text = await request.text()
    if (text.trim()) {
      body = JSON.parse(text) as ApplyBody
    }
  } catch {
    return jsonError("Invalid JSON body", 400)
  }

  try {
    await expireStaleJobs(supabase)
  } catch (expireError) {
    return jsonError(
      expireError instanceof Error ? expireError.message : "Could not expire jobs",
      500,
    )
  }

  const { data: job, error: jobError } = await supabase
    .from("job_postings")
    .select("id, poster_id, status, role")
    .eq("id", id)
    .maybeSingle()

  if (jobError) return jsonError(jobError.message, 500)
  if (!job) return jsonError("Job not found", 404)
  if (job.poster_id === user.id) {
    return jsonError("You cannot apply to your own posting", 400)
  }
  if (job.status === "expired") {
    return jsonError("This job has expired and is no longer accepting applications", 400)
  }
  if (job.status !== "open") {
    return jsonError("This job is no longer accepting applications", 400)
  }

  const { data: existing } = await supabase
    .from("job_applications")
    .select("id, status")
    .eq("job_id", id)
    .eq("applicant_id", user.id)
    .maybeSingle()

  if (existing && existing.status !== "withdrawn") {
    return jsonError("You have already applied to this job", 409)
  }

  if (existing?.status === "withdrawn") {
    const { error: updateError } = await supabase
      .from("job_applications")
      .update({
        note: body.note?.trim() ?? "",
        status: "pending",
      })
      .eq("id", existing.id)

    if (updateError) return jsonError(updateError.message, 500)

    try {
      await notifyPosterForApplication(supabase, {
        applicantId: user.id,
        posterId: job.poster_id,
        jobId: job.id,
        applicationId: existing.id,
        role: job.role ?? "",
      })
    } catch {
      // Best-effort: apply already succeeded.
    }

    return Response.json({ ok: true })
  }

  const { data: inserted, error: insertError } = await supabase
    .from("job_applications")
    .insert({
      job_id: id,
      applicant_id: user.id,
      note: body.note?.trim() ?? "",
      status: "pending",
    })
    .select("id")
    .single()

  if (insertError) return jsonError(insertError.message, 500)

  try {
    await notifyPosterForApplication(supabase, {
      applicantId: user.id,
      posterId: job.poster_id,
      jobId: job.id,
      applicationId: inserted.id,
      role: job.role ?? "",
    })
  } catch {
    // Best-effort: apply already succeeded.
  }

  return Response.json({ ok: true }, { status: 201 })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireApiUser()
  if (!user) return jsonError(error, 401)

  const { id } = await context.params
  if (!isUuid(id)) return jsonError("Invalid job id", 400)

  const { data: existing, error: fetchError } = await supabase
    .from("job_applications")
    .select("id")
    .eq("job_id", id)
    .eq("applicant_id", user.id)
    .neq("status", "withdrawn")
    .maybeSingle()

  if (fetchError) return jsonError(fetchError.message, 500)
  if (!existing) return jsonError("Application not found", 404)

  const { error: updateError } = await supabase
    .from("job_applications")
    .update({ status: "withdrawn" })
    .eq("id", existing.id)

  if (updateError) return jsonError(updateError.message, 500)

  return new Response(null, { status: 204 })
}
