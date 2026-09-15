"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { MyJobsNav } from "@/components/jobs/my-jobs-nav"
import { Button } from "@/components/ui/button"

export function MyJobsLayoutShell({
  children,
  canPostJobs,
}: {
  children: ReactNode
  canPostJobs: boolean
}) {
  return (
    <PageShell
      title="My jobs"
      description="Save jobs, track your applications, and manage roles you've posted."
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/jobs" />}
          >
            Browse Jobs
          </Button>
          {canPostJobs ? (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/jobs/new" />}
            >
              <Plus />
              Post a Job
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <MyJobsNav canPostJobs={canPostJobs} />
        {children}
      </div>
    </PageShell>
  )
}
