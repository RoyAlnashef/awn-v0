import { CalendarClock, Clock, MapPin, Users } from "lucide-react"

import { formatDateRange, type Job } from "@/lib/jobs-data"
import { formatJobDeadline } from "@/lib/jobs/format"
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
    | "deadline"
    | "kind"
  >
  includePostedAt?: boolean
  includeDeadline?: boolean
  applicantCount?: number | null
  showPlaceholders?: boolean
  className?: string
}

export function JobMetadataBadges({
  job,
  includePostedAt = true,
  includeDeadline = false,
  applicantCount,
  showPlaceholders = false,
  className,
}: JobMetadataBadgesProps) {
  const hasDates = Boolean(job.startDate && job.endDate)
  const hasDeadline = Boolean(job.deadline)
  const showApplicants = applicantCount !== null && applicantCount !== undefined

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {hasDates ? (
        <Badge variant="secondary" className="gap-1 font-normal">
          <CalendarClock className="size-3" />
          {formatDateRange(job.startDate, job.endDate)}
        </Badge>
      ) : showPlaceholders ? (
        <Badge variant="secondary" className="gap-1 font-normal">
          <CalendarClock className="size-3" />
          Dates TBD
        </Badge>
      ) : null}
      <Badge variant="secondary" className="gap-1 font-normal">
        <MapPin className="size-3" />
        <span className="text-pretty">
          {job.location ||
            (showPlaceholders ? "Location / routing" : job.location)}
        </span>
      </Badge>
      <Badge variant="secondary">{job.engagement}</Badge>
      <Badge variant="secondary">{job.department}</Badge>
      {includeDeadline ? (
        hasDeadline ? (
          <Badge variant="secondary" className="font-normal">
            Apply by {formatJobDeadline(job.deadline!)}
          </Badge>
        ) : showPlaceholders ? (
          <Badge variant="secondary" className="font-normal">
            Deadline TBD
          </Badge>
        ) : null
      ) : null}
      {includePostedAt ? (
        <Badge variant="secondary" className="gap-1 font-normal">
          <Clock className="size-3" />
          {job.postedAt}
        </Badge>
      ) : null}
      {showApplicants ? (
        <Badge variant="secondary" className="gap-1 font-normal">
          <Users className="size-3" />
          {applicantCount} applicant{applicantCount === 1 ? "" : "s"}
        </Badge>
      ) : null}
    </div>
  )
}
