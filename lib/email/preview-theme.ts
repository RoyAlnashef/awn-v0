import type { EmailTheme } from "@/lib/email/templates/base"

const EMAIL_CARD_DARK =
  "max-width:520px;background:#141416;border:1px solid #27272a"
const EMAIL_CARD_LIGHT =
  "max-width:520px;background:#ffffff;border:1px solid #e4e4e7"

const EMAIL_BUTTON_DARK =
  "display:inline-block;background:#ffffff;color:#18181b;"
const EMAIL_BUTTON_LIGHT =
  "display:inline-block;background:#ffffff;color:#18181b;border:1px solid #e4e4e7;"

const EMAIL_BUTTON_LEGACY_DARK =
  "display:inline-block;background:#7c3aed;color:#ffffff"
const EMAIL_BUTTON_LEGACY_LIGHT =
  "display:inline-block;background:#ffffff;color:#18181b;border:1px solid #e4e4e7"

/** Replace dark-theme hex values in stored HTML for light preview mode. */
const DARK_TO_LIGHT_REPLACEMENTS: [string, string][] = [
  [EMAIL_CARD_DARK, EMAIL_CARD_LIGHT],
  [EMAIL_BUTTON_LEGACY_DARK, EMAIL_BUTTON_LEGACY_LIGHT],
  [EMAIL_BUTTON_DARK, EMAIL_BUTTON_LIGHT],
  ["background:#0a0a0b", "background:#f4f4f5"],
  ["#0a0a0b", "#f4f4f5"],
  [
    "padding:16px;background:#18181b;border:1px solid #27272a",
    "padding:16px;background:#f4f4f5;border:1px solid #e4e4e7",
  ],
  ["#27272a", "#e4e4e7"],
  ["#fafafa", "#18181b"],
  ["#d4d4d8", "#52525b"],
  ["#a1a1aa", "#71717a"],
  ["#a78bfa", "#18181b"],
  ["border-radius:999px", "border-radius:0.5rem"],
]

const LIGHT_TO_DARK_REPLACEMENTS: [string, string][] = [
  [EMAIL_CARD_LIGHT, EMAIL_CARD_DARK],
  [EMAIL_BUTTON_LIGHT, EMAIL_BUTTON_DARK],
  [EMAIL_BUTTON_LEGACY_LIGHT, EMAIL_BUTTON_DARK],
  ["background:#f4f4f5", "background:#0a0a0b"],
  ["#f4f4f5", "#0a0a0b"],
  [
    "padding:16px;background:#f4f4f5;border:1px solid #e4e4e7",
    "padding:16px;background:#18181b;border:1px solid #27272a",
  ],
  ["#e4e4e7", "#27272a"],
  ["#18181b", "#fafafa"],
  ["#52525b", "#d4d4d8"],
  ["#71717a", "#a1a1aa"],
  [EMAIL_BUTTON_DARK.replace("color:#18181b", "color:#fafafa"), EMAIL_BUTTON_DARK],
]

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
