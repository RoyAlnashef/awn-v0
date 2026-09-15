"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { addDays } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { HelpNowForm } from "@/components/help-now/help-now-form"
import {
  engagementTypes,
  parseDateOnly,
  roleGroups,
  type EngagementType,
  type Job,
  type JobKind,
  type JobPoster,
  type JobStatus,
} from "@/lib/jobs-data"
import { createJob, updateJob } from "@/lib/jobs/fetch"
import {
  emptyHelpNowForm,
  helpNowFormToCreatePayload,
  helpNowFormToUpdatePayload,
  jobToHelpNowForm,
  validateHelpNowForm,
  type HelpNowFormValues,
} from "@/lib/jobs/help-now"
import { toDateOnly } from "@/lib/jobs/format"
import { jobsListKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/jobs/date-picker"
import {
  formToPreviewJob,
  helpNowToPreviewJob,
} from "@/components/jobs/job-card-preview"
import { JobPageLayout } from "@/components/jobs/job-page-layout"
import { JobStatusSelect } from "@/components/jobs/job-status-select"

interface PostJobForm {
  kind: JobKind
  role: string
  production: string
  location: string
  rate: string
  startDate?: Date
  endDate?: Date
  deadline?: Date
  engagement: EngagementType
  details: string
}

const JOB_FORM_ID = "job-role-form"

const emptyForm: PostJobForm = {
  kind: "full",
  role: "",
  production: "",
  location: "",
  rate: "",
  engagement: "Touring",
  details: "",
}

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
    >
      {children}
      {hint ? (
        <span className="font-normal normal-case tracking-normal">
          — {hint}
        </span>
      ) : null}
    </Label>
  )
}

function jobToForm(job: Job): PostJobForm {
  return {
    kind: job.kind,
    role: job.role,
    production: job.production,
    location: job.location,
    rate: job.payRate,
    startDate: job.startDate ? parseDateOnly(job.startDate) : undefined,
    endDate: job.endDate ? parseDateOnly(job.endDate) : undefined,
    deadline:
      job.deadline && job.deadline !== job.endDate
        ? parseDateOnly(job.deadline)
        : undefined,
    engagement: job.engagement,
    details: job.details,
  }
}

type EditFormSnapshot =
  | {
      kind: "full"
      role: string
      production: string
      location: string
      rate: string
      startDate: string | null
      endDate: string | null
      deadline: string | null
      engagement: EngagementType
      details: string
    }
  | {
      kind: "urgent"
      role: string
      location: string
      dateTime: string
      rate: string
      details: string
    }

function snapshotFromJob(job: Job): EditFormSnapshot {
  if (job.kind === "urgent") {
    const helpNow = jobToHelpNowForm(job)
    return {
      kind: "urgent",
      role: helpNow.role,
      location: helpNow.location,
      dateTime: helpNow.dateTime,
      rate: helpNow.rate,
      details: helpNow.details,
    }
  }

  const form = jobToForm(job)
  return {
    kind: "full",
    role: form.role,
    production: form.production,
    location: form.location,
    rate: form.rate,
    startDate: form.startDate ? toDateOnly(form.startDate) : null,
    endDate: form.endDate ? toDateOnly(form.endDate) : null,
    deadline: form.deadline ? toDateOnly(form.deadline) : null,
    engagement: form.engagement,
    details: form.details,
  }
}

function snapshotFromForm(
  form: PostJobForm,
  helpNowValues: HelpNowFormValues,
): EditFormSnapshot {
  if (form.kind === "urgent") {
    return {
      kind: "urgent",
      role: helpNowValues.role,
      location: helpNowValues.location,
      dateTime: helpNowValues.dateTime,
      rate: helpNowValues.rate,
      details: helpNowValues.details,
    }
  }

  return {
    kind: "full",
    role: form.role,
    production: form.production,
    location: form.location,
    rate: form.rate,
    startDate: form.startDate ? toDateOnly(form.startDate) : null,
    endDate: form.endDate ? toDateOnly(form.endDate) : null,
    deadline: form.deadline ? toDateOnly(form.deadline) : null,
    engagement: form.engagement,
    details: form.details,
  }
}

function snapshotsEqual(a: EditFormSnapshot, b: EditFormSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function revalidateJobs() {
  void mutate(
    (key) =>
      typeof key === "string" &&
      (key.startsWith(jobsListKey) || key.startsWith("/api/jobs/mine")),
  )
}

export function JobFormPage({
  job,
  poster,
}: {
  job?: Job
  poster: JobPoster
}) {
  const router = useRouter()
  const isEdit = Boolean(job)
  const [form, setForm] = React.useState<PostJobForm>(
    job ? jobToForm(job) : emptyForm,
  )
  const [helpNowValues, setHelpNowValues] = React.useState<HelpNowFormValues>(
    job && job.kind === "urgent" ? jobToHelpNowForm(job) : emptyHelpNowForm,
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [jobStatus, setJobStatus] = React.useState<JobStatus>(
    job?.status ?? "draft",
  )

  const initialSnapshot = React.useMemo(
    () => (job ? snapshotFromJob(job) : null),
    [job],
  )

  const hasFormChanges =
    isEdit &&
    initialSnapshot !== null &&
    !snapshotsEqual(snapshotFromForm(form, helpNowValues), initialSnapshot)

  const previewJob = React.useMemo(() => {
    const base =
      form.kind === "urgent"
        ? helpNowToPreviewJob(helpNowValues, poster)
        : formToPreviewJob(form, poster)
    return isEdit ? { ...base, status: jobStatus } : base
  }, [form, helpNowValues, poster, isEdit, jobStatus])

  function setPostingKind(kind: JobKind) {
    if (kind === form.kind) return

    if (kind === "urgent") {
      setHelpNowValues({
        role: form.role,
        location: form.location,
        dateTime: "",
        rate: form.rate,
        details: form.details,
      })
      setForm((prev) => ({ ...prev, kind: "urgent" }))
      return
    }

    setForm((prev) => ({
      ...prev,
      kind: "full",
      role: helpNowValues.role,
      location: helpNowValues.location,
      production: "",
      rate: helpNowValues.rate,
      details: helpNowValues.details,
    }))
  }

  function update(patch: Partial<PostJobForm>) {
    if (patch.kind !== undefined) {
      setPostingKind(patch.kind)
      return
    }
    setForm((prev) => ({ ...prev, ...patch }))
  }

  function validateRole(): boolean {
    if (!form.role.trim()) {
      toast.error("Select a role")
      return false
    }
    return true
  }

  function validatePublish(): boolean {
    if (form.kind === "urgent") {
      const error = validateHelpNowForm(helpNowValues)
      if (error) {
        toast.error(error)
        return false
      }
      return true
    }

    if (!validateRole()) return false
    if (!form.startDate) {
      toast.error("Pick a start date")
      return false
    }
    if (!form.endDate) {
      toast.error("Pick an end date")
      return false
    }
    if (form.endDate <= form.startDate) {
      toast.error("End date must be after start date")
      return false
    }
    return true
  }

  function buildPayload(status: Extract<JobStatus, "draft" | "open">) {
    return {
      kind: form.kind,
      role: form.role,
      production: form.production,
      location: form.location,
      payRate: form.rate,
      startDate: form.startDate ? toDateOnly(form.startDate) : undefined,
      endDate: form.endDate ? toDateOnly(form.endDate) : undefined,
      deadline:
        form.kind === "full" && form.deadline
          ? toDateOnly(form.deadline)
          : null,
      engagement: form.engagement,
      details: form.details,
      status,
    }
  }

  async function handleDraft() {
    if (!validateRole()) return

    setSubmitting(true)
    try {
      if (isEdit && job) {
        await updateJob(job.id, {
          ...buildPayload("draft"),
          status: "draft",
        })
        toast.success("Draft saved")
        revalidateJobs()
        router.push(`/jobs/${job.id}`)
      } else {
        const { job: created } = await createJob(buildPayload("draft"))
        toast.success("Draft saved")
        revalidateJobs()
        router.push(`/jobs/${created.id}/edit`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save draft",
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault()
    if (!validatePublish()) return

    setSubmitting(true)
    try {
      if (form.kind === "urgent") {
        const payload = helpNowFormToCreatePayload(helpNowValues)
        if (isEdit && job) {
          await updateJob(job.id, helpNowFormToUpdatePayload(helpNowValues))
          toast.success("Urgent request updated")
          revalidateJobs()
          router.push(`/jobs/${job.id}`)
        } else {
          const { job: created } = await createJob(payload)
          toast.success("Urgent request posted — live for 48 hours")
          revalidateJobs()
          router.push(`/jobs/${created.id}`)
        }
      } else if (isEdit && job) {
        const { status: _status, ...fields } = buildPayload("open")
        await updateJob(job.id, fields)
        toast.success("Role updated")
        revalidateJobs()
        router.push(`/jobs/${job.id}`)
      } else {
        const { job: created } = await createJob(buildPayload("open"))
        toast.success("Role posted")
        revalidateJobs()
        router.push(`/jobs/${created.id}`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not post role",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <JobPageLayout
      title={isEdit ? "Edit role" : "Post a role"}
      description="Touring, festival, one-off, or residency — share it with the AWN network."
      actions={
        <>
          {isEdit && job ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                nativeButton={false}
                render={<Link href={`/jobs/${job.id}`} />}
              >
                Cancel
              </Button>
              <JobStatusSelect
                jobId={job.id}
                status={jobStatus}
                disabled={submitting}
                onStatusChange={(status) => setJobStatus(status)}
              />
              {hasFormChanges ? (
                <Button
                  size="sm"
                  type="submit"
                  form={JOB_FORM_ID}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save"}
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/my-jobs/created" />}
            >
              <ArrowLeft />
              My Jobs
            </Button>
          )}
        </>
      }
      previewJob={previewJob}
    >
      <form
        id={JOB_FORM_ID}
        onSubmit={(event) => void handlePublish(event)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <FieldLabel>Posting Type</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "full", label: "Full Role" },
                { value: "urgent", label: "Help Now" },
              ] as const
            ).map(({ value, label }) => {
              const active = form.kind === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPostingKind(value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-md border px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-input/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {form.kind === "urgent" ? (
            <p className="text-xs text-muted-foreground">
              Help Now posts stay live for 48 hours and are visible on the
              jobs board.
            </p>
          ) : null}
        </div>

        {form.kind === "urgent" ? (
          <HelpNowForm
            values={helpNowValues}
            onChange={setHelpNowValues}
            disabled={submitting}
            idPrefix="job-form-help-now"
          />
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <FieldLabel>Role</FieldLabel>
              <Select
                value={form.role || null}
                onValueChange={(value) =>
                  update({ role: (value as string) ?? "" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {roleGroups.map((group) => (
                    <SelectGroup key={group.department}>
                      <SelectLabel>{group.department}</SelectLabel>
                      {group.roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="production">Production / Tour Name</FieldLabel>
              <Input
                id="production"
                value={form.production}
                onChange={(e) => update({ production: e.target.value })}
                placeholder="e.g. Taylor Swift · Eras Tour, Coachella 2026"
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="location">Location / Routing</FieldLabel>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update({ location: e.target.value })}
                placeholder="e.g. UK / Europe, Nationwide US, LA-based"
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="rate">Rate</FieldLabel>
              <Input
                id="rate"
                value={form.rate}
                onChange={(e) => update({ rate: e.target.value })}
                placeholder="e.g. $2,500/wk + per diem, £350/day"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldLabel>Start Date</FieldLabel>
                <DatePicker
                  value={form.startDate}
                  onChange={(date) => {
                    const patch: Partial<PostJobForm> = { startDate: date }
                    if (date && form.endDate && form.endDate <= date) {
                      patch.endDate = undefined
                    }
                    update(patch)
                  }}
                  placeholder="Pick a start date"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel>End Date</FieldLabel>
                <DatePicker
                  value={form.endDate}
                  onChange={(date) => update({ endDate: date })}
                  minDate={
                    form.startDate ? addDays(form.startDate, 1) : undefined
                  }
                  defaultMonth={form.startDate}
                  highlightDate={form.startDate}
                  placeholder="Pick an end date"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel hint="listing closes after this date">
                Application Deadline
              </FieldLabel>
              <DatePicker
                value={form.deadline}
                onChange={(date) => update({ deadline: date })}
                placeholder="Pick a deadline"
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Engagement Type</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {engagementTypes.map((type) => {
                  const active = form.engagement === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update({ engagement: type })}
                      aria-pressed={active}
                      className={cn(
                        "rounded-md border px-4 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-input/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="details">Details</FieldLabel>
              <Textarea
                id="details"
                value={form.details}
                onChange={(e) => update({ details: e.target.value })}
                placeholder="Advance info, what you're looking for, any specific requirements..."
                className="min-h-28"
              />
            </div>
          </>
        )}

        {!isEdit ? (
          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              nativeButton={false}
              render={<Link href="/my-jobs/created" />}
            >
              Cancel
            </Button>
            {form.kind === "full" ? (
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => void handleDraft()}
              >
                {submitting ? "Saving..." : "Save draft"}
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Posting..."
                : form.kind === "urgent"
                  ? "Post urgent role →"
                  : "Post role →"}
            </Button>
          </div>
        ) : null}
      </form>
    </JobPageLayout>
  )
}
