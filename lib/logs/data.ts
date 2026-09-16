export type ErrorLogLevel = "error" | "warning"
export type ErrorLogSource = "client" | "server"

export type ErrorLog = {
  id: string
  level: ErrorLogLevel
  source: ErrorLogSource
  message: string
  stack: string | null
  context: string | null
  url: string | null
  userAgent: string | null
  userId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export type ErrorLogRow = {
  id: string
  level: ErrorLogLevel
  source: ErrorLogSource
  message: string
  stack: string | null
  context: string | null
  url: string | null
  user_agent: string | null
  user_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export function mapErrorLogRow(row: ErrorLogRow): ErrorLog {
  return {
    id: row.id,
    level: row.level,
    source: row.source,
    message: row.message,
    stack: row.stack,
    context: row.context,
    url: row.url,
    userAgent: row.user_agent,
    userId: row.user_id,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  }
}
