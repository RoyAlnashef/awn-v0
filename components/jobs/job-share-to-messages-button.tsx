"use client"

import { type ReactElement } from "react"

import { ShareToMessagesFlyout } from "@/components/messages/share-to-messages-flyout"
import { jobToSharePayload } from "@/lib/messages/job-share"
import type { Job } from "@/lib/jobs-data"

export function JobShareToMessagesButton({
  job,
  children,
}: {
  job: Job
  children: ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>
}) {
  return (
    <ShareToMessagesFlyout
      shareJob={job.id}
      shareLabel={jobToSharePayload(job).role}
    >
      {children}
    </ShareToMessagesFlyout>
  )
}
