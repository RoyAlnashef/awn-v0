"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"

import { useEmailPreview } from "@/components/email/email-preview-provider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  emailTemplateCatalog,
  getTemplatePreviewHtml,
  type EmailTemplateEntry,
} from "@/lib/email/catalog"
import { cn } from "@/lib/utils"

function TemplateListItem({
  entry,
  selected,
  onSelect,
}: {
  entry: EmailTemplateEntry
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg border px-3 py-3 text-left transition-colors",
        selected
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card/40 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm">{entry.name}</span>
        <Badge variant={entry.source === "supabase" ? "secondary" : "outline"}>
          {entry.source === "supabase" ? "Supabase" : "Resend"}
        </Badge>
      </div>
      <span className="text-xs text-muted-foreground line-clamp-2">
        {entry.description}
      </span>
    </button>
  )
}

export function TemplatesPageContent() {
  const { setHtml, setEmptyMessage, setClipboardCopy, previewTheme } =
    useEmailPreview()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(emailTemplateCatalog[0]?.id ?? "")

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

  const selected =
    emailTemplateCatalog.find((e) => e.id === selectedId) ?? filtered[0]

  useEffect(() => {
    setEmptyMessage("Select a template to preview.")
  }, [setEmptyMessage])

  useEffect(() => {
    if (selected) {
      setHtml(getTemplatePreviewHtml(selected.id, previewTheme))
    } else {
      setHtml(null)
    }
  }, [selected, previewTheme, setHtml])

  useEffect(() => {
    if (
      selected?.source === "supabase" &&
      selected.supabaseHtml
    ) {
      setClipboardCopy({
        label: "HTML",
        value: selected.supabaseHtml,
      })
    } else {
      setClipboardCopy(null)
    }
  }, [selected, setClipboardCopy])

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((e) => e.id === selectedId)) {
      setSelectedId(filtered[0]!.id)
    }
  }, [filtered, selectedId])

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-4">
        {resendEntries.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              App emails (Resend)
            </h2>
            <div className="flex flex-col gap-2">
              {resendEntries.map((entry) => (
                <TemplateListItem
                  key={entry.id}
                  entry={entry}
                  selected={selected?.id === entry.id}
                  onSelect={() => setSelectedId(entry.id)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {supabaseEntries.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Auth emails (Supabase)
            </h2>
            <div className="flex flex-col gap-2">
              {supabaseEntries.map((entry) => (
                <TemplateListItem
                  key={entry.id}
                  entry={entry}
                  selected={selected?.id === entry.id}
                  onSelect={() => setSelectedId(entry.id)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No templates match your search.
          </p>
        ) : null}
      </div>
    </div>
  )
}
