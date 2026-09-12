import type { ReactNode } from "react"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { MyJobsLayoutShell } from "@/components/jobs/my-jobs-layout-shell"

export default async function MyJobsLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser()
  return (
    <MyJobsLayoutShell canPostJobs={sessionUser?.canPostJobs ?? false}>
      {children}
    </MyJobsLayoutShell>
  )
}
