import { Badge } from "@/components/ui/badge"
import {
  FEEDBACK_IMPACT_CONFIG,
  FEEDBACK_STATUS_CONFIG,
  FEEDBACK_TYPE_CONFIG,
  type FeedbackImpact,
  type FeedbackStatus,
  type FeedbackType,
} from "@/lib/feedback/types"
import { cn } from "@/lib/utils"

import { FEEDBACK_TYPE_ICONS } from "./feedback-type-picker"

const STATUS_DOT: Record<FeedbackStatus, string> = {
  new: "bg-foreground",
  triaged: "bg-chart-1",
  planned: "bg-chart-3",
  resolved: "bg-success",
  wont_fix: "bg-muted-foreground/50",
}

export function FeedbackStatusDot({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[status])}
      aria-hidden
    />
  )
}

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <FeedbackStatusDot status={status} />
      {FEEDBACK_STATUS_CONFIG[status].label}
    </Badge>
  )
}

export function FeedbackTypeBadge({ type }: { type: FeedbackType }) {
  const Icon = FEEDBACK_TYPE_ICONS[type]
  return (
    <Badge variant="secondary" className="gap-1.5 font-normal">
      <Icon className="size-3" aria-hidden />
      {FEEDBACK_TYPE_CONFIG[type].label}
    </Badge>
  )
}

export function FeedbackImpactLabel({
  impact,
}: {
  impact: FeedbackImpact | null
}) {
  if (!impact) return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        "text-sm whitespace-nowrap",
        impact === "blocking"
          ? "font-medium text-destructive"
          : "text-muted-foreground",
      )}
    >
      {FEEDBACK_IMPACT_CONFIG[impact].label}
    </span>
  )
}
