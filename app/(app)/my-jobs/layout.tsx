import type { ReactNode } from "react"

import { MyJobsLayoutShell } from "@/components/jobs/my-jobs-layout-shell"

export default function MyJobsLayout({ children }: { children: ReactNode }) {
  return <MyJobsLayoutShell>{children}</MyJobsLayoutShell>
}
