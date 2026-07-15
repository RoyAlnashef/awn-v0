import { PageShell } from "@/components/page-shell"
import { JobsBoard } from "@/components/jobs/jobs-board"
import { PostJobDialog } from "@/components/jobs/post-job-dialog"
import { mainNav } from "@/lib/nav"

const item = mainNav.find((i) => i.href === "/jobs")!

export default function JobsPage() {
  return (
    <PageShell
      title={item.title}
      description={item.description}
      actions={<PostJobDialog />}
    >
      <JobsBoard />
    </PageShell>
  )
}
