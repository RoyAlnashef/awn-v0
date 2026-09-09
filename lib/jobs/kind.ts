import type { JobKind } from "@/lib/jobs-data"

const URGENT_TTL_MS = 48 * 60 * 60 * 1000

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
