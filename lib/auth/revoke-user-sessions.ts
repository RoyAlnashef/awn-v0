import { createAdminClient } from "@/lib/supabase/admin"

export type RevokeSessionsResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Invalidates all refresh tokens for the auth user (all devices).
 * Requires service role; call only from server actions / route handlers.
 */
export async function revokeAllUserSessions(
  userId: string,
): Promise<RevokeSessionsResult> {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.signOut(userId, "global")

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
