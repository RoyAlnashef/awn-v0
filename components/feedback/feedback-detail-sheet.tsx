"use client"

import { useState, useTransition } from "react"
import { ExternalLinkIcon, MailIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { updateFeedback } from "@/lib/feedback/actions"
import {
  FEEDBACK_LIMITS,
  FEEDBACK_STATUS_CONFIG,
  FEEDBACK_STATUSES,
  type Feedback,
  type FeedbackStatus,
} from "@/lib/feedback/types"
import { formatRelativeTime } from "@/lib/messages/format"

import {
  FeedbackImpactLabel,
  FeedbackStatusDot,
  FeedbackTypeBadge,
} from "./feedback-badges"

export function FeedbackDetailSheet({
  item,
  open,
  onOpenChange,
  onUpdated,
}: {
  item: Feedback | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (item: Feedback) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        {item ? (
          <FeedbackDetail key={item.id} item={item} onUpdated={onUpdated} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function FeedbackDetail({
  item,
  onUpdated,
}: {
  item: Feedback
  onUpdated: (item: Feedback) => void
}) {
  const [note, setNote] = useState(item.adminNote)
  const [error, setError] = useState<string | null>(null)
  const [isSavingStatus, startStatus] = useTransition()
  const [isSavingNote, startNote] = useTransition()
  const noteDirty = note.trim() !== item.adminNote

  function handleStatusChange(status: FeedbackStatus) {
    setError(null)
    startStatus(async () => {
      const result = await updateFeedback(item.id, { status })
      if (result.ok) onUpdated(result.item)
      else setError(result.error)
    })
  }

  function handleSaveNote() {
    setError(null)
    startNote(async () => {
      const result = await updateFeedback(item.id, { adminNote: note })
      if (result.ok) onUpdated(result.item)
      else setError(result.error)
    })
  }

  const mailto = `mailto:${item.submitter.email}?subject=${encodeURIComponent(
    `Re: your feedback ${item.reference} — ${item.summary}`,
  )}`

  return (
    <>
      <SheetHeader className="gap-3 border-b p-5">
        <div className="flex flex-wrap items-center gap-2 pr-8">
          <FeedbackTypeBadge type={item.type} />
          <span className="font-mono text-xs text-muted-foreground">
            {item.reference}
          </span>
        </div>
        <SheetTitle className="text-lg leading-snug text-pretty">
          {item.summary}
        </SheetTitle>
        <SheetDescription>
          {item.area} · {formatRelativeTime(item.createdAt)} ago
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-6 p-5">
        <section className="flex items-center justify-between gap-3 rounded-xl border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9">
              {item.submitter.avatarUrl ? (
                <AvatarImage src={item.submitter.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback>{item.submitter.initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {item.submitter.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {item.allowContact
                  ? item.submitter.email
                  : "Prefers not to be contacted"}
              </span>
            </div>
          </div>
          {item.allowContact ? (
            <Button
              variant="outline"
              size="sm"
              render={<a href={mailto} />}
              nativeButton={false}
            >
              <MailIcon aria-hidden />
              Reply
            </Button>
          ) : null}
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-status">Status</Label>
            <Select
              value={item.status}
              onValueChange={(value) =>
                value && handleStatusChange(value as FeedbackStatus)
              }
              disabled={isSavingStatus}
            >
              <SelectTrigger id="feedback-status" className="w-full">
                <SelectValue>
                  {(value: FeedbackStatus) => (
                    <span className="flex items-center gap-2">
                      {isSavingStatus ? (
                        <Spinner className="size-3" />
                      ) : (
                        <FeedbackStatusDot status={value} />
                      )}
                      {FEEDBACK_STATUS_CONFIG[value].label}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className="flex items-center gap-2">
                      <FeedbackStatusDot status={status} />
                      {FEEDBACK_STATUS_CONFIG[status].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Impact</span>
            <div className="flex h-9 items-center">
              <FeedbackImpactLabel impact={item.impact} />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Details</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-pretty">
            {item.details}
          </p>
        </section>

        {item.attachments.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">
              Attachments
              <span className="ml-1 font-normal text-muted-foreground">
                ({item.attachments.length})
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {item.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block overflow-hidden rounded-lg border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <img
                    src={attachment.url || "/placeholder.svg"}
                    alt={attachment.name}
                    className="aspect-video w-full object-cover transition-opacity group-hover:opacity-80"
                  />
                  <span className="sr-only">Open {attachment.name} in a new tab</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Context</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border bg-muted/30 p-3 text-xs">
            <dt className="text-muted-foreground">Page</dt>
            <dd className="min-w-0">
              <a
                href={item.context.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1 break-all underline-offset-2 hover:underline"
              >
                {item.context.url}
                <ExternalLinkIcon className="size-3 shrink-0" aria-hidden />
              </a>
            </dd>
            <dt className="text-muted-foreground">Platform</dt>
            <dd className="capitalize">{item.context.platform}</dd>
            <dt className="text-muted-foreground">Viewport</dt>
            <dd className="tabular-nums">{item.context.viewport}</dd>
            <dt className="text-muted-foreground">Browser</dt>
            <dd className="break-all text-muted-foreground">
              {item.context.userAgent}
            </dd>
          </dl>
        </section>

        <section className="flex flex-col gap-2">
          <Label htmlFor="feedback-note">Internal note</Label>
          <Textarea
            id="feedback-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={FEEDBACK_LIMITS.noteMax}
            placeholder="Repro notes, linked ticket, decision… only admins see this."
            rows={3}
          />
          <div className="flex items-center justify-end gap-2">
            {noteDirty ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNote(item.adminNote)}
                disabled={isSavingNote}
              >
                Discard
              </Button>
            ) : null}
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={!noteDirty || isSavingNote}
            >
              {isSavingNote ? <Spinner className="size-3" /> : null}
              Save note
            </Button>
          </div>
        </section>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </>
  )
}
