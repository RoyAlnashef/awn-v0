"use client"

import * as React from "react"
import Link from "next/link"
import { Undo2 } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import type { Job } from "@/lib/jobs-data"
import { withdrawFromJob } from "@/lib/jobs/fetch"
import { jobsListKey, myApplicationsKey } from "@/lib/jobs/swr-keys"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ApplicationSentDialogProps = {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onWithdrawn: () => void
}

function revalidateAfterWithdraw() {
  void mutate(myApplicationsKey)
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

export function ApplicationSentDialog({
  job,
  open,
  onOpenChange,
  onWithdrawn,
}: ApplicationSentDialogProps) {
  const [undoing, setUndoing] = React.useState(false)

  async function handleUndo() {
    setUndoing(true)
    try {
      await withdrawFromJob(job.id)
      toast.success("Application undone")
      revalidateAfterWithdraw()
      onWithdrawn()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not undo application",
      )
    } finally {
      setUndoing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden>
              🥳
            </span>
            Application sent!
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <span>
              Your application for <b>{job.role}</b> is on its way. The
              recruiter can view your profile anytime.
            </span>
          </DialogDescription>
        </DialogHeader>


        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            render={<Link href="/my-jobs/applications" />}
            variant="secondary"
            // className="w-full"
            disabled={undoing}
            onClick={() => onOpenChange(false)}
          >
            My applications
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={undoing}
            onClick={() => void handleUndo()}
          >
            <Undo2 className="size-4" />
            {undoing ? "Undoing..." : "Undo"}
          </Button>
          <DialogClose
            render={
              <Button type="button" disabled={undoing}>
                Done
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
