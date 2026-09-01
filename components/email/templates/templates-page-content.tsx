"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { useEmailPreview } from "@/components/email/email-preview-provider"
import { TemplateEditorForm } from "@/components/email/templates/template-editor-form"
import { TemplateListView } from "@/components/email/templates/template-list-view"
import { UnsavedChangesPopover } from "@/components/email/templates/unsaved-changes-popover"
import {
  emailTemplateCatalog,
  getEmailTemplateById,
  getTemplatePreviewHtml,
  getTemplateSupabaseHtml,
} from "@/lib/email/catalog"
import {
  cloneTemplateContent,
  isEmailTemplateId,
  templateContentEquals,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import type { AllTemplateContentMap, SavedTemplateContent } from "@/lib/email/template-actions"
import { cn } from "@/lib/utils"

export function TemplatesPageContent({
  initialContent,
}: {
  initialContent: AllTemplateContentMap
}) {
  const { setHtml, setEmptyMessage, setClipboardCopy, previewTheme } =
    useEmailPreview()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(emailTemplateCatalog[0]?.id ?? "")
  const [view, setView] = useState<"list" | "edit">("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [contentMap, setContentMap] = useState(initialContent)
  const [draftContent, setDraftContent] = useState<EmailTemplateContent | null>(
    null,
  )
  const [savedSnapshot, setSavedSnapshot] = useState<EmailTemplateContent | null>(
    null,
  )
  const [discardPopoverOpen, setDiscardPopoverOpen] = useState(false)
  const backAnchorRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return emailTemplateCatalog
    return emailTemplateCatalog.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.source.includes(q),
    )
  }, [query])

  const resendEntries = filtered.filter((e) => e.source === "resend")
  const supabaseEntries = filtered.filter((e) => e.source === "supabase")

  const selected = getEmailTemplateById(selectedId) ?? filtered[0]
  const editingEntry = editingId ? getEmailTemplateById(editingId) : null

  const previewContent = useMemo(() => {
    if (!selected) return null
    if (view === "edit" && editingId === selectedId && draftContent) {
      return draftContent
    }
    if (isEmailTemplateId(selected.id)) {
      return contentMap[selected.id]
    }
    return null
  }, [selected, view, editingId, selectedId, draftContent, contentMap])

  useEffect(() => {
    setEmptyMessage("Select a template to preview.")
  }, [setEmptyMessage])

  useEffect(() => {
    if (!selected || !previewContent) {
      setHtml(null)
      return
    }

    setHtml(getTemplatePreviewHtml(selected.id, previewTheme, previewContent))
  }, [selected, previewContent, previewTheme, setHtml])

  useEffect(() => {
    if (!selected || selected.source !== "supabase") {
      setClipboardCopy(null)
      return
    }

    const supabaseHtml = getTemplateSupabaseHtml(
      selected.id,
      previewContent ?? undefined,
    )

    if (supabaseHtml) {
      setClipboardCopy({ label: "HTML", value: supabaseHtml })
    } else {
      setClipboardCopy(null)
    }
  }, [selected, previewContent, setClipboardCopy])

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((e) => e.id === selectedId)) {
      setSelectedId(filtered[0]!.id)
    }
  }, [filtered, selectedId])

  function openEditor(id: string) {
    if (!isEmailTemplateId(id)) return

    setSelectedId(id)
    setEditingId(id)
    const saved = contentMap[id]
    const snapshot = cloneTemplateContent(saved)
    setDraftContent(snapshot)
    setSavedSnapshot(cloneTemplateContent(saved))
    setView("edit")
  }

  function closeEditor() {
    setView("list")
    setEditingId(null)
    setDraftContent(null)
    setSavedSnapshot(null)
    setDiscardPopoverOpen(false)
  }

  function handleBackRequest() {
    if (
      draftContent &&
      savedSnapshot &&
      !templateContentEquals(draftContent, savedSnapshot)
    ) {
      setDiscardPopoverOpen(true)
      return
    }
    closeEditor()
  }

  function handleSaved(id: string, saved: SavedTemplateContent) {
    if (!isEmailTemplateId(id)) return

    setContentMap((current) => ({
      ...current,
      [id]: saved,
    }))
    const snapshot = cloneTemplateContent(saved)
    setDraftContent(snapshot)
    setSavedSnapshot(snapshot)
  }

  const isEditing = view === "edit" && editingEntry && draftContent && savedSnapshot

  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden">
      <div
        className={cn(
          "flex h-full w-[200%] transition-transform duration-300 ease-in-out",
          view === "edit" && "-translate-x-1/2",
        )}
      >
        <div className="flex w-1/2 min-h-0 flex-col pr-0">
          <TemplateListView
            query={query}
            onQueryChange={setQuery}
            resendEntries={resendEntries}
            supabaseEntries={supabaseEntries}
            filteredCount={filtered.length}
            selectedId={selected?.id ?? ""}
            onSelect={setSelectedId}
            onEdit={openEditor}
          />
        </div>

        <div className="flex w-1/2 min-h-0 flex-col pl-0">
          {isEditing ? (
            <div ref={backAnchorRef} className="flex min-h-0 flex-1 flex-col">
              <TemplateEditorForm
                entry={editingEntry}
                content={draftContent}
                savedSnapshot={savedSnapshot}
                onBack={handleBackRequest}
                onChange={setDraftContent}
                onSaved={(saved) => handleSaved(editingEntry.id, saved)}
              />
              <UnsavedChangesPopover
                open={discardPopoverOpen}
                onOpenChange={setDiscardPopoverOpen}
                anchor={backAnchorRef}
                onDiscard={closeEditor}
                onKeepEditing={() => setDiscardPopoverOpen(false)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
