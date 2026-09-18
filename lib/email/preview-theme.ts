import {
  EMAIL_DARK_SURFACES,
  EMAIL_PRIMARY,
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"

const dark = emailThemeColors("dark")
const light = emailThemeColors("light")

const EMAIL_CARD_DARK = `max-width:520px;background:${dark.cardBg};border:1px solid ${dark.cardBorder}`
const EMAIL_CARD_LIGHT = `max-width:520px;background:${light.cardBg};border:1px solid ${light.cardBorder}`

const EMAIL_NOTE_DARK = `padding:16px;background:${dark.noteBg};border:1px solid ${dark.noteBorder}`
const EMAIL_NOTE_LIGHT = `padding:16px;background:${light.noteBg};border:1px solid ${light.noteBorder}`

const EMAIL_BUTTON_DARK =
  `display:inline-block;background:${dark.buttonBg};color:${dark.buttonText};`
const EMAIL_BUTTON_LIGHT =
  `display:inline-block;background:${light.buttonBg};color:${light.buttonText};border:1px solid ${light.buttonBorder};`

const EMAIL_BUTTON_LEGACY_DARK =
  "display:inline-block;background:#7c3aed;color:#ffffff"
const EMAIL_BUTTON_LEGACY_LIGHT =
  `display:inline-block;background:${light.buttonBg};color:${light.buttonText};border:1px solid ${light.buttonBorder};`

/** Legacy dark values from before the globals.css surface/border refresh. */
const LEGACY_DARK = {
  pageBg: "#0a0a0b",
  cardBg: "#141416",
  cardBorder: "#27272a",
  noteBorder: "#27272a",
  muted: "#71717a",
  brandLabel: "#a1a1aa",
} as const

/** Replace dark-theme hex values in stored HTML for light preview mode. */
const DARK_TO_LIGHT_REPLACEMENTS: [string, string][] = [
  [EMAIL_CARD_DARK, EMAIL_CARD_LIGHT],
  [
    `max-width:520px;background:${LEGACY_DARK.cardBg};border:1px solid ${LEGACY_DARK.cardBorder}`,
    EMAIL_CARD_LIGHT,
  ],
  [EMAIL_BUTTON_LEGACY_DARK, EMAIL_BUTTON_LEGACY_LIGHT],
  [EMAIL_BUTTON_DARK, EMAIL_BUTTON_LIGHT],
  [`background:${dark.pageBg}`, `background:${light.pageBg}`],
  [`background:${LEGACY_DARK.pageBg}`, `background:${light.pageBg}`],
  [dark.pageBg, light.pageBg],
  [LEGACY_DARK.pageBg, light.pageBg],
  [EMAIL_NOTE_DARK, EMAIL_NOTE_LIGHT],
  [
    `padding:16px;background:${dark.noteBg};border:1px solid ${LEGACY_DARK.noteBorder}`,
    EMAIL_NOTE_LIGHT,
  ],
  [dark.cardBorder, light.cardBorder],
  [LEGACY_DARK.cardBorder, light.cardBorder],
  [dark.noteBorder, light.noteBorder],
  [LEGACY_DARK.noteBorder, light.noteBorder],
  [EMAIL_PRIMARY.dark, EMAIL_PRIMARY.foreground],
  [dark.body, light.body],
  [dark.brandLabel, light.brandLabel],
  [dark.muted, light.muted],
  [LEGACY_DARK.muted, light.muted],
  [LEGACY_DARK.brandLabel, light.brandLabel],
  ["#a78bfa", EMAIL_PRIMARY.foreground],
  ["border-radius:999px", "border-radius:0.5rem"],
]

const LIGHT_TO_DARK_REPLACEMENTS: [string, string][] = [
  [EMAIL_CARD_LIGHT, EMAIL_CARD_DARK],
  [EMAIL_BUTTON_LIGHT, EMAIL_BUTTON_DARK],
  [EMAIL_BUTTON_LEGACY_LIGHT, EMAIL_BUTTON_DARK],
  [`background:${light.pageBg}`, `background:${dark.pageBg}`],
  [light.pageBg, dark.pageBg],
  [EMAIL_NOTE_LIGHT, EMAIL_NOTE_DARK],
  [light.cardBorder, dark.cardBorder],
  [light.noteBorder, dark.noteBorder],
  [EMAIL_PRIMARY.foreground, EMAIL_PRIMARY.dark],
  [light.body, dark.body],
  [light.brandLabel, dark.brandLabel],
  [light.muted, dark.muted],
  [
    EMAIL_BUTTON_DARK.replace(`color:${dark.buttonText}`, `color:${EMAIL_PRIMARY.dark}`),
    EMAIL_BUTTON_DARK,
  ],
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

export { EMAIL_DARK_SURFACES }
