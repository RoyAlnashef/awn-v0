type ActionError = { ok: false; error: string }

export type CreateNotificationResult =
  | { ok: true; id: string }
  | ActionError

export type CreateNotificationInput = {
  userId: string
  kind: string
  title: string
  body: string
  data?: Record<string, unknown>
}
