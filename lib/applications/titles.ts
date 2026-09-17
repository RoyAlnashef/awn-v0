/** Split stored title string into individual roles (new comma-separated format). */
export function parseApplicationTitles(title: string): string[] {
  const trimmed = title.trim()
  if (!trimmed) return []
  if (trimmed.includes(", ")) {
    return trimmed.split(", ").map((t) => t.trim()).filter(Boolean)
  }
  return [trimmed]
}
