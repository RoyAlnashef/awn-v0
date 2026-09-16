import { logError } from "@/lib/logs/log-error"
import { createClient } from "@/lib/supabase/server"

const MAX_BODY_BYTES = 16_384
const MAX_MESSAGE_LENGTH = 2000
const MAX_STACK_LENGTH = 8000

type ErrorLogPayload = {
  message?: unknown
  stack?: unknown
  context?: unknown
  url?: unknown
  metadata?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stringField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 })
  }

  let body: ErrorLogPayload
  try {
    body = (await request.json()) as ErrorLogPayload
  } catch {
    return new Response(null, { status: 400 })
  }

  const message = stringField(body.message, MAX_MESSAGE_LENGTH)
  if (!message) {
    return new Response(null, { status: 400 })
  }

  let userId: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // Optional — anonymous errors are allowed.
  }

  await logError({
    source: "client",
    message,
    stack: stringField(body.stack, MAX_STACK_LENGTH),
    context: stringField(body.context, 100),
    url: stringField(body.url, 2000),
    userAgent: stringField(request.headers.get("user-agent"), 2000),
    userId,
    metadata: isRecord(body.metadata) ? body.metadata : {},
  })

  return new Response(null, { status: 204 })
}
