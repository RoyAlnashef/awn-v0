"use client"

import type { ReactNode } from "react"

import { PageShell } from "@/components/page-shell"
import { CommunityReportsNav } from "@/components/reports/community-reports-nav"

export function CommunityReportsLayoutShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <PageShell title={title} description={description}>
      <div className="flex flex-col gap-4">
        <CommunityReportsNav />
        {children}
      </div>
    </PageShell>
  )
}
