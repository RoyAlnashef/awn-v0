export type ReportClientErrorInput = {
  message: string
  stack?: string | null
  context?: string | null
  url?: string | null
  metadata?: Record<string, unknown>
}

export function contextFromPathname(pathname: string): string {
  if (pathname === "/request-access" || pathname.startsWith("/request-access/")) {
    return "request_access"
  }
  if (pathname === "/apply" || pathname.startsWith("/apply/")) {
    return "apply"
  }
  if (pathname === "/") return "home"
  return pathname.replace(/^\//, "").replace(/\//g, "_") || "unknown"
}

export async function reportClientError(
  input: ReportClientErrorInput,
): Promise<void> {
  try {
    await fetch("/api/error-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input.message,
        stack: input.stack ?? null,
        context: input.context ?? null,
        url: input.url ?? (typeof window !== "undefined" ? window.location.href : null),
        metadata: input.metadata ?? {},
      }),
      keepalive: true,
    })
  } catch {
    // Fire-and-forget — must never throw.
  }
}
