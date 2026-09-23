"use client"

import * as React from "react"
import { mutate } from "swr"
import { toast } from "sonner"

import { HelpNowForm } from "@/components/help-now/help-now-form"
import { createJob } from "@/lib/jobs/fetch"
import {
  emptyHelpNowForm,
  helpNowFormToCreatePayload,
  validateHelpNowForm,
} from "@/lib/jobs/help-now"
import { urgentApplyButtonStyles, urgentDotStyles } from "@/lib/jobs/format"
import { jobsListKey, urgentJobsKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function revalidateJobs() {
  void mutate(urgentJobsKey)
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

export function HelpNowDialog({
  open,
  onOpenChange,
  onPosted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPosted?: () => void
}) {
  const [values, setValues] = React.useState(emptyHelpNowForm)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) setValues(emptyHelpNowForm)
  }, [open])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const error = validateHelpNowForm(values)
    if (error) {
      toast.error(error)
      return
    }

    setSubmitting(true)
    try {
      await createJob(helpNowFormToCreatePayload(values))
      toast.success("Urgent request posted — live for 48 hours")
      revalidateJobs()
      onPosted?.()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <span
              className={cn("size-2 shrink-0 rounded-full", urgentDotStyles)}
              aria-hidden
            />
            Help Now
          </DialogTitle>
          <DialogDescription>
            Post an urgent request — visible to available members for 48 hours
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-2 flex flex-col gap-4"
        >
          <HelpNowForm
            values={values}
            onChange={setValues}
            disabled={submitting}
            idPrefix="help-now-dialog"
          />

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={submitting} />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={submitting}
              className={urgentApplyButtonStyles}
            >
              {submitting ? "Posting..." : "Post urgent role →"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
