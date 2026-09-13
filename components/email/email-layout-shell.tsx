"use client"

import { type ReactNode } from "react"
import { Eye } from "lucide-react"

import { EmailNav } from "@/components/email/email-nav"
import { EmailPreviewDrawer } from "@/components/email/email-preview-drawer"
import { EmailPreviewPanel } from "@/components/email/email-preview-panel"
import {
  EmailPreviewProvider,
  useEmailPreview,
} from "@/components/email/email-preview-provider"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"

function EmailLayoutShellContent({
  title,
  description,
  children,
  showMobilePagePreview = true,
}: {
  title: string
  description?: string
  children: ReactNode
  showMobilePagePreview?: boolean
}) {
  const { previewDrawerOpen, setPreviewDrawerOpen, openPreviewDrawer } =
    useEmailPreview()

  return (
    <>
      <PageShell
        title={title}
        description={description}
        actions={
          showMobilePagePreview ? (
            <Button
              size="sm"
              variant="outline"
              className="lg:hidden"
              onClick={openPreviewDrawer}
            >
              <Eye />
              Preview
            </Button>
          ) : undefined
        }
        fillViewport
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="shrink-0">
            <EmailNav />
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:gap-8 xl:gap-12 lg:grid-cols-12">
            <div className="flex min-h-0 flex-col overflow-auto lg:col-span-4">
              <div className="min-w-0 rounded-xl border border-border bg-background p-6">
                {children}
              </div>
            </div>
            <aside className="hidden min-h-0 lg:col-span-8 lg:flex lg:flex-col lg:p-5 xl:px-12 xl:pb-12 xl:pt-4 bg-card/20 rounded-4xl">
              <EmailPreviewPanel />
            </aside>
          </div>
        </div>
      </PageShell>

      <EmailPreviewDrawer
        open={previewDrawerOpen}
        onOpenChange={setPreviewDrawerOpen}
      />
    </>
  )
}

export function EmailLayoutShell({
  title,
  description,
  children,
  showMobilePagePreview = true,
}: {
  title: string
  description?: string
  children: ReactNode
  showMobilePagePreview?: boolean
}) {
  return (
    <EmailPreviewProvider>
      <EmailLayoutShellContent
        title={title}
        description={description}
        showMobilePagePreview={showMobilePagePreview}
      >
        {children}
      </EmailLayoutShellContent>
    </EmailPreviewProvider>
  )
}
