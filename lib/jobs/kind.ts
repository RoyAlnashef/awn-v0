import type { JobKind } from "@/lib/jobs-data"

export const URGENT_TTL_HOURS = 24

const URGENT_TTL_MS = URGENT_TTL_HOURS * 60 * 60 * 1000

export function normalizeJobKind(kind: string | undefined): JobKind {
  return kind === "urgent" ? "urgent" : "full"
}

export function urgentExpiresAt(): string {
  return new Date(Date.now() + URGENT_TTL_MS).toISOString()
}

export type KindTransitionFields = {
  kind: JobKind
  expires_at: string | null
  deadline?: null
  status?: "open"
}

/** Returns DB patch fields when kind changes; null if kind is unchanged. */
export function kindTransitionPatch(
  nextKind: JobKind,
  currentKind: JobKind,
): KindTransitionFields | null {
  if (nextKind === currentKind) return null

  if (nextKind === "urgent") {
    return {
      kind: "urgent",
      expires_at: urgentExpiresAt(),
      deadline: null,
      status: "open",
    }
  }

  return {
    kind: "full",
    expires_at: null,
  }
}
