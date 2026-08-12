"use client"

import { useState } from "react"
import { CalendarClock, MapPin, X } from "lucide-react"

import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import { formatDateRange } from "@/lib/jobs-data"
import type { JobSharePayload } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Badge } from "@/components/ui/badge"

export function JobShareCard({
  jobShare,
  variant = "message",
  className,
  onRemove,
}: {
  jobShare: JobSharePayload
  variant?: "preview" | "message"
  className?: string
  onRemove?: () => void
}) {
  const [detailOpen, setDetailOpen] = useState(false)
  const isPreview = variant === "preview"

  const card = (
    <Attachment
      className={cn(
        "max-w-sm",
        variant === "message" &&
          "cursor-pointer rounded-xl border-border bg-card shadow-sm hover:border-primary/40",
        className,
      )}
      size={isPreview ? "sm" : "default"}
      onClick={variant === "message" ? () => setDetailOpen(true) : undefined}
      onKeyDown={
        variant === "message"
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setDetailOpen(true)
              }
            }
          : undefined
      }
      role={variant === "message" ? "button" : undefined}
      tabIndex={variant === "message" ? 0 : undefined}
    >
      <AttachmentContent>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {jobShare.engagement}
          </Badge>
        </div>
        <AttachmentTitle className="font-heading text-sm">
          {jobShare.role}
        </AttachmentTitle>
        <AttachmentDescription>{jobShare.production}</AttachmentDescription>
        <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
          {jobShare.location ? (
            <span className="flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{jobShare.location}</span>
            </span>
          ) : null}
          {jobShare.startDate && jobShare.endDate ? (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3 shrink-0" />
              {formatDateRange(jobShare.startDate, jobShare.endDate)}
            </span>
          ) : null}
          {jobShare.payRate ? (
            <span className="font-heading text-primary-bright">{jobShare.payRate}</span>
          ) : null}
        </div>
      </AttachmentContent>
      {isPreview && onRemove ? (
        <AttachmentActions>
          <AttachmentAction
            aria-label="Remove job attachment"
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
          >
            <X className="size-3.5" />
          </AttachmentAction>
        </AttachmentActions>
      ) : null}
    </Attachment>
  )

  return (
    <>
      {card}
      {variant === "message" ? (
        <JobDetailDrawer
          jobId={jobShare.id}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      ) : null}
    </>
  )
}
