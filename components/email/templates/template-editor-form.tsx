"use client"

import { useTransition } from "react"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { EmailTemplateEntry } from "@/lib/email/catalog"
import {
  getTemplateMeta,
  isEmailTemplateId,
  templateContentEquals,
  type EmailTemplateContent,
} from "@/lib/email/template-content"
import {
  saveEmailTemplateContent,
  type SavedTemplateContent,
} from "@/lib/email/template-actions"
import { TemplateEditorHeader } from "@/components/email/templates/template-editor-header"

export function TemplateEditorForm({
  entry,
  content,
  savedSnapshot,
  onBack,
  onChange,
  onSaved,
}: {
  entry: EmailTemplateEntry
  content: EmailTemplateContent
  savedSnapshot: EmailTemplateContent
  onBack: () => void
  onChange: (content: EmailTemplateContent) => void
  onSaved: (saved: SavedTemplateContent) => void
}) {
  const [isPending, startTransition] = useTransition()
  const meta = isEmailTemplateId(entry.id) ? getTemplateMeta(entry.id) : null
  const hasButton = meta?.hasButton ?? false
  const footerNote =
    meta?.footerNote && isEmailTemplateId(entry.id)
      ? meta.footerNote("dark")
      : null
  const isDirty = !templateContentEquals(content, savedSnapshot)
  const showInviteHint =
    entry.id === "invite" && !content.subject.includes("{{inviterName}}")

  function updateField<K extends keyof EmailTemplateContent>(
    key: K,
    value: EmailTemplateContent[K],
  ) {
    onChange({ ...content, [key]: value })
  }

  function updateParagraph(index: number, value: string) {
    const paragraphs = [...content.paragraphs]
    paragraphs[index] = value
    onChange({ ...content, paragraphs })
  }

  function addParagraph() {
    onChange({ ...content, paragraphs: [...content.paragraphs, ""] })
  }

  function removeParagraph(index: number) {
    if (content.paragraphs.length <= 1) return
    onChange({
      ...content,
      paragraphs: content.paragraphs.filter((_, i) => i !== index),
    })
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveEmailTemplateContent(entry.id, content)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Template saved.")
      onSaved(result.data)
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <TemplateEditorHeader
        entry={entry}
        onBack={onBack}
        onSave={handleSave}
        isDirty={isDirty}
        isPending={isPending}
      />

      {entry.source === "supabase" && entry.supabaseDashboardPath ? (
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          After saving, copy the updated HTML from the preview panel and paste
          it into Supabase Dashboard under{" "}
          <span className="font-medium text-foreground">
            {entry.supabaseDashboardPath}
          </span>
          .
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="template-subject">Subject</Label>
          <Input
            id="template-subject"
            value={content.subject}
            onChange={(e) => updateField("subject", e.target.value)}
          />
          {showInviteHint ? (
            <p className="text-xs text-muted-foreground">
              Include <code className="text-foreground">{"{{inviterName}}"}</code>{" "}
              in the subject so the inviter&apos;s name appears when sent.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="template-preview">Preview line</Label>
          <Input
            id="template-preview"
            value={content.preview}
            onChange={(e) => updateField("preview", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Shown in inbox previews before the email is opened.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="template-heading">Heading</Label>
          <Input
            id="template-heading"
            value={content.heading}
            onChange={(e) => updateField("heading", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Label>Body paragraphs</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addParagraph}
            >
              <Plus data-icon="inline-start" />
              Add paragraph
            </Button>
          </div>

          {content.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Paragraph {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove paragraph ${index + 1}`}
                  disabled={content.paragraphs.length <= 1}
                  onClick={() => removeParagraph(index)}
                >
                  <Minus />
                </Button>
              </div>
              <Textarea
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                rows={3}
              />
            </div>
          ))}
        </div>

        {hasButton ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="template-button">Button label</Label>
            <Input
              id="template-button"
              value={content.buttonLabel ?? ""}
              onChange={(e) => updateField("buttonLabel", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Button link is managed in code and cannot be edited here.
            </p>
          </div>
        ) : null}

        {footerNote ? (
          <div className="flex flex-col gap-2">
            <Label>Footer note (read-only)</Label>
            <div
              className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: footerNote }}
            />
            <p className="text-xs text-muted-foreground">
              Supabase template tags in the footer cannot be edited.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
