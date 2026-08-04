"use client"

import type { ReactNode } from "react"

import { PageShell } from "@/components/page-shell"

export function JobPageLayout({
  title,
  description,
  actions,
  children,
  preview,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  preview: ReactNode
}) {
  return (
    <PageShell
      title={title}
      description={description}
      actions={actions}
      fillViewport
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:gap-8 xl:gap-12 lg:grid-cols-12">
        <div className="flex min-h-0 flex-col gap-4 overflow-auto lg:col-span-7">
          <div className="min-w-0 rounded-xl border border-border bg-background p-6">
            {children}
          </div>
        </div>
        <aside className="hidden min-h-0 lg:col-span-5 lg:flex lg:flex-col lg:p-5 xl:px-12 xl:pb-12 xl:pt-4 bg-card/20 rounded-4xl">
          <p className="mb-4 shrink-0 text-center text-xs font-semibold tracking-widest text-muted-foreground/40 uppercase">
            Preview Only
          </p>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {preview}
          </div>
        </aside>
      </div>
    </PageShell>
  )
}
