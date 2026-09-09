"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import type { Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/** Parse an ISO date-only string (YYYY-MM-DD) as local midnight. */
export function parseDateOnly(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.slice(0, 10).split("-").map(Number)
  if (!y || !m || !d) return undefined
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Format a Date as an ISO date-only string (YYYY-MM-DD). */
export function toDateOnly(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function buildDisabledMatchers(
  minDate?: Date,
  maxDate?: Date,
): Matcher | Matcher[] | undefined {
  const matchers: Matcher[] = []
  if (minDate) matchers.push({ before: minDate })
  if (maxDate) matchers.push({ after: maxDate })
  if (matchers.length === 0) return undefined
  if (matchers.length === 1) return matchers[0]
  return matchers
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  className,
  clearable = true,
}: {
  value?: Date
  onChange: (date?: Date) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
  clearable?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              data-empty={!value}
              className={cn(
                "w-full justify-start gap-2 font-normal data-[empty=true]:text-muted-foreground",
                clearable && value && "pr-8",
              )}
            >
              <CalendarIcon />
              <span className="truncate">
                {value ? format(value, "MMM d, yyyy") : placeholder}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            disabled={buildDisabledMatchers(minDate, maxDate)}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {clearable && value ? (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="Clear date"
          className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
