import { CHECK_IN_TTL_MS } from "@/lib/now/geo"

export const CHECK_IN_NOTE_MAX = 80

export function normalizeCheckInNote(note: string | undefined | null): string {
  return (note ?? "").trim().slice(0, CHECK_IN_NOTE_MAX)
}

export function hoursLeftFromCheckedInAt(checkedInAt: string, nowMs = Date.now()): number {
  const expiresAt = new Date(checkedInAt).getTime() + CHECK_IN_TTL_MS
  const remainingMs = expiresAt - nowMs
  if (remainingMs <= 0) return 0
  return Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)))
}

export type CheckInPhase = "idle" | "located" | "checkingIn" | "checkedIn" | "editing"

export function deriveCheckInPhase(input: {
  isCheckedIn: boolean
  searchQuery: string
  checkInPopoverOpen: boolean
  editPopoverOpen: boolean
}): CheckInPhase {
  if (input.editPopoverOpen && input.isCheckedIn) return "editing"
  if (input.checkInPopoverOpen && !input.isCheckedIn) return "checkingIn"
  if (input.isCheckedIn) return "checkedIn"
  if (input.searchQuery.trim().length > 0) return "located"
  return "idle"
}
