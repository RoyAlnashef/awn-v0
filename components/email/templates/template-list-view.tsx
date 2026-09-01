"use client"

import { Eye, Pencil, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { EmailTemplateEntry } from "@/lib/email/catalog"
import { cn } from "@/lib/utils"

function TemplateListItem({
  entry,
  selected,
  onSelect,
  onEdit,
  onPreview,
}: {
  entry: EmailTemplateEntry
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onPreview: () => void
}) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-1 rounded-lg border px-2 py-2 transition-colors",
        selected
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card/40 hover:bg-muted/40",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 flex-col gap-1 px-1 py-1 text-left"
      >
        <span className="font-medium text-sm">{entry.name}</span>
        <span className="text-xs text-muted-foreground line-clamp-2">
          {entry.description}
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground lg:hidden"
        aria-label={`Preview ${entry.name}`}
        onClick={(event) => {
          event.stopPropagation()
          onPreview()
        }}
      >
        <Eye />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground/60 hover:text-muted-foreground"
        aria-label={`Edit ${entry.name}`}
        onClick={(event) => {
          event.stopPropagation()
          onEdit()
        }}
      >
        <Pencil />
      </Button>
    </div>
  )
}

export function TemplateListView({
  query,
  onQueryChange,
  resendEntries,
  supabaseEntries,
  filteredCount,
  selectedId,
  onSelect,
  onEdit,
  onPreview,
}: {
  query: string
  onQueryChange: (value: string) => void
  resendEntries: EmailTemplateEntry[]
  supabaseEntries: EmailTemplateEntry[]
  filteredCount: number
  selectedId: string
  onSelect: (id: string) => void
  onEdit: (id: string) => void
  onPreview: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
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
                  selected={selectedId === entry.id}
                  onSelect={() => onSelect(entry.id)}
                  onEdit={() => onEdit(entry.id)}
                  onPreview={() => onPreview(entry.id)}
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
                  selected={selectedId === entry.id}
                  onSelect={() => onSelect(entry.id)}
                  onEdit={() => onEdit(entry.id)}
                  onPreview={() => onPreview(entry.id)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {filteredCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            No templates match your search.
          </p>
        ) : null}
      </div>
    </div>
  )
}
