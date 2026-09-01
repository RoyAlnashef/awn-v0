import type { EmailTheme } from "@/lib/email/templates/base"

/** Replace dark-theme hex values in stored HTML for light preview mode. */
const DARK_TO_LIGHT_REPLACEMENTS: [string, string][] = [
  ["#0a0a0b", "#f4f4f5"],
  ["#141416", "#ffffff"],
  ["#18181b", "#f4f4f5"],
  ["#27272a", "#e4e4e7"],
  ["#fafafa", "#18181b"],
  ["#d4d4d8", "#52525b"],
  ["#a1a1aa", "#71717a"],
  ["#a78bfa", "#7c3aed"],
]

const LIGHT_TO_DARK_REPLACEMENTS: [string, string][] = DARK_TO_LIGHT_REPLACEMENTS.map(
  ([dark, light]) => [light, dark] as [string, string],
)

function applyReplacements(html: string, pairs: [string, string][]): string {
  let result = html
  for (const [from, to] of pairs) {
    result = result.split(from).join(to)
  }
  return result
}

export function applyPreviewTheme(html: string, theme: EmailTheme): string {
  if (theme === "dark") {
    return html
  }
  return applyReplacements(html, DARK_TO_LIGHT_REPLACEMENTS)
}

export function revertPreviewTheme(html: string, fromTheme: EmailTheme): string {
  if (fromTheme === "dark") {
    return html
  }
  return applyReplacements(html, LIGHT_TO_DARK_REPLACEMENTS)
}
