import { isUuid } from "@/lib/messages/format"
import { createAdminClient } from "@/lib/supabase/admin"

import type {
  CreateNotificationInput,
  CreateNotificationResult,
} from "@/lib/notifications/create-notification-types"

export async function persistNotification(
  input: CreateNotificationInput,
): Promise<
  | (CreateNotificationResult & { ok: true; kind: string; title: string; body: string })
  | Extract<CreateNotificationResult, { ok: false }>
> {
  if (!isUuid(input.userId)) {
    return { ok: false, error: "Invalid user." }
  }

  const kind = input.kind.trim()
  const title = input.title.trim()
  const body = input.body.trim()

  if (!kind || !title || !body) {
    return { ok: false, error: "Kind, title, and body are required." }
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      kind,
      title,
      body,
      data: input.data ?? {},
    })
    .select("id")
    .single()

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, id: data.id, kind, title, body }
}
