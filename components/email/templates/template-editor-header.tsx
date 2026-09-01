"use client"

import { Loader2, ArrowLeft } from "lucide-react"

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
  return (
    <div className="flex items-center gap-2">
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
        <p className="truncate text-xs text-muted-foreground">
          {entry.description}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        className="shrink-0"
        disabled={!isDirty || isPending}
        onClick={onSave}
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Save
      </Button>
    </div>
  )
}
