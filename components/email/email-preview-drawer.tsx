"use client"

import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import { useEmailPreview } from "@/components/email/email-preview-provider"
import { PreviewPanelHeader } from "@/components/email/email-preview-panel"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { emailPreviewPageBg } from "@/lib/email/templates/base"

export function EmailPreviewDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { html, emptyMessage, previewTheme } = useEmailPreview()
  const pageBg = emailPreviewPageBg(previewTheme)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className={FLYOUT_DRAWER_CONTENT_CLASS}>
        <FlyoutDrawerClose />
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <PreviewPanelHeader />
          {html ? (
            <iframe
              title="Email preview"
              srcDoc={html}
              sandbox=""
              className="min-h-0 flex-1 rounded-xl border border-border"
            style={{ backgroundColor: pageBg }}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
