import { differenceInCalendarDays, startOfDay } from "date-fns"

/** Compact relative label for job cards (e.g. Today, 2h ago, Yesterday). */
export function formatJobPostedAt(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 60_000) return "Today"

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = differenceInCalendarDays(startOfDay(now), startOfDay(date))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export function toDateOnly(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseDateOnly(value: string | null | undefined): string | null {
  if (!value) return null
  return value.slice(0, 10)
}
