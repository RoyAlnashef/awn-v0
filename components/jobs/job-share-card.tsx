"use client"

import { useState } from "react"
import { X } from "lucide-react"

import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import { JobMetadataBadges } from "@/components/jobs/job-metadata-badges"
import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import type { JobSharePayload } from "@/lib/messages-data"
import type { EngagementType } from "@/lib/jobs-data"
import {
  urgentAccentTextStyles,
  urgentJobCardBorderStyles,
} from "@/lib/jobs/format"
import { cn } from "@/lib/utils"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentTitle,
} from "@/components/ui/attachment"

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
  const isUrgent = jobShare.kind === "urgent"

  const card = (
    <Attachment
      className={cn(
        variant === "message" ? "max-w-full" : "max-w-sm",
        variant === "message" &&
          cn(
            "cursor-pointer rounded-xl bg-card shadow-sm transition-colors",
            isUrgent
              ? urgentJobCardBorderStyles
              : "border-border hover:border-primary/40",
          ),
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
      <AttachmentContent className="flex flex-col gap-3 px-2.5 py-2">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-start justify-between gap-3">
              <AttachmentTitle className="min-w-0 font-heading text-sm font-semibold tracking-tight text-balance">
                {jobShare.role}
              </AttachmentTitle>
              {isUrgent ? <JobUrgentHelpBadge className="shrink-0" /> : null}
            </div>
            <AttachmentDescription>{jobShare.production}</AttachmentDescription>
          </div>
          <JobMetadataBadges
            job={{
              engagement: jobShare.engagement as EngagementType,
              department: jobShare.department,
              startDate: jobShare.startDate,
              endDate: jobShare.endDate,
              location: jobShare.location,
              postedAt: jobShare.postedAt,
              deadline: "",
              kind: jobShare.kind,
            }}
            includePostedAt={false}
            className="mt-2"
          />
        </div>
        {jobShare.payRate ? (
          <span
            className={cn(
              "font-heading text-sm font-semibold",
              isUrgent ? urgentAccentTextStyles : "text-primary-bright",
            )}
          >
            {jobShare.payRate}
          </span>
        ) : null}
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
