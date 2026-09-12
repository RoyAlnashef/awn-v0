import { createClient } from "@/lib/supabase/server"
import type { DbUserRole, DbUserStatus } from "@/lib/users-data"

export type AdminProfile = {
  id: string
  role: DbUserRole
  status: DbUserStatus
  email: string
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: "unauthorized" | "forbidden" = "unauthorized",
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export function canAccessAdmin(
  profile:
    | {
        role: DbUserRole
        status: DbUserStatus
      }
    | null
    | undefined,
): boolean {
  return (
    !!profile &&
    profile.status === "active" &&
    (profile.role === "owner" || profile.role === "admin")
  )
}

export function canPostJobs(
  profile:
    | {
        role: DbUserRole
        status: DbUserStatus
      }
    | null
    | undefined,
): boolean {
  return (
    !!profile &&
    profile.status === "active" &&
    (profile.role === "owner" ||
      profile.role === "admin" ||
      profile.role === "employer")
  )
}

/**
 * Ensures the current session belongs to an active Owner or Admin.
 * Uses the cookie-based server client (RLS applies).
 */
export async function requireAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  profile: AdminProfile
}> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new AuthError("You must be signed in to manage users.", "unauthorized")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, status, email")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new AuthError(profileError.message, "forbidden")
  }

  if (!canAccessAdmin(profile)) {
    throw new AuthError(
      "Only active Owners and Admins can manage users.",
      "forbidden",
    )
  }

  return {
    supabase,
    userId: user.id,
    profile: profile as AdminProfile,
  }
}
