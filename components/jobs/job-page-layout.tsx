"use client"

import { useState, type ReactNode } from "react"
import { Eye } from "lucide-react"

import type { Job } from "@/lib/jobs-data"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { JobPreviewDrawer } from "@/components/jobs/job-preview-drawer"
import { JobPreviewPanel } from "@/components/jobs/job-preview-panel"

export function JobPageLayout({
  title,
  description,
  actions,
  children,
  previewJob,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  previewJob?: Job
}) {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <PageShell
      title={title}
      description={description}
      actions={
        <div className="flex items-center gap-2">
          {actions}
          {previewJob ? (
            <Button
              size="sm"
              variant="outline"
              className="lg:hidden"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye />
              Preview Job
            </Button>
          ) : null}
        </div>
      }
      fillViewport
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:gap-8 xl:gap-12 lg:grid-cols-12">
        <div
          className={`flex min-h-0 flex-col gap-4 overflow-auto ${previewJob ? "lg:col-span-7" : "lg:col-span-12"}`}
        >
          <div className="min-w-0 rounded-xl border border-border bg-background p-6">
            {children}
          </div>
        </div>
        {previewJob ? (
          <aside className="hidden min-h-0 lg:col-span-5 lg:flex lg:flex-col lg:p-5 xl:px-12 xl:pb-12 xl:pt-4 bg-card/20 rounded-4xl">
            <JobPreviewPanel job={previewJob} />
          </aside>
        ) : null}
      </div>

      {previewJob ? (
        <JobPreviewDrawer
          job={previewJob}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      ) : null}
    </PageShell>
  )
}
