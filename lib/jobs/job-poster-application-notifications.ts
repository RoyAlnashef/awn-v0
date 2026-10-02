import type { CreateNotificationInput } from "@/lib/notifications/create-notification-types"
import { persistNotification } from "@/lib/notifications/persist-notification"
import { scheduleNotificationPush } from "@/lib/notifications/schedule-notification-push"

export const JOB_APPLICATION_RECEIVED_KIND = "job_application_received" as const

function roleLabel(role: string): string {
  const trimmed = role.trim()
  return trimmed || "your job"
}

function applicantLabel(name: string): string {
  const trimmed = name.trim()
  return trimmed || "Someone"
}

/** Best-effort: does not throw; apply must not depend on success. */
export async function notifyJobPosterOfApplication(input: {
  posterId: string
  jobId: string
  applicationId: string
  role: string
  applicantName: string
}): Promise<void> {
  const role = roleLabel(input.role)
  const applicant = applicantLabel(input.applicantName)

  const notificationInput: CreateNotificationInput = {
    userId: input.posterId,
    kind: JOB_APPLICATION_RECEIVED_KIND,
    title: "New application",
    body: `${applicant} applied for ${role}.`,
    data: {
      jobId: input.jobId,
      applicationId: input.applicationId,
    },
  }

  const result = await persistNotification(notificationInput)
  if (result.ok) {
    scheduleNotificationPush(result, notificationInput)
  }
}
