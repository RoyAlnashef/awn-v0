import type { JobStatus } from "@/lib/jobs-data"
import { jobStatusLabels, jobStatusStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function JobStatusBadge({
  status,
  className,
}: {
  status: JobStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", jobStatusStyles[status], className)}
    >
      {jobStatusLabels[status]}
    </Badge>
  )
}
