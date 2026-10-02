"use client"

import Link from "next/link"

import type { Job } from "@/lib/jobs-data"
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
}

export function ApplicationSentDialog({
  job,
  open,
  onOpenChange,
}: ApplicationSentDialogProps) {
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
            onClick={() => onOpenChange(false)}
          >
            My applications
          </Button>
          <DialogClose
            render={<Button type="button">Done</Button>}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
