import { createClient } from "@/lib/supabase/server"
import { AuthError, canAccessAdmin } from "@/lib/auth/require-admin"

/**
 * Ensures the current session may edit the target user's profile (self or admin).
 */
export async function requireProfileEditor(targetUserId: string): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  isAdmin: boolean
}> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new AuthError("You must be signed in.", "unauthorized")
  }

  if (user.id === targetUserId) {
    return { supabase, userId: user.id, isAdmin: false }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new AuthError(profileError.message, "forbidden")
  }

  if (!canAccessAdmin(profile)) {
    throw new AuthError(
      "You can only update your own profile.",
      "forbidden",
    )
  }

  return { supabase, userId: user.id, isAdmin: true }
}
