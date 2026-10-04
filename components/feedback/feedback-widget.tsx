"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { Capacitor } from "@capacitor/core"
import { CircleCheckIcon, MessageSquarePlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { mutateFeedbackNewCount } from "@/lib/feedback/hooks/use-feedback-new-count"
import { submitFeedback } from "@/lib/feedback/actions"
import { compressImage } from "@/lib/feedback/compress-image"
import {
  FEEDBACK_ACCEPTED_IMAGE_TYPES,
  FEEDBACK_GENERAL_AREA,
  FEEDBACK_LIMITS,
  FEEDBACK_TYPE_CONFIG,
  type FeedbackContext,
} from "@/lib/feedback/types"
import { adminNav, isNavRouteActive, mainNav } from "@/lib/nav"
import { cn } from "@/lib/utils"

import {
  FeedbackForm,
  type FeedbackDraft,
  type FeedbackFieldErrors,
} from "./feedback-form"

const ACCOUNT_AREA = "Account"

function emptyDraft(area: string): FeedbackDraft {
  return {
    type: null,
    impact: null,
    area,
    summary: "",
    details: "",
    allowContact: true,
    attachments: [],
  }
}

function areaForPath(pathname: string, includeAdmin: boolean): string {
  if (pathname.startsWith("/account")) return ACCOUNT_AREA
  if (pathname.startsWith("/my-jobs")) return "Jobs"
  const navs = includeAdmin ? [...mainNav, ...adminNav] : mainNav
  return (
    navs.find((item) => isNavRouteActive(pathname, item.href))?.title ??
    FEEDBACK_GENERAL_AREA
  )
}

function captureContext(): FeedbackContext {
  const platform = Capacitor.getPlatform()
  return {
    url: window.location.href,
    pageTitle: document.title,
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    platform: platform === "ios" || platform === "android" ? platform : "web",
  }
}

function validate(draft: FeedbackDraft): FeedbackFieldErrors {
  const errors: FeedbackFieldErrors = {}
  if (!draft.type) errors.type = "Choose what kind of feedback this is."
  if (!draft.summary.trim()) errors.summary = "Add a short summary."
  else if (draft.summary.length > FEEDBACK_LIMITS.summaryMax)
    errors.summary = `Keep it under ${FEEDBACK_LIMITS.summaryMax} characters.`
  if (draft.details.trim().length < FEEDBACK_LIMITS.detailsMin)
    errors.details = "Add a few more details so we can follow up."
  return errors
}

function isDraftDirty(draft: FeedbackDraft) {
  return (
    !!draft.type ||
    !!draft.summary.trim() ||
    !!draft.details.trim() ||
    draft.attachments.length > 0
  )
}

export function FeedbackWidget({
  email,
  firstName,
  isAdmin,
}: {
  email: string
  firstName: string
  isAdmin: boolean
}) {
  const pathname = usePathname()
  const currentArea = areaForPath(pathname, isAdmin)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<FeedbackDraft>(() => emptyDraft(currentArea))
  const [errors, setErrors] = useState<FeedbackFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [processingCount, setProcessingCount] = useState(0)
  const [submitted, setSubmitted] = useState<{ reference: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [exitUiActive, setExitUiActive] = useState(false)
  const previewUrls = useRef(new Set<string>())
  const fabShowsOpen = open || exitUiActive

  const areaOptions = useMemo(() => {
    const options = [
      ...mainNav.map((item) => item.title),
      ACCOUNT_AREA,
      ...(isAdmin ? adminNav.map((item) => item.title) : []),
      FEEDBACK_GENERAL_AREA,
    ]
    return Array.from(new Set(options))
  }, [isAdmin])

  const dirty = isDraftDirty(draft)

  useEffect(() => {
    const urls = previewUrls.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function handleOpenChange(next: boolean) {
    if (next && !submitted && !isDraftDirty(draft)) {
      setDraft((current) => ({ ...current, area: currentArea }))
    }
    if (!next && submitted) resetForm()
    setExitUiActive(!next)
    setOpen(next)
  }

  function handleOpenChangeComplete(nextOpen: boolean) {
    if (!nextOpen) {
      setExitUiActive(false)
    }
  }

  function updateDraft(patch: Partial<FeedbackDraft>) {
    setDraft((current) => {
      const next = { ...current, ...patch }
      if (patch.type && !FEEDBACK_TYPE_CONFIG[patch.type].asksImpact) {
        next.impact = null
      }
      return next
    })
    setErrors((current) => {
      const keys = Object.keys(patch) as (keyof FeedbackFieldErrors)[]
      if (!keys.some((key) => current[key])) return current
      const next = { ...current }
      keys.forEach((key) => delete next[key])
      return next
    })
  }

  async function handleAddFiles(files: File[]) {
    const accepted: readonly string[] = FEEDBACK_ACCEPTED_IMAGE_TYPES
    const images = files.filter((file) => accepted.includes(file.type))
    const slots = FEEDBACK_LIMITS.maxAttachments - draft.attachments.length

    let error: string | undefined
    if (images.length < files.length) error = "Only image files can be attached."
    const tooBig = images.filter((file) => file.size > FEEDBACK_LIMITS.maxFileBytes)
    if (tooBig.length) error = "Each image must be under 10 MB."
    const usable = images
      .filter((file) => file.size <= FEEDBACK_LIMITS.maxFileBytes)
      .slice(0, Math.max(0, slots))
    if (images.length - tooBig.length > slots) {
      error = `You can attach up to ${FEEDBACK_LIMITS.maxAttachments} images.`
    }
    setErrors((current) => ({ ...current, attachments: error }))
    if (!usable.length) return

    setProcessingCount((count) => count + usable.length)
    const compressed = await Promise.all(usable.map(compressImage))
    setProcessingCount((count) => count - usable.length)

    const additions = compressed.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      previewUrls.current.add(previewUrl)
      return { id: crypto.randomUUID(), file, previewUrl }
    })
    setDraft((current) => ({
      ...current,
      attachments: [...current.attachments, ...additions].slice(
        0,
        FEEDBACK_LIMITS.maxAttachments,
      ),
    }))
  }

  function handleRemoveAttachment(id: string) {
    setDraft((current) => {
      const removed = current.attachments.find((item) => item.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl)
        previewUrls.current.delete(removed.previewUrl)
      }
      return {
        ...current,
        attachments: current.attachments.filter((item) => item.id !== id),
      }
    })
    setErrors((current) => ({ ...current, attachments: undefined }))
  }

  function resetForm() {
    draft.attachments.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl)
      previewUrls.current.delete(item.previewUrl)
    })
    setDraft(emptyDraft(currentArea))
    setErrors({})
    setFormError(null)
    setSubmitted(null)
  }

  function handleSubmit() {
    if (isPending || processingCount > 0) return
    const nextErrors = validate(draft)
    const totalBytes = draft.attachments.reduce(
      (sum, item) => sum + item.file.size,
      0,
    )
    if (totalBytes > FEEDBACK_LIMITS.maxTotalUploadBytes) {
      nextErrors.attachments = "Attachments are too large. Try removing one."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !draft.type) {
      setFormError(null)
      return
    }

    const formData = new FormData()
    formData.set("type", draft.type)
    if (draft.impact) formData.set("impact", draft.impact)
    formData.set("area", draft.area)
    formData.set("summary", draft.summary)
    formData.set("details", draft.details)
    formData.set("allowContact", String(draft.allowContact))
    formData.set("context", JSON.stringify(captureContext()))
    draft.attachments.forEach((item) => formData.append("attachments", item.file))

    setFormError(null)
    startTransition(async () => {
      const result = await submitFeedback(formData)
      if (result.ok) {
        setSubmitted({ reference: result.reference })
        void mutateFeedbackNewCount()
        return
      }
      setFormError(result.error)
      if (result.fieldErrors) setErrors(result.fieldErrors as FeedbackFieldErrors)
    })
  }

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={fabShowsOpen ? "Close feedback" : "Share feedback"}
            className={cn(
              "fixed right-4 bottom-[calc(var(--safe-area-inset-bottom,0px)+1rem)] z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-foreground/10 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:right-6 md:bottom-6",
              !fabShowsOpen &&
                "transition-transform hover:scale-105 active:scale-95",
            )}
          />
        }
      >
        {fabShowsOpen ? (
          <XIcon className="size-5" aria-hidden />
        ) : (
          <MessageSquarePlusIcon className="size-5" aria-hidden />
        )}
        {!fabShowsOpen && dirty && !submitted ? (
          <span
            className="absolute top-0.5 right-0.5 size-3 rounded-full bg-success ring-2 ring-background"
            aria-hidden
          />
        ) : null}
        {!fabShowsOpen && dirty && !submitted ? (
          <span className="sr-only">(draft saved)</span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-[min(28rem,calc(100vw-2rem))] max-h-[min(44rem,calc(var(--available-height)-0.5rem))] gap-0 overflow-hidden rounded-3xl p-0"
      >
        {submitted ? (
          <FeedbackSuccess
            firstName={firstName}
            reference={submitted.reference}
            allowContact={draft.allowContact}
            email={email}
            onSendAnother={resetForm}
            onClose={() => handleOpenChange(false)}
          />
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              handleSubmit()
            }}
          >
            <header className="flex items-start justify-between gap-4 border-b px-5 pt-5 pb-4">
              <div className="flex flex-col gap-1">
                <PopoverTitle className="text-base font-medium">
                  Share feedback
                </PopoverTitle>
                <PopoverDescription className="text-sm leading-relaxed text-pretty">
                  Your feedback helps us shape AWN. Thanks for your help!
                </PopoverDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="-mt-1 -mr-2"
                onClick={() => handleOpenChange(false)}
              >
                <XIcon aria-hidden />
                <span className="sr-only">Close</span>
              </Button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <FeedbackForm
                draft={draft}
                onChange={updateDraft}
                areaOptions={areaOptions}
                errors={errors}
                processingImages={processingCount > 0}
                submitting={isPending}
                onAddFiles={handleAddFiles}
                onRemoveAttachment={handleRemoveAttachment}
                onSubmitShortcut={handleSubmit}
                email={email}
              />
            </div>

            <footer className="flex flex-col gap-3 border-t bg-popover px-5 py-4">
              {formError ? (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                {dirty ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2 text-muted-foreground"
                    onClick={resetForm}
                    disabled={isPending}
                  >
                    Clear
                  </Button>
                ) : (
                  <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                    <Kbd>⌘</Kbd>
                    <Kbd>Enter</Kbd>
                    <span className="ml-1">to send</span>
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={isPending || processingCount > 0}
                  className="ml-auto"
                >
                  {isPending ? <Spinner className="size-4" /> : null}
                  {isPending ? "Sending…" : "Send feedback"}
                </Button>
              </div>
            </footer>
          </form>
        )}
      </PopoverContent>
    </Popover>
  )
}

function FeedbackSuccess({
  firstName,
  reference,
  allowContact,
  email,
  onSendAnother,
  onClose,
}: {
  firstName: string
  reference: string
  allowContact: boolean
  email: string
  onSendAnother: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-10 text-center" role="status">
      <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
        <CircleCheckIcon className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <PopoverTitle className="text-lg font-medium text-balance">
          Thanks, {firstName}. We got it.
        </PopoverTitle>
        <PopoverDescription className="text-sm leading-relaxed text-pretty">
          {"Every submission is read by the team. "}
          {allowContact
            ? `If we need more detail, we'll reach out at ${email}.`
            : "You won't be contacted about this one."}
        </PopoverDescription>
      </div>
      <p className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
        Reference {reference}
      </p>
      <div className="flex w-full gap-2">
        <Button variant="outline" className="flex-1" onClick={onSendAnother}>
          Send more
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}
