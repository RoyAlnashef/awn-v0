"use server"

import { AuthError, requireAdmin } from "@/lib/auth/require-admin"

import { mapErrorLogRow, type ErrorLog, type ErrorLogRow } from "./data"

export type ListErrorLogsResult =
  | { ok: true; logs: ErrorLog[] }
  | { ok: false; error: string; logs: [] }

const ERROR_LOG_LIMIT = 200

export async function listErrorLogs(): Promise<ListErrorLogsResult> {
  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from("error_logs")
      .select(
        "id, level, source, message, stack, context, url, user_agent, user_id, metadata, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(ERROR_LOG_LIMIT)

    if (error) {
      return { ok: false, error: error.message, logs: [] }
    }

    const logs = (data as ErrorLogRow[] | null)?.map(mapErrorLogRow) ?? []
    return { ok: true, logs }
  } catch (error) {
    const message =
      error instanceof AuthError ? error.message : "Failed to load error logs."
    return { ok: false, error: message, logs: [] }
  }
}
