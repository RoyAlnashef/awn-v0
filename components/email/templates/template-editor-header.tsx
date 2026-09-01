"use client"

import { Loader2, ArrowLeft, Eye } from "lucide-react"

import { useEmailPreview } from "@/components/email/email-preview-provider"
import { Button } from "@/components/ui/button"
import type { EmailTemplateEntry } from "@/lib/email/catalog"

export function TemplateEditorHeader({
  entry,
  onBack,
  onSave,
  isDirty,
  isPending,
}: {
  entry: EmailTemplateEntry
  onBack: () => void
  onSave: () => void
  isDirty: boolean
  isPending: boolean
}) {
  const { openPreviewDrawer } = useEmailPreview()

  return (
    <div className="flex items-center gap-2 border-b border-border pb-4">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Back to template list"
        onClick={onBack}
      >
        <ArrowLeft />
      </Button>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold">{entry.name}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="lg:hidden"
          onClick={openPreviewDrawer}
        >
          <Eye />
          Preview
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!isDirty || isPending}
          onClick={onSave}
        >
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  )
}
