import { createClient } from "@/lib/supabase/server"

export const JOB_UNDER_REVIEW_MESSAGE =
  "This job is under review by AWN. You cannot change it until review is complete."

export async function isJobUnderReview(jobId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("job_postings")
    .select("under_review_at")
    .eq("id", jobId)
    .maybeSingle()

  return Boolean(data?.under_review_at)
}

export async function assertPosterCanMutateJob(
  jobId: string,
  posterId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("job_postings")
    .select("poster_id, under_review_at")
    .eq("id", jobId)
    .maybeSingle()

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!data) {
    return { ok: false, error: "Job not found." }
  }
  if (data.poster_id !== posterId) {
    return { ok: false, error: "Forbidden" }
  }
  if (data.under_review_at) {
    return { ok: false, error: JOB_UNDER_REVIEW_MESSAGE }
  }
  return { ok: true }
}
