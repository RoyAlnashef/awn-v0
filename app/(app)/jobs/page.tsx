import Link from "next/link"
import { ListTodo, Plus } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { JobsBoard } from "@/components/jobs/jobs-board"
import { Button } from "@/components/ui/button"
import { mainNav } from "@/lib/nav"

const item = mainNav.find((i) => i.href === "/jobs")!

export default function JobsPage() {
  return (
    <PageShell
      title={item.title}
      description={item.description}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/my-jobs" />}
          >
            <ListTodo />
            My Jobs
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/jobs/new" />}>
            <Plus />
            Post a job
          </Button>
        </div>
      }
    >
      <JobsBoard />
    </PageShell>
  )
}
