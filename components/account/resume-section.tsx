"use client"

import * as React from "react"
import { ExternalLink, UploadIcon, X } from "lucide-react"
import { toast } from "sonner"

import {
  getProfileResumeSignedUrl,
  removeProfileResume,
  uploadProfileResume,
} from "@/lib/account/profile-actions"
import { useAccountProfile } from "@/components/account/account-profile-provider"
import { Button } from "@/components/ui/button"
import {
  FileDropzone,
  type FileDropzoneState,
} from "@/components/ui/file-dropzone"
import { Spinner } from "@/components/ui/spinner"

const MAX_RESUME_BYTES = 5 * 1024 * 1024
const RESUME_HINT = "PDF only · Up to 5 MB"

type ResumeData = {
  signedUrl: string
  resumePath: string
  fileName: string
}

type ResumeViewState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; data: ResumeData }
  | { status: "load-error"; message: string }

export function ResumeSection() {
  const { commitSavedPatch } = useAccountProfile()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [resumeView, setResumeView] = React.useState<ResumeViewState>({
    status: "loading",
  })
  const [dropzoneState, setDropzoneState] =
    React.useState<FileDropzoneState>("idle")
  const [uploadingFileName, setUploadingFileName] = React.useState<string>()
  const [errorMessage, setErrorMessage] = React.useState<string>()
  const [isRemoving, setIsRemoving] = React.useState(false)

  const loadResume = React.useCallback(async () => {
    setResumeView({ status: "loading" })
    const result = await getProfileResumeSignedUrl()
    if (!result.ok) {
      setResumeView({ status: "load-error", message: result.error })
      return
    }
    if (!result.url || !result.resumePath) {
      setResumeView({ status: "missing" })
      return
    }
    setResumeView({
      status: "ready",
      data: {
        signedUrl: result.url,
        resumePath: result.resumePath,
        fileName: result.fileName ?? "resume.pdf",
      },
    })
  }, [])

  React.useEffect(() => {
    void loadResume()
  }, [loadResume])

  const hasResume = resumeView.status === "ready"

  async function handleFileSelect(file: File) {
    setErrorMessage(undefined)

    if (file.type !== "application/pdf") {
      setDropzoneState("error")
      setErrorMessage("Resume must be a PDF file.")
      return
    }

    if (file.size > MAX_RESUME_BYTES) {
      setDropzoneState("error")
      setErrorMessage("Resume must be 5 MB or smaller.")
      return
    }

    const fileName = file.name.trim() || "resume.pdf"
    setDropzoneState("uploading")
    setUploadingFileName(fileName)

    const formData = new FormData()
    formData.set("resume", file)

    const result = await uploadProfileResume(formData)
    if (!result.ok) {
      setDropzoneState("error")
      setErrorMessage(result.error)
      setUploadingFileName(undefined)
      toast.error(result.error)
      return
    }

    setDropzoneState("idle")
    setUploadingFileName(undefined)
    setResumeView({
      status: "ready",
      data: {
        signedUrl: result.signedUrl,
        resumePath: result.resumePath,
        fileName: result.fileName,
      },
    })
    commitSavedPatch({ hasResume: true })
    toast.success("Resume saved to your profile")
  }

  async function handleRemove() {
    setIsRemoving(true)
    const result = await removeProfileResume()
    setIsRemoving(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setResumeView({ status: "missing" })
    setDropzoneState("idle")
    setErrorMessage(undefined)
    commitSavedPatch({ hasResume: false })
    toast.success("Resume removed")
  }

  function handleReplaceClick() {
    fileInputRef.current?.click()
  }

  if (resumeView.status === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold">Resume</h3>
          <p className="text-sm text-muted-foreground">
            Upload your resume for job applications and your public profile.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Loading resume…
        </div>
      </div>
    )
  }

  if (resumeView.status === "load-error") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold">Resume</h3>
          <p className="text-sm text-muted-foreground">
            Upload your resume for job applications and your public profile.
          </p>
        </div>
        <p className="text-sm text-destructive">{resumeView.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadResume()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-base font-semibold">Resume</h3>
        <p className="text-sm text-muted-foreground">
          Upload your resume for job applications and your public profile.
        </p>
      </div>

      <FileDropzone
        accept="application/pdf,.pdf"
        hint={RESUME_HINT}
        state={dropzoneState}
        uploadingFileName={uploadingFileName}
        errorMessage={errorMessage}
        onFileSelect={(file) => void handleFileSelect(file)}
        disabled={isRemoving}
        variant={hasResume ? "compact" : "default"}
        inputRef={fileInputRef}
      />

      {!hasResume ? (
        <p className="text-sm text-muted-foreground">
          Your resume will be included when you apply to jobs and available for
          download on your profile.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Resume
            </h4>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={resumeView.data.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              View
              <ExternalLink />
            </Button>
          </div>

          <iframe
            title={`Resume preview: ${resumeView.data.fileName}`}
            src={resumeView.data.signedUrl}
            className="h-[min(50vh,480px)] w-full rounded-xl border bg-muted/20"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={dropzoneState === "uploading" || isRemoving}
              onClick={handleReplaceClick}
            >
              <UploadIcon />
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={dropzoneState === "uploading" || isRemoving}
              onClick={() => void handleRemove()}
            >
              <X />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
