"use client"

import { Copy, Moon, Sun } from "lucide-react"
import { toast } from "sonner"

import { useEmailPreview } from "@/components/email/email-preview-provider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { emailPreviewPageBg, emailThemeColors } from "@/lib/email/templates/base"
import { cn } from "@/lib/utils"

export function PreviewPanelHeader() {
  const { clipboardCopy, previewTheme, setPreviewTheme } = useEmailPreview()
  const isDark = previewTheme === "dark"

  return (
    <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground/40 uppercase">
        Preview Only
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
          <Sun
            className={cn(
              "size-3.5",
              isDark ? "text-muted-foreground/50" : "text-foreground",
            )}
            aria-hidden
          />
          <Switch
            checked={isDark}
            onCheckedChange={(checked) =>
              setPreviewTheme(checked ? "dark" : "light")
            }
            aria-label={isDark ? "Switch to light preview" : "Switch to dark preview"}
          />
          <Moon
            className={cn(
              "size-3.5",
              isDark ? "text-foreground" : "text-muted-foreground/50",
            )}
            aria-hidden
          />
        </div>
        {clipboardCopy ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(clipboardCopy.value).then(
                () => toast.success(`${clipboardCopy.label} copied`),
                () =>
                  toast.error(`Could not copy ${clipboardCopy.label.toLowerCase()}`),
              )
            }}
          >
            <Copy />
            Copy html
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function EmailPreviewPanel() {
  const { html, emptyMessage, previewTheme } = useEmailPreview()
  const pageBg = emailPreviewPageBg(previewTheme)
  const cardBorder = emailThemeColors(previewTheme).cardBorder

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PreviewPanelHeader />
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-popover"
        style={{ borderColor: cardBorder }}
      >
        {html ? (
          <iframe
            title="Email preview"
            srcDoc={html}
            sandbox=""
            className="min-h-0 flex-1 border-0"
            style={{ backgroundColor: pageBg }}
          />
        ) : (
          <div className="flex min-h-80 flex-1 items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground text-pretty">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
