"use client"

import * as React from "react"

import {
  HELP_NOW_DETAILS_MAX,
  type HelpNowFormValues,
  validateHelpNowForm,
} from "@/lib/jobs/help-now"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function FieldLabel({
  htmlFor,
  children,
  optional,
  counter,
}: {
  htmlFor?: string
  children: React.ReactNode
  optional?: boolean
  counter?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label
        htmlFor={htmlFor}
        className="gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        {children}
        {optional ? (
          <span className="font-normal normal-case tracking-normal text-muted-foreground/70">
            (optional)
          </span>
        ) : null}
      </Label>
      {counter ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {counter}
        </span>
      ) : null}
    </div>
  )
}

export type HelpNowFormProps = {
  values: HelpNowFormValues
  onChange: (values: HelpNowFormValues) => void
  idPrefix?: string
  className?: string
  disabled?: boolean
}

export function HelpNowForm({
  values,
  onChange,
  idPrefix = "help-now",
  className,
  disabled = false,
}: HelpNowFormProps) {
  function update(patch: Partial<HelpNowFormValues>) {
    onChange({ ...values, ...patch })
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor={`${idPrefix}-role`}>Role Needed *</FieldLabel>
        <Input
          id={`${idPrefix}-role`}
          value={values.role}
          onChange={(event) => update({ role: event.target.value })}
          placeholder="e.g. Runner, Gaffer, Sound Recordist"
          disabled={disabled}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor={`${idPrefix}-location`}>Location *</FieldLabel>
        <Input
          id={`${idPrefix}-location`}
          value={values.location}
          onChange={(event) => update({ location: event.target.value })}
          placeholder="e.g. Austin, TX · On-site"
          disabled={disabled}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor={`${idPrefix}-datetime`}>Date & Time *</FieldLabel>
        <Input
          id={`${idPrefix}-datetime`}
          value={values.dateTime}
          onChange={(event) => update({ dateTime: event.target.value })}
          placeholder="e.g. Tomorrow, April 17 · 7am call"
          disabled={disabled}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor={`${idPrefix}-rate`} optional>
          Rate
        </FieldLabel>
        <Input
          id={`${idPrefix}-rate`}
          value={values.rate}
          onChange={(event) => update({ rate: event.target.value })}
          placeholder="e.g. $500/day · negotiable"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel
          htmlFor={`${idPrefix}-details`}
          optional
          counter={`${values.details.length}/${HELP_NOW_DETAILS_MAX}`}
        >
          Details
        </FieldLabel>
        <Textarea
          id={`${idPrefix}-details`}
          value={values.details}
          onChange={(event) =>
            update({ details: event.target.value.slice(0, HELP_NOW_DETAILS_MAX) })
          }
          placeholder="Any extra info — parking, kit needed, point of contact..."
          className="min-h-24"
          disabled={disabled}
          maxLength={HELP_NOW_DETAILS_MAX}
        />
      </div>
    </div>
  )
}

export { validateHelpNowForm }
