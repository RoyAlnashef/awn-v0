"use client"

import { InfoIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  FEEDBACK_IMPACT_CONFIG,
  FEEDBACK_IMPACTS,
  FEEDBACK_LIMITS,
  FEEDBACK_TYPE_CONFIG,
  type FeedbackImpact,
  type FeedbackType,
} from "@/lib/feedback/types"
import { cn } from "@/lib/utils"

import {
  FeedbackAttachments,
  type DraftAttachment,
} from "./feedback-attachments"
import { FeedbackTypePicker } from "./feedback-type-picker"

export type FeedbackDraft = {
  type: FeedbackType | null
  impact: FeedbackImpact | null
  area: string
  summary: string
  details: string
  allowContact: boolean
  attachments: DraftAttachment[]
}

export type FeedbackFieldErrors = Partial<
  Record<"type" | "summary" | "details" | "attachments", string>
>

export function FeedbackForm({
  draft,
  onChange,
  areaOptions,
  errors,
  processingImages,
  submitting,
  onAddFiles,
  onRemoveAttachment,
  onSubmitShortcut,
  email,
}: {
  draft: FeedbackDraft
  onChange: (patch: Partial<FeedbackDraft>) => void
  areaOptions: string[]
  errors: FeedbackFieldErrors
  processingImages: boolean
  submitting: boolean
  onAddFiles: (files: File[]) => void
  onRemoveAttachment: (id: string) => void
  onSubmitShortcut: () => void
  email: string
}) {
  const config = draft.type ? FEEDBACK_TYPE_CONFIG[draft.type] : null

  return (
    <div className="flex flex-col gap-5">
      <FeedbackTypePicker
        value={draft.type}
        onChange={(type) => onChange({ type })}
        error={errors.type}
        disabled={submitting}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="feedback-area">Where in the app?</Label>
        <Select
          value={draft.area}
          onValueChange={(value) => value && onChange({ area: value })}
          disabled={submitting}
        >
          <SelectTrigger id="feedback-area" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {areaOptions.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="feedback-summary">Summary</Label>
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              draft.summary.length > FEEDBACK_LIMITS.summaryMax &&
                "text-destructive",
            )}
          >
            {draft.summary.length}/{FEEDBACK_LIMITS.summaryMax}
          </span>
        </div>
        <Input
          id="feedback-summary"
          value={draft.summary}
          onChange={(event) => onChange({ summary: event.target.value })}
          placeholder={
            config?.summaryPlaceholder ?? "A one-line description"
          }
          aria-invalid={!!errors.summary}
          aria-describedby={errors.summary ? "feedback-summary-error" : undefined}
          disabled={submitting}
          autoComplete="off"
        />
        {errors.summary ? (
          <p id="feedback-summary-error" className="text-xs text-destructive">
            {errors.summary}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="feedback-details">
          {config?.detailsLabel ?? "Details"}
        </Label>
        <Textarea
          id="feedback-details"
          value={draft.details}
          onChange={(event) => onChange({ details: event.target.value })}
          onPaste={(event) => {
            const images = Array.from(event.clipboardData.files).filter((file) =>
              file.type.startsWith("image/"),
            )
            if (images.length) {
              event.preventDefault()
              onAddFiles(images)
            }
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              onSubmitShortcut()
            }
          }}
          placeholder={
            config?.detailsPlaceholder ??
            "Tell us what's going on. The more specific, the better."
          }
          rows={5}
          className="min-h-28 resize-y"
          aria-invalid={!!errors.details}
          aria-describedby={errors.details ? "feedback-details-error" : undefined}
          disabled={submitting}
        />
        {errors.details ? (
          <p id="feedback-details-error" className="text-xs text-destructive">
            {errors.details}
          </p>
        ) : null}
      </div>

      {config?.asksImpact ? (
        <fieldset className="flex flex-col gap-2" disabled={submitting}>
          <legend className="mb-2 text-sm font-medium">
            How much is this affecting you?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {FEEDBACK_IMPACTS.map((impact) => {
              const checked = draft.impact === impact
              return (
                <label
                  key={impact}
                  className={cn(
                    "flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2 transition-colors has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
                    checked
                      ? "border-foreground/60 bg-accent"
                      : "border-border hover:bg-accent/60",
                  )}
                >
                  <input
                    type="radio"
                    name="feedback-impact"
                    value={impact}
                    checked={checked}
                    onChange={() => onChange({ impact })}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {FEEDBACK_IMPACT_CONFIG[impact].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {FEEDBACK_IMPACT_CONFIG[impact].description}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      <FeedbackAttachments
        attachments={draft.attachments}
        processing={processingImages}
        error={errors.attachments}
        onAddFiles={onAddFiles}
        onRemove={onRemoveAttachment}
        disabled={submitting}
      />

      <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/40 p-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="feedback-contact">OK to follow up?</Label>
          <p className="text-xs text-muted-foreground">
            {"We'll reply to "}
            <span className="text-foreground">{email}</span>
            {" if we have questions."}
          </p>
        </div>
        <Switch
          id="feedback-contact"
          checked={draft.allowContact}
          onCheckedChange={(checked) => onChange({ allowContact: checked })}
          disabled={submitting}
        />
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          {"We'll also include this page's URL, your browser, and screen size to help us reproduce issues."}
        </span>
      </p>
    </div>
  )
}
