export type BoardViewMode = "grid" | "list"

export type BoardViewScope =
  | "jobs"
  | "my-jobs-created"
  | "my-applications"
  | "people"

const STORAGE_VERSION = "v1"
const DEFAULT_VIEW: BoardViewMode = "grid"

function storageKey(scope: BoardViewScope): string {
  return `boardViewMode:${STORAGE_VERSION}:${scope}`
}

function isBoardViewMode(value: string | null): value is BoardViewMode {
  return value === "grid" || value === "list"
}

export function readBoardViewMode(scope: BoardViewScope): BoardViewMode {
  if (typeof window === "undefined") return DEFAULT_VIEW

  try {
    const stored = localStorage.getItem(storageKey(scope))
    if (isBoardViewMode(stored)) return stored
  } catch {
    // Private browsing, disabled storage, or quota exceeded.
  }

  return DEFAULT_VIEW
}

export function writeBoardViewMode(
  scope: BoardViewScope,
  mode: BoardViewMode,
): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(storageKey(scope), mode)
  } catch {
    // Ignore write failures.
  }
}
