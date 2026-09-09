import type { CreateJobPayload, UpdateJobPayload } from "@/lib/jobs/fetch"
import type { Job } from "@/lib/jobs-data"

export const HELP_NOW_DETAILS_MAX = 280

export type HelpNowFormValues = {
  role: string
  location: string
  dateTime: string
  rate: string
  details: string
}

export const emptyHelpNowForm: HelpNowFormValues = {
  role: "",
  location: "",
  dateTime: "",
  rate: "",
  details: "",
}

export function jobToHelpNowForm(job: Job): HelpNowFormValues {
  return {
    role: job.role,
    location: job.location,
    dateTime: job.production,
    rate: job.payRate,
    details: job.details,
  }
}

export function helpNowFormToCreatePayload(
  values: HelpNowFormValues,
): CreateJobPayload {
  return {
    kind: "urgent",
    role: values.role.trim(),
    production: values.dateTime.trim(),
    location: values.location.trim(),
    payRate: values.rate.trim(),
    engagement: "One-Off",
    details: values.details.trim(),
    status: "open",
  }
}

export function helpNowFormToUpdatePayload(
  values: HelpNowFormValues,
): UpdateJobPayload {
  return {
    kind: "urgent",
    role: values.role.trim(),
    production: values.dateTime.trim(),
    location: values.location.trim(),
    payRate: values.rate.trim(),
    engagement: "One-Off",
    details: values.details.trim(),
    status: "open",
  }
}

export function validateHelpNowForm(values: HelpNowFormValues): string | null {
  if (!values.role.trim()) return "Role is required"
  if (!values.location.trim()) return "Location is required"
  if (!values.dateTime.trim()) return "Date & time is required"
  if (values.details.length > HELP_NOW_DETAILS_MAX) {
    return `Details must be ${HELP_NOW_DETAILS_MAX} characters or fewer`
  }
  return null
}
