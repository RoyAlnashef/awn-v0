import { createAdminClient } from "@/lib/supabase/admin"

import type { ErrorLogLevel, ErrorLogSource } from "./data"

const MAX_MESSAGE_LENGTH = 2000
const MAX_STACK_LENGTH = 8000
const MAX_CONTEXT_LENGTH = 100
const MAX_URL_LENGTH = 2000

export type LogErrorInput = {
  level?: ErrorLogLevel
  source: ErrorLogSource
  message: string
  stack?: string | null
  context?: string | null
  url?: string | null
  userAgent?: string | null
  userId?: string | null
  metadata?: Record<string, unknown>
}

function truncate(value: string | null | undefined, max: number): string | null {
  if (!value) return null
  return value.length > max ? value.slice(0, max) : value
}

export async function logError(input: LogErrorInput): Promise<void> {
  try {
    const admin = createAdminClient()

    await admin.from("error_logs").insert({
      level: input.level ?? "error",
      source: input.source,
      message: truncate(input.message, MAX_MESSAGE_LENGTH) ?? "Unknown error",
      stack: truncate(input.stack, MAX_STACK_LENGTH),
      context: truncate(input.context, MAX_CONTEXT_LENGTH),
      url: truncate(input.url, MAX_URL_LENGTH),
      user_agent: truncate(input.userAgent, MAX_URL_LENGTH),
      user_id: input.userId ?? null,
      metadata: input.metadata ?? {},
    })
  } catch {
    // Never throw — logging must not break user flows.
  }
}
