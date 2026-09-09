"use client"

import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import {
  JobDetailContent,
  useJobDetailHeroRef,
} from "@/components/jobs/job-detail-content"
import type { Job } from "@/lib/jobs-data"
import { Drawer, DrawerContent } from "@/components/ui/drawer"

export function JobPreviewDrawer({
  job,
  open,
  onOpenChange,
}: {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const heroRef = useJobDetailHeroRef()
  const applicantCount = job.applicationCount ?? 0

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent
        initialFocus={heroRef}
        className={FLYOUT_DRAWER_CONTENT_CLASS}
      >
        <FlyoutDrawerClose />
        <JobDetailContent
          job={job}
          applicantCount={applicantCount}
          heroRef={heroRef}
          preview
          className="min-h-0 flex-1"
        />
      </DrawerContent>
    </Drawer>
  )
}
