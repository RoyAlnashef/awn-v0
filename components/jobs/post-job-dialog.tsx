"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import {
  engagementTypes,
  roleGroups,
  type EngagementType,
  type JobKind,
} from "@/lib/jobs-data"
import { createJob } from "@/lib/jobs/fetch"
import { toDateOnly } from "@/lib/jobs/format"
import { jobsListKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

function revalidateJobs() {
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

export function PostJobDialog() {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<PostJobForm>(emptyForm)
  const [submitting, setSubmitting] = React.useState(false)

  function update(patch: Partial<PostJobForm>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!form.role.trim()) {
      toast.error("Select a role")
      return
    }
    if (!form.startDate) {
      toast.error("Pick a start date")
      return
    }
    if (!form.endDate) {
      toast.error("Pick an end date")
      return
    }

    setSubmitting(true)
    try {
      await createJob({
        kind: form.kind,
        role: form.role,
        production: form.production,
        location: form.location,
        payRate: form.rate,
        startDate: toDateOnly(form.startDate),
        endDate: toDateOnly(form.endDate),
        deadline:
          form.kind === "full" && form.deadline
            ? toDateOnly(form.deadline)
            : null,
        engagement: form.engagement,
        details: form.details,
      })

      toast.success(
        form.kind === "urgent"
          ? "Urgent request posted — live for 48 hours"
          : "Role posted",
      )
      setOpen(false)
      setForm(emptyForm)
      void revalidateJobs()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not post role",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setForm(emptyForm)
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus />
            Post a job
          </Button>
        }
      />
      <DialogContent className="max-h-[calc(100svh-2rem)] gap-0 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Post a role</DialogTitle>
          <DialogDescription>
            Touring, festival, one-off, or residency — share it with the AWN
            network.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <FieldLabel>Posting Type</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "full", label: "Full Role" },
                  { value: "urgent", label: "Urgent Help" },
                ] as const
              ).map(({ value, label }) => {
                const active = form.kind === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update({ kind: value })}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
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
                Urgent Help posts stay live for 48 hours and are visible on the
                jobs board.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Role</FieldLabel>
            <Select
              value={form.role || null}
              onValueChange={(value) => update({ role: (value as string) ?? "" })}
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
              <FieldLabel>
                {form.kind === "urgent" ? "Date Needed" : "Start Date"}
              </FieldLabel>
              <DatePicker
                value={form.startDate}
                onChange={(date) => update({ startDate: date })}
                placeholder="Pick a start date"
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>
                {form.kind === "urgent" ? "Through Date" : "End Date"}
              </FieldLabel>
              <DatePicker
                value={form.endDate}
                onChange={(date) => update({ endDate: date })}
                placeholder="Pick an end date"
              />
            </div>
          </div>

          {form.kind === "full" ? (
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
          ) : null}

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
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
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

          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post role →"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
