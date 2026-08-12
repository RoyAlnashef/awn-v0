"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { MyJobsNav } from "@/components/jobs/my-jobs-nav"
import { Button } from "@/components/ui/button"

export function MyJobsLayoutShell({ children }: { children: ReactNode }) {
  return (
    <PageShell
      title="My Jobs"
      description="Manage the roles you've posted and track jobs you've applied to."
      actions={
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/jobs/new" />}
        >
          <Plus />
          Post a job
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <MyJobsNav />
        {children}
      </div>
    </PageShell>
  )
}
