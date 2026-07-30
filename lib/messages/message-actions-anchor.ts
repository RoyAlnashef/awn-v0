export type MessageActionsAnchorMode = "trigger" | "bubble"

export function resolveMessageActionsAnchor(
  mode: MessageActionsAnchorMode,
  refs: {
    trigger: Element | null
    bubble: Element | null
  },
) {
  if (mode === "trigger") {
    return refs.trigger ?? undefined
  }

  if (!refs.bubble) return undefined

  const bubbles = refs.bubble.querySelectorAll('[data-slot="bubble"]')
  if (bubbles.length === 1) {
    return bubbles[0]!
  }

  return refs.bubble
}
