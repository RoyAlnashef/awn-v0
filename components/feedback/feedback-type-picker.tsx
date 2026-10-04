"use client"

import {
  BugIcon,
  CircleHelpIcon,
  HeartIcon,
  LightbulbIcon,
  type LucideIcon,
} from "lucide-react"

import {
  FEEDBACK_TYPE_CONFIG,
  FEEDBACK_TYPES,
  type FeedbackType,
} from "@/lib/feedback/types"
import { cn } from "@/lib/utils"

export const FEEDBACK_TYPE_ICONS: Record<FeedbackType, LucideIcon> = {
  bug: BugIcon,
  ux: CircleHelpIcon,
  idea: LightbulbIcon,
  praise: HeartIcon,
}

export function FeedbackTypePicker({
  value,
  onChange,
  error,
  disabled,
}: {
  value: FeedbackType | null
  onChange: (value: FeedbackType) => void
  error?: string
  disabled?: boolean
}) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">
        What kind of feedback?
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {FEEDBACK_TYPES.map((type) => {
          const config = FEEDBACK_TYPE_CONFIG[type]
          const Icon = FEEDBACK_TYPE_ICONS[type]
          const checked = value === type
          return (
            <label
              key={type}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border bg-background/40 p-3 transition-colors has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
                checked
                  ? "border-foreground/60 bg-accent"
                  : "border-border hover:bg-accent/60",
                error && !value && "border-destructive/50",
              )}
            >
              <input
                type="radio"
                name="feedback-type"
                value={type}
                checked={checked}
                onChange={() => onChange(type)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  checked
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm leading-5 font-medium">
                  {config.label}
                </span>
                <span className="text-xs leading-4 text-muted-foreground">
                  {config.short}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
