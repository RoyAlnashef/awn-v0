import { CalendarClock, Clock, MapPin } from "lucide-react"

import { formatDateRange, type Job } from "@/lib/jobs-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type JobMetadataBadgesProps = {
  job: Pick<
    Job,
    | "engagement"
    | "department"
    | "startDate"
    | "endDate"
    | "location"
    | "postedAt"
  >
  includePostedAt?: boolean
  className?: string
}

export function JobMetadataBadges({
  job,
  includePostedAt = true,
  className,
}: JobMetadataBadgesProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge variant="secondary" className="gap-1 font-normal">
        <CalendarClock className="size-3" />
        {formatDateRange(job.startDate, job.endDate)}
      </Badge>
      <Badge variant="secondary" className="gap-1 font-normal">
        <MapPin className="size-3" />
        <span className="text-pretty">{job.location}</span>
      </Badge>
      <Badge variant="secondary">{job.engagement}</Badge>
      <Badge variant="secondary">{job.department}</Badge>
      {includePostedAt ? (
        <Badge variant="secondary" className="gap-1 font-normal">
          <Clock className="size-3" />
          {job.postedAt}
        </Badge>
      ) : null}
    </div>
  )
}
