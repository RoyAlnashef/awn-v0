import type { JobStatus } from "@/lib/jobs-data"
import {
  jobManagementStatusLabel,
  jobManagementStatusStyles,
  jobStatusLabels,
  jobStatusStyles,
} from "@/lib/jobs/format"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function JobStatusBadge({
  status,
  underReviewAt,
  className,
}: {
  status: JobStatus
  underReviewAt?: string | null
  className?: string
}) {
  const label = underReviewAt
    ? jobManagementStatusLabel({ status, underReviewAt })
    : jobStatusLabels[status]
  const styles = underReviewAt
    ? jobManagementStatusStyles({ status, underReviewAt })
    : jobStatusStyles[status]

  return (
    <Badge
      variant="outline"
      className={cn("font-normal", styles, className)}
    >
      {label}
    </Badge>
  )
}
