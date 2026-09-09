"use client"

import { type ReactElement } from "react"

import { ShareToRoomsFlyout } from "@/components/rooms/share-to-rooms-flyout"
import { jobToSharePayload } from "@/lib/messages/job-share"
import type { Job } from "@/lib/jobs-data"

export function JobShareToRoomsButton({
  job,
  children,
}: {
  job: Job
  children: ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>
}) {
  return (
    <ShareToRoomsFlyout
      shareJob={job.id}
      shareLabel={jobToSharePayload(job).role}
    >
      {children}
    </ShareToRoomsFlyout>
  )
}
