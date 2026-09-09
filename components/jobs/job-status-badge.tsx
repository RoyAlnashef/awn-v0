import type { JobStatus } from "@/lib/jobs-data"
import { jobStatusStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"

export function JobStatusBadge({
  status,
  className,
}: {
  status: JobStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide capitalize",
        jobStatusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
