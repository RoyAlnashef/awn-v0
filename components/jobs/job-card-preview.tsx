import {
  departmentByRole,
  type Job,
  type JobPoster,
} from "@/lib/jobs-data"

export function formToPreviewJob(
  form: {
    kind: Job["kind"]
    role: string
    production: string
    location: string
    rate: string
    startDate?: Date
    endDate?: Date
    deadline?: Date
    engagement: Job["engagement"]
    details: string
  },
  poster: JobPoster,
): Job {
  const startDate = form.startDate
    ? `${form.startDate.getFullYear()}-${String(form.startDate.getMonth() + 1).padStart(2, "0")}-${String(form.startDate.getDate()).padStart(2, "0")}`
    : ""
  const endDate = form.endDate
    ? `${form.endDate.getFullYear()}-${String(form.endDate.getMonth() + 1).padStart(2, "0")}-${String(form.endDate.getDate()).padStart(2, "0")}`
    : ""
  const deadline =
    form.kind === "full" && form.deadline
      ? `${form.deadline.getFullYear()}-${String(form.deadline.getMonth() + 1).padStart(2, "0")}-${String(form.deadline.getDate()).padStart(2, "0")}`
      : ""

  return {
    id: "preview",
    kind: form.kind,
    status: "draft",
    posterId: "",
    role: form.role,
    department: departmentByRole[form.role] ?? "Production",
    production: form.production,
    location: form.location,
    payRate: form.rate,
    startDate,
    endDate,
    deadline,
    engagement: form.engagement,
    details: form.details,
    postedBy: poster,
    postedAt: "Preview",
    saved: false,
    applied: false,
  }
}
