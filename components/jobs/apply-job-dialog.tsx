"use client"

import * as React from "react"
import { toast } from "sonner"

import type { Job } from "@/lib/jobs-data"
import { applyToJob } from "@/lib/jobs/fetch"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ApplyJobDialogProps = {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplied: () => void
}

export function ApplyJobDialog({
  job,
  open,
  onOpenChange,
  onApplied,
}: ApplyJobDialogProps) {
  const [note, setNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) setNote("")
  }, [open])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await applyToJob(job.id, { note })
      toast.success("Application sent")
      onApplied()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit application",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply to {job.role}</DialogTitle>
          <DialogDescription>
            {job.production} · {job.location}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`apply-note-${job.id}`}>Note (optional)</Label>
            <Textarea
              id={`apply-note-${job.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Share availability, relevant credits, or why you're a fit..."
              className="min-h-28"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
