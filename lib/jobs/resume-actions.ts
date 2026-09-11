"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const RESUME_BUCKET = "resumes"

export type JobApplicationResumeResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export async function getJobApplicationResumeSignedUrl(
  applicationId: string,
): Promise<JobApplicationResumeResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Unauthorized" }
    }

    const { data: application, error: applicationError } = await supabase
      .from("job_applications")
      .select(
        `
        resume_url,
        job:job_postings!job_applications_job_id_fkey (
          poster_id
        )
      `,
      )
      .eq("id", applicationId)
      .maybeSingle()

    if (applicationError) {
      return { ok: false, error: applicationError.message }
    }

    if (!application) {
      return { ok: false, error: "Application not found." }
    }

    const job = Array.isArray(application.job)
      ? application.job[0]
      : application.job

    if (!job || job.poster_id !== user.id) {
      return { ok: false, error: "Forbidden" }
    }

    const resumePath = application.resume_url?.trim()
    if (!resumePath) {
      return { ok: false, error: "No resume on file." }
    }

    const admin = createAdminClient()
    const { data: signed, error: signError } = await admin.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(resumePath, 60 * 10)

    if (signError || !signed?.signedUrl) {
      return {
        ok: false,
        error: signError?.message || "Could not load resume.",
      }
    }

    return { ok: true, url: signed.signedUrl }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}
