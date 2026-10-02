"use client"

import useSWR from "swr"

import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import {
  JobDetailContent,
  useJobDetailHeroRef,
} from "@/components/jobs/job-detail-content"
import { fetchJob } from "@/lib/jobs/fetch"
import { jobDetailKey } from "@/lib/jobs/swr-keys"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"

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

export function JobDetailDrawer({
  jobId,
  open,
  onOpenChange,
  onApplied,
}: {
  jobId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplied?: () => void
}) {
  const heroRef = useJobDetailHeroRef()
  const swrKey = open && jobId ? jobDetailKey(jobId) : null
  const { data, error, isLoading } = useSWR(swrKey, () => fetchJob(jobId!))

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent
        initialFocus={heroRef}
        className={FLYOUT_DRAWER_CONTENT_CLASS}
      >
        <FlyoutDrawerClose />
        {isLoading ? (
          <>
            <DrawerTitle className="sr-only">Loading job details</DrawerTitle>
            <div
              ref={heroRef}
              tabIndex={-1}
              className="shrink-0 px-6 pt-5 outline-none"
            >
              <div className="flex flex-col gap-1.5 pr-8">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
            <JobDetailSkeleton />
          </>
        ) : error ? (
          <>
            <DrawerTitle className="sr-only">Job not found</DrawerTitle>
            <div
              ref={heroRef}
              tabIndex={-1}
              className="flex flex-col gap-4 p-6 outline-none"
            >
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
            viewerIsPoster={data.viewerIsPoster}
            hasOpenReport={data.hasOpenReport}
            heroRef={heroRef}
            className="min-h-0 flex-1"
            onApplied={onApplied}
            onHidden={() => onOpenChange(false)}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
