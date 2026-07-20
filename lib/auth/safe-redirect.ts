/**
 * Returns a same-origin relative path for post-login redirects.
 * Rejects protocol-relative and absolute URLs.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = "/now",
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback
  }
  return next
}
