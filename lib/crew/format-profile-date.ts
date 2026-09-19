/** Formats an ISO date-only string like "2026-08-01" → "Aug 1". */
export function formatShortDate(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}
