import { getAppOrigin } from "@/lib/email/constants"
import { headers } from "next/headers"

export async function getRequestAppOrigin(): Promise<string> {
  try {
    const h = await headers()
    const host = (h.get("x-forwarded-host") ?? h.get("host"))
      ?.split(",")[0]
      ?.trim()
    const proto =
      h.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https"

    if (
      host &&
      !host.startsWith("localhost") &&
      !host.startsWith("127.0.0.1")
    ) {
      return `${proto}://${host}`
    }
  } catch {
    // Not in a request context
  }

  return getAppOrigin()
}
