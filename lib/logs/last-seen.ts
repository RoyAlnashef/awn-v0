const ERROR_LOGS_LAST_SEEN_KEY = "error-logs-last-seen-at:v1"

export function getErrorLogsLastSeenAt(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(ERROR_LOGS_LAST_SEEN_KEY)
  } catch {
    return null
  }
}

export function markErrorLogsSeen(at = new Date()): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ERROR_LOGS_LAST_SEEN_KEY, at.toISOString())
  } catch {
    // Quota or private browsing — ignore.
  }
}
