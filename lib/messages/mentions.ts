import type { MessageMentionSpan } from "@/lib/messages-data"

export type MentionTrigger = {
  query: string
  start: number
}

export type MentionMember = {
  id: string
  name: string
  avatarUrl?: string
}

export type ComposerMention = {
  profileId: string
  name: string
  start: number
  length: number
}

export type RevertBrokenMentionsResult = {
  draft: string
  cursor: number
  mentions: ComposerMention[]
  trigger: MentionTrigger | null
}

export type MessageTextSegment =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; profileId: string }

/** Detect an active @ mention query at the cursor. */
export function detectMentionTrigger(
  text: string,
  cursor: number,
): MentionTrigger | null {
  const before = text.slice(0, cursor)
  const atIndex = before.lastIndexOf("@")
  if (atIndex === -1) return null

  if (atIndex > 0 && !/\s/.test(before[atIndex - 1]!)) {
    return null
  }

  const query = before.slice(atIndex + 1)
  if (query.includes("\n")) return null

  return { query, start: atIndex }
}

/** Replace @query at cursor with a member display name (no @). */
export function insertMention(
  text: string,
  cursor: number,
  trigger: MentionTrigger,
  member: MentionMember,
): { text: string; cursor: number; span: MessageMentionSpan } {
  const before = text.slice(0, trigger.start)
  const after = text.slice(cursor)
  const name = member.name.trim()
  const needsSpace = after.length > 0 && !/^\s/.test(after)
  const inserted = name + (needsSpace ? " " : "")
  const nextText = before + inserted + after
  const nextCursor = before.length + inserted.length

  return {
    text: nextText,
    cursor: nextCursor,
    span: {
      profileId: member.id,
      start: trigger.start,
      length: name.length,
    },
  }
}

/** Filter members by mention query (case-insensitive). */
export function filterMentionMembers(
  members: MentionMember[],
  query: string,
  excludeProfileId?: string,
): MentionMember[] {
  const normalized = query.trim().toLowerCase()
  return members.filter((member) => {
    if (excludeProfileId && member.id === excludeProfileId) return false
    if (!normalized) return true
    return member.name.toLowerCase().includes(normalized)
  })
}

/** Adjust span offsets after text edits before the span. */
export function adjustMentionSpans(
  spans: MessageMentionSpan[],
  editStart: number,
  removedLength: number,
  insertedLength: number,
): MessageMentionSpan[] {
  const delta = insertedLength - removedLength
  if (delta === 0) return spans

  return spans
    .map((span) => {
      if (span.start >= editStart + removedLength) {
        return { ...span, start: span.start + delta }
      }
      if (span.start + span.length <= editStart) {
        return span
      }
      return null
    })
    .filter((span): span is MessageMentionSpan => span !== null)
}

/** Revert a confirmed mention to @query when its name text was edited. */
export function revertBrokenMentions(
  draft: string,
  cursor: number,
  mentions: ComposerMention[],
): RevertBrokenMentionsResult {
  if (mentions.length === 0) {
    return { draft, cursor, mentions, trigger: detectMentionTrigger(draft, cursor) }
  }

  const sorted = [...mentions].sort((a, b) => b.start - a.start)

  for (const mention of sorted) {
    const expected = draft.slice(mention.start, mention.start + mention.length)
    if (expected === mention.name) continue

    let end = mention.start
    while (end < draft.length && !/\s/.test(draft[end]!)) {
      end += 1
    }

    const partial = draft.slice(mention.start, end)
    const replacement = `@${partial}`
    const nextDraft =
      draft.slice(0, mention.start) + replacement + draft.slice(end)
    const delta = replacement.length - (end - mention.start)
    const nextCursor =
      cursor >= end
        ? cursor + delta
        : cursor > mention.start
          ? mention.start + replacement.length
          : cursor

    const nextMentions = mentions.filter((item) => item.profileId !== mention.profileId)
    const triggerStart = mention.start
    const trigger: MentionTrigger = {
      start: triggerStart,
      query: partial,
    }

    return {
      draft: nextDraft,
      cursor: nextCursor,
      mentions: nextMentions,
      trigger,
    }
  }

  return { draft, cursor, mentions, trigger: detectMentionTrigger(draft, cursor) }
}

/** Shift composer mention spans after text edits. */
export function shiftComposerMentions(
  mentions: ComposerMention[],
  editStart: number,
  removedLength: number,
  insertedLength: number,
): ComposerMention[] {
  const delta = insertedLength - removedLength
  if (delta === 0) return mentions

  return mentions
    .map((mention) => {
      if (mention.start >= editStart + removedLength) {
        return { ...mention, start: mention.start + delta }
      }
      if (mention.start + mention.length <= editStart) {
        return mention
      }
      return null
    })
    .filter((mention): mention is ComposerMention => mention !== null)
}

/** Build mention spans by locating pending mention names in the final body. */
export function buildMentionSpansFromNames(
  body: string,
  pending: { profileId: string; name: string }[],
): MessageMentionSpan[] {
  const spans: MessageMentionSpan[] = []
  let searchFrom = 0

  for (const mention of pending) {
    const name = mention.name.trim()
    if (!name) continue

    const index = body.indexOf(name, searchFrom)
    if (index === -1) continue

    spans.push({
      profileId: mention.profileId,
      start: index,
      length: name.length,
    })
    searchFrom = index + name.length
  }

  return spans
}

/** Build mention spans and profile ids for send. */
export function resolveMentionsForSend(
  body: string,
  pending: { profileId: string; name: string }[],
): { mentionSpans: MessageMentionSpan[]; mentionedProfileIds: string[] } {
  const mentionSpans = buildMentionSpansFromNames(body, pending)
  const mentionedProfileIds = [
    ...new Set(mentionSpans.map((span) => span.profileId)),
  ]

  return { mentionSpans, mentionedProfileIds }
}

/** Split message body into plain text and mention segments for rendering. */
export function renderMessageWithMentions(
  text: string,
  spans: MessageMentionSpan[] | undefined,
): MessageTextSegment[] {
  if (!spans?.length || !text) {
    return [{ type: "text", value: text }]
  }

  const sorted = [...spans].sort((a, b) => a.start - b.start)
  const segments: MessageTextSegment[] = []
  let cursor = 0

  for (const span of sorted) {
    if (span.start < cursor) continue
    if (span.start > text.length) break

    if (span.start > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, span.start) })
    }

    const end = Math.min(span.start + span.length, text.length)
    const mentionText = text.slice(span.start, end)
    if (mentionText) {
      segments.push({
        type: "mention",
        value: mentionText,
        profileId: span.profileId,
      })
    }
    cursor = end
  }

  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor) })
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }]
}

/** Map RPC mention_spans jsonb to typed spans. */
export function mapRpcMentionSpans(
  raw: unknown,
): MessageMentionSpan[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined

  const spans = raw.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const profileId =
      "profileId" in item && typeof item.profileId === "string"
        ? item.profileId
        : "profile_id" in item && typeof item.profile_id === "string"
          ? item.profile_id
          : null
    const start =
      "start" in item && typeof item.start === "number" ? item.start : null
    const length =
      "length" in item && typeof item.length === "number" ? item.length : null

    if (!profileId || start === null || length === null || length <= 0) {
      return []
    }

    return [{ profileId, start, length }]
  })

  return spans.length > 0 ? spans : undefined
}
