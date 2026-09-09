export const DEFAULT_ROOM_EMOJI = "💬"

const LEGACY_ICON_TO_EMOJI: Record<string, string> = {
  hash: "#",
  music: "🎵",
  "hand-helping": "🤝",
  speaker: "🔊",
  guitar: "🎸",
  "life-buoy": "🛟",
  lightbulb: "💡",
  brain: "🧠",
  baby: "👶",
  camera: "📷",
  "clipboard-list": "📋",
  truck: "🚛",
  route: "🗺️",
  sparkles: "✨",
}

/** Slug-like legacy icon keys contain only ASCII letters, numbers, and hyphens. */
function isLegacyIconSlug(value: string): boolean {
  return /^[a-z0-9-]+$/.test(value)
}

export function resolveRoomEmoji(value: string | null | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) return DEFAULT_ROOM_EMOJI

  const legacy = LEGACY_ICON_TO_EMOJI[trimmed]
  if (legacy) return legacy

  if (isLegacyIconSlug(trimmed)) return DEFAULT_ROOM_EMOJI

  return trimmed
}
