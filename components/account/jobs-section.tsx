"use client"

import { Bookmark, Briefcase, Building2, CalendarDays, MapPin, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"

import { PostJobDialog } from "@/components/jobs/post-job-dialog"
import type { Job } from "@/lib/jobs-data"
import { fetchMyJobs, toggleSaveJob } from "@/lib/jobs/fetch"
import { jobStatusStyles } from "@/lib/jobs/format"
import { accountJobsKey } from "@/lib/jobs/swr-keys"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function revalidateAccountJobs() {
  void mutate(accountJobsKey("created"))
  void mutate(accountJobsKey("saved"))
}

function JobCardSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <Briefcase className="size-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function AccountJobCard({
  job,
  variant,
  onEdit,
  onUnsave,
  unsaving,
}: {
  job: Job
  variant: "created" | "saved"
  onEdit?: () => void
  onUnsave?: () => void
  unsaving?: boolean
}) {
  const company = job.production.trim() || job.postedBy.name

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-semibold">{job.role}</span>
          {variant === "created" ? (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${jobStatusStyles[job.status]}`}
            >
              {job.status}
            </span>
          ) : null}
          <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
            {job.department}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="size-3" />
            {company}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {job.location || "—"}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {variant === "saved" && job.savedAt
              ? `Saved ${job.savedAt}`
              : `Posted ${job.postedAt}`}
          </span>
        </div>

        <Badge variant="secondary" className="self-start font-normal">
          {job.engagement}
        </Badge>
      </div>

      <div className="flex shrink-0 gap-1.5">
        {variant === "created" && onEdit ? (
          <Button size="xs" variant="outline" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        {variant === "saved" && onUnsave ? (
          <Button
            size="xs"
            variant="ghost"
            className="text-muted-foreground"
            disabled={unsaving}
            onClick={onUnsave}
          >
            <Bookmark className="size-3.5" />
            Unsave
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function JobsSection() {
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [unsavingId, setUnsavingId] = useState<string | null>(null)

  const { data: createdData, isLoading: createdLoading } = useSWR(
    accountJobsKey("created"),
    () => fetchMyJobs("created"),
  )
  const { data: savedData, isLoading: savedLoading } = useSWR(
    accountJobsKey("saved"),
    () => fetchMyJobs("saved"),
  )

  const createdJobs = createdData?.jobs ?? []
  const savedJobs = savedData?.jobs ?? []

  function openEdit(job: Job) {
    setEditJob(job)
    setEditOpen(true)
  }

  async function handleUnsave(jobId: string) {
    setUnsavingId(jobId)
    try {
      const result = await toggleSaveJob(jobId)
      if (!result.saved) {
        revalidateAccountJobs()
        toast.success("Job removed from saved")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not unsave job")
    } finally {
      setUnsavingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold">Jobs</h3>
          <p className="text-sm text-muted-foreground">
            Jobs you've posted and positions you've saved.
          </p>
        </div>
        <PostJobDialog
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="size-3.5" />
              Post a job
            </Button>
          }
        />
      </div>

      {editJob ? (
        <PostJobDialog
          job={editJob}
          open={editOpen}
          onOpenChange={(next) => {
            setEditOpen(next)
            if (!next) setEditJob(null)
          }}
        />
      ) : null}

      <Tabs defaultValue="created">
        <TabsList>
          <TabsTrigger value="created" className="gap-1.5">
            <Briefcase className="size-3.5" />
            Created
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
              {createdLoading ? "…" : createdJobs.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-1.5">
            <Bookmark className="size-3.5" />
            Saved
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
              {savedLoading ? "…" : savedJobs.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="mt-4 flex flex-col gap-3">
          {createdLoading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : createdJobs.length === 0 ? (
            <EmptyState message="You haven't posted any jobs yet." />
          ) : (
            createdJobs.map((job) => (
              <AccountJobCard
                key={job.id}
                job={job}
                variant="created"
                onEdit={() => openEdit(job)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-4 flex flex-col gap-3">
          {savedLoading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : savedJobs.length === 0 ? (
            <EmptyState message="You haven't saved any jobs yet." />
          ) : (
            savedJobs.map((job) => (
              <AccountJobCard
                key={job.id}
                job={job}
                variant="saved"
                unsaving={unsavingId === job.id}
                onUnsave={() => void handleUnsave(job.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
