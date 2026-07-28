"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { mutate } from "swr"
import { format } from "date-fns"
import {
  Bookmark,
  CalendarClock,
  Flag,
  MapPin,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import {
  formatDateRange,
  parseDateOnly,
  type Job,
} from "@/lib/jobs-data"
import { fetchJob, toggleSaveJob } from "@/lib/jobs/fetch"
import { jobDetailKey, jobsListKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

function formatDeadline(deadline: string) {
  return format(parseDateOnly(deadline), "MMM d, yyyy")
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function revalidateJobs() {
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

function JobDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

function JobDetailContent({
  job,
  applicantCount,
  posterId,
  onClose,
  heroRef,
}: {
  job: Job
  applicantCount: number
  posterId: string
  onClose: () => void
  heroRef: React.RefObject<HTMLDivElement | null>
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(job.saved)
  const [applied, setApplied] = useState(job.applied)
  const [applyOpen, setApplyOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const previous = saved
    setSaved(!saved)
    setSaving(true)
    try {
      const result = await toggleSaveJob(job.id)
      setSaved(result.saved)
      void revalidateJobs()
      void mutate(jobDetailKey(job.id))
    } catch (error) {
      setSaved(previous)
      toast.error(error instanceof Error ? error.message : "Could not save job")
    } finally {
      setSaving(false)
    }
  }

  function handleMessagePoster() {
    onClose()
    router.push(`/messages?person=${posterId}`)
  }

  return (
    <>
      <SheetTitle className="sr-only">{job.role} job details</SheetTitle>
      <SheetDescription className="sr-only">
        {job.production} · {job.location}
      </SheetDescription>

      {/* Hero */}
      <div ref={heroRef} tabIndex={-1} className="relative shrink-0 outline-none">
        <div className="h-24 bg-muted" />
        <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-1.5">
          <Badge variant="secondary">{job.engagement}</Badge>
          <Badge variant="outline">{job.department}</Badge>
          {job.kind === "urgent" ? (
            <Badge variant="destructive">Urgent</Badge>
          ) : null}
        </div>

        <div className="px-6 pb-4">
          <span className="text-xs text-muted-foreground">{job.postedAt}</span>
          <div className="mt-2 flex flex-col gap-1.5">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-balance">
              {job.role}
            </h2>
            <p className="text-sm font-medium text-foreground/90">
              {job.production}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="text-pretty">{job.location}</span>
            </p>
            <p className="font-heading text-lg font-semibold text-primary">
              {job.payRate}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-6 py-5">
          {/* Meta chips */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="gap-1 font-normal">
              <CalendarClock className="size-3" />
              {formatDateRange(job.startDate, job.endDate)}
            </Badge>
            <Badge variant="outline" className="font-normal">
              Apply by {formatDeadline(job.deadline)}
            </Badge>
            <Badge variant="outline" className="gap-1 font-normal">
              <Users className="size-3" />
              {applicantCount} applicant{applicantCount === 1 ? "" : "s"}
            </Badge>
          </div>

          {/* Description */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Details</SectionLabel>
            <p className="text-sm leading-relaxed text-foreground/90 text-pretty">
              {job.details}
            </p>
          </section>

          {/* Poster */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Posted by</SectionLabel>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <Avatar className="size-10">
                <AvatarImage src={job.postedBy.avatar} alt="" />
                <AvatarFallback className="text-sm">
                  {initials(job.postedBy.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {job.postedBy.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {job.postedBy.role}
                </span>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="flex shrink-0 flex-col gap-2 border-t p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={saved ? "Remove saved job" : "Save job"}
            aria-pressed={saved}
            disabled={saving}
            onClick={() => void handleSave()}
          >
            <Bookmark
              className={cn("size-4", saved && "fill-current text-primary")}
            />
          </Button>
          <Button
            className="flex-1"
            disabled={applied}
            onClick={() => setApplyOpen(true)}
          >
            {applied ? "Applied" : "Apply"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={handleMessagePoster}
          >
            <MessageSquare />
            Message poster
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Share2 />
            Share
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mx-auto text-xs text-muted-foreground"
        >
          <Flag className="size-3" />
          Report job
        </Button>
      </div>

      <ApplyJobDialog
        job={job}
        open={applyOpen}
        onOpenChange={setApplyOpen}
        onApplied={() => {
          setApplied(true)
          void revalidateJobs()
          void mutate(jobDetailKey(job.id))
        }}
      />
    </>
  )
}

export function JobDetailDrawer({
  jobId,
  open,
  onOpenChange,
}: {
  jobId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const heroRef = useRef<HTMLDivElement>(null)
  const swrKey = open && jobId ? jobDetailKey(jobId) : null
  const { data, error, isLoading } = useSWR(swrKey, () => fetchJob(jobId!))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        initialFocus={heroRef}
        className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
      >
        {isLoading ? (
          <>
            <SheetTitle className="sr-only">Loading job details</SheetTitle>
            <div ref={heroRef} tabIndex={-1} className="relative shrink-0 outline-none">
              <div className="h-24 bg-muted" />
              <div className="space-y-2 px-6 pb-4 pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
            <JobDetailSkeleton />
          </>
        ) : error ? (
          <>
            <SheetTitle className="sr-only">Job not found</SheetTitle>
            <div ref={heroRef} tabIndex={-1} className="flex flex-col gap-4 p-6 outline-none">
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Could not load job"}
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        ) : data ? (
          <JobDetailContent
            job={data.job}
            applicantCount={data.applicantCount}
            posterId={data.posterId}
            onClose={() => onOpenChange(false)}
            heroRef={heroRef}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
