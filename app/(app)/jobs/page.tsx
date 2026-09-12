import Link from "next/link"
import { Plus } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { JobsBoard } from "@/components/jobs/jobs-board"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { mainNav } from "@/lib/nav"

const item = mainNav.find((i) => i.href === "/jobs")!

export default async function JobsPage() {
  const sessionUser = await getSessionUser()
  const canPostJobs = sessionUser?.canPostJobs ?? false

  return (
    <PageShell
      title="Search for jobs"
      description={item.description}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/my-jobs" />}
          >
            My Jobs
          </Button>
          {canPostJobs ? (
            <Button size="sm" nativeButton={false} render={<Link href="/jobs/new" />}>
              <Plus />
              Post a Job
            </Button>
          ) : null}
        </div>
      }
    >
      <JobsBoard />
    </PageShell>
  )
}
