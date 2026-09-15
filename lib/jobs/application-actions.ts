"use server"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { isUuid } from "@/lib/messages/format"
import {
  getOrCreateConversation,
  sendMessage,
} from "@/lib/messages/actions"
import { createNotification } from "@/lib/notifications/actions"
import { createClient } from "@/lib/supabase/server"

type ActionError = { ok: false; error: string }

export type AcceptJobApplicationWithMessageResult =
  | { ok: true; conversationId: string; status: "approved" }
  | ActionError

export type AcceptJobApplicationWithMessageInput = {
  jobId: string
  applicationId: string
  message: string
}

function actionError(error: unknown): ActionError {
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: "Something went wrong." }
}

export async function acceptJobApplicationWithMessage(
  input: AcceptJobApplicationWithMessageInput,
): Promise<AcceptJobApplicationWithMessageResult> {
  try {
    const { jobId, applicationId, message } = input

    if (!isUuid(jobId)) {
      return { ok: false, error: "Invalid job id." }
    }
    if (!isUuid(applicationId)) {
      return { ok: false, error: "Invalid application id." }
    }

    const text = message.trim()
    if (!text) {
      return { ok: false, error: "Message is required." }
    }

    const user = await getSessionUser()
    if (!user) {
      return { ok: false, error: "Unauthorized" }
    }

    const supabase = await createClient()

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("poster_id, role")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) return { ok: false, error: jobError.message }
    if (!job) return { ok: false, error: "Job not found." }
    if (job.poster_id !== user.id) {
      return { ok: false, error: "Forbidden" }
    }

    const { data: application, error: applicationError } = await supabase
      .from("job_applications")
      .select("id, applicant_id, status")
      .eq("id", applicationId)
      .eq("job_id", jobId)
      .maybeSingle()

    if (applicationError) {
      return { ok: false, error: applicationError.message }
    }
    if (!application) {
      return { ok: false, error: "Application not found." }
    }
    if (application.status !== "pending" && application.status !== "maybe") {
      return { ok: false, error: "Application is no longer reviewable." }
    }

    const previousStatus = application.status

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({ status: "approved" })
      .eq("id", applicationId)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    const conversationResult = await getOrCreateConversation(
      application.applicant_id,
    )
    if (!conversationResult.ok) {
      await supabase
        .from("job_applications")
        .update({ status: previousStatus })
        .eq("id", applicationId)
      return conversationResult
    }

    const sendResult = await sendMessage(
      conversationResult.conversationId,
      text,
      { jobId },
    )
    if (!sendResult.ok) {
      await supabase
        .from("job_applications")
        .update({ status: previousStatus })
        .eq("id", applicationId)
      return sendResult
    }

    const roleLabel = job.role?.trim() || "this job"
    const notificationResult = await createNotification({
      userId: application.applicant_id,
      kind: "application_accepted",
      title: "Application accepted",
      body: `Your application for ${roleLabel} was accepted.`,
      data: {
        jobId,
        applicationId,
        conversationId: conversationResult.conversationId,
      },
    })

    if (!notificationResult.ok) {
      return notificationResult
    }

    return {
      ok: true,
      conversationId: conversationResult.conversationId,
      status: "approved",
    }
  } catch (error) {
    return actionError(error)
  }
}
