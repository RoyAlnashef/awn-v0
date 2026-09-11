"use client"

import * as React from "react"
import { FileTextIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import {
  getProfileResumeSignedUrl,
  uploadProfileResume,
} from "@/lib/account/profile-actions"
import type { Job } from "@/lib/jobs-data"
import { applyToJob } from "@/lib/jobs/fetch"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

type ApplyJobDialogProps = {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplied: () => void
}

type ResumeState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "uploading"; fileName: string }
  | { status: "error"; message: string }
  | { status: "ready"; signedUrl: string; resumePath: string; fileName: string }

const resumeAttachmentClassName = "rounded-lg"
const resumeAttachmentMediaClassName = "rounded-md"

export function ApplyJobDialog({
  job,
  open,
  onOpenChange,
  onApplied,
}: ApplyJobDialogProps) {
  const [note, setNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [resumeState, setResumeState] = React.useState<ResumeState>({
    status: "loading",
  })
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadResume = React.useCallback(async () => {
    setResumeState({ status: "loading" })
    const result = await getProfileResumeSignedUrl()
    if (!result.ok) {
      setResumeState({ status: "error", message: result.error })
      return
    }
    if (!result.url || !result.resumePath) {
      setResumeState({ status: "missing" })
      return
    }
    setResumeState({
      status: "ready",
      signedUrl: result.url,
      resumePath: result.resumePath,
      fileName: result.fileName ?? "resume.pdf",
    })
  }, [])

  React.useEffect(() => {
    if (!open) {
      setNote("")
      setResumeState({ status: "loading" })
      return
    }
    void loadResume()
  }, [open, loadResume])

  async function handleResumeUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const fileName = file.name.trim() || "resume.pdf"
    setResumeState({ status: "uploading", fileName })
    const formData = new FormData()
    formData.set("resume", file)

    const result = await uploadProfileResume(formData)
    if (!result.ok) {
      setResumeState({ status: "error", message: result.error })
      toast.error(result.error)
      return
    }

    setResumeState({
      status: "ready",
      signedUrl: result.signedUrl,
      resumePath: result.resumePath,
      fileName: result.fileName,
    })
    toast.success("Resume saved to your profile")
  }

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

  function renderResumeSection() {
    if (resumeState.status === "loading") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Loading resume...
        </div>
      )
    }

    if (resumeState.status === "uploading") {
      return (
        <Attachment state="uploading" className={resumeAttachmentClassName}>
          <AttachmentMedia className={resumeAttachmentMediaClassName}>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{resumeState.fileName}</AttachmentTitle>
            <AttachmentDescription>Uploading...</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      )
    }

    if (resumeState.status === "error") {
      return (
        <div className="flex flex-col gap-2">
          <Attachment state="error" className={resumeAttachmentClassName}>
            <AttachmentMedia className={resumeAttachmentMediaClassName}>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Resume</AttachmentTitle>
              <AttachmentDescription>{resumeState.message}</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon />
            Try uploading again
          </Button>
        </div>
      )
    }

    if (resumeState.status === "ready") {
      return (
        <Attachment state="done" className={resumeAttachmentClassName}>
          <AttachmentMedia className={resumeAttachmentMediaClassName}>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{resumeState.fileName}</AttachmentTitle>
            <AttachmentDescription>PDF · Included with application</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              type="button"
              aria-label={`Replace ${resumeState.fileName}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger
            render={
              <a
                href={resumeState.signedUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${resumeState.fileName}`}
              />
            }
          />
        </Attachment>
      )
    }

    return (
      <Attachment state="idle" className={resumeAttachmentClassName}>
        <AttachmentMedia className={resumeAttachmentMediaClassName}>
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Resume</AttachmentTitle>
          <AttachmentDescription>
            Upload a PDF to include with your application
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentTrigger
          type="button"
          aria-label="Upload resume"
          onClick={() => fileInputRef.current?.click()}
        />
      </Attachment>
    )
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
            <Label>Resume</Label>
            {renderResumeSection()}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => void handleResumeUpload(event)}
            />
          </div>

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
