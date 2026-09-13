"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, FileText, MoreHorizontal, Pause, Pencil } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { type Job } from "@/lib/jobs-data"
import { createJob, updateJob } from "@/lib/jobs/fetch"
import { myJobsKey } from "@/lib/jobs/swr-keys"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MyJobActionsDropdown({ job }: { job: Job }) {
  const router = useRouter()
  const [pausing, setPausing] = React.useState(false)
  const [duplicating, setDuplicating] = React.useState(false)

  async function handlePause() {
    if (job.status === "draft") {
      toast.info("This job is already paused")
      return
    }

    setPausing(true)
    try {
      await updateJob(job.id, { status: "draft" })
      toast.success("Job paused — hidden from the board")
      void mutate(myJobsKey)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not pause job")
    } finally {
      setPausing(false)
    }
  }

  async function handleDuplicate() {
    setDuplicating(true)
    try {
      const { job: created } = await createJob({
        kind: job.kind,
        role: job.role,
        production: job.production,
        location: job.location,
        payRate: job.payRate,
        startDate: job.startDate,
        endDate: job.endDate,
        deadline: job.deadline !== job.endDate ? job.deadline : null,
        engagement: job.engagement,
        details: job.details,
        status: "draft",
      })
      toast.success("Draft copy created")
      void mutate(myJobsKey)
      router.push(`/jobs/${created.id}/edit`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not duplicate job",
      )
    } finally {
      setDuplicating(false)
    }
  }

  const pending = pausing || duplicating

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label={`Actions for ${job.role}`}
            disabled={pending}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/jobs/${job.id}`} />}>
          <FileText />
          View job
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/jobs/${job.id}/edit`} />}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        {job.status === "open" ? (
          <DropdownMenuItem
            disabled={pausing}
            onClick={() => void handlePause()}
          >
            <Pause />
            Pause
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          disabled={duplicating}
          onClick={() => void handleDuplicate()}
        >
          <Copy />
          Duplicate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
