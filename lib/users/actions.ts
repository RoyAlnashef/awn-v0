"use server"

import { revalidatePath } from "next/cache"

import { revokeAllUserSessions } from "@/lib/auth/revoke-user-sessions"
import { AuthError, requireAdmin } from "@/lib/auth/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  profileToAdminUser,
  toDbRole,
  toDbStatus,
  type AdminUser,
  type ProfileRow,
  type UserRole,
  type UserStatus,
} from "@/lib/users-data"

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

export type ListUsersResult =
  | { ok: true; users: AdminUser[] }
  | { ok: false; error: string; users: AdminUser[] }

function actionError(error: unknown): ActionResult {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message }
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Something went wrong." }
}

async function revokeSessionsForSuspendedUsers(
  userIds: string[],
): Promise<ActionResult> {
  const results = await Promise.all(
    userIds.map((id) => revokeAllUserSessions(id)),
  )
  const failed = results.find((r) => !r.ok)
  if (failed && !failed.ok) {
    return {
      ok: false,
      error: `User suspended but session revocation failed: ${failed.error}`,
    }
  }
  return { ok: true }
}

const PROFILE_COLUMNS =
  "id, full_name, email, avatar_url, title, role, status, two_factor_enabled, last_active_at" as const

export async function listUsers(): Promise<ListUsersResult> {
  try {
    const { supabase } = await requireAdmin()
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("created_at", { ascending: false })

    if (error) {
      return { ok: false, error: error.message, users: [] }
    }

    const users = ((data ?? []) as ProfileRow[]).map(profileToAdminUser)
    return { ok: true, users }
  } catch (error) {
    const message =
      error instanceof AuthError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to load users."
    return { ok: false, error: message, users: [] }
  }
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  role?: UserRole
}): Promise<ActionResult> {
  try {
    await requireAdmin()

    const name = input.name.trim()
    const email = input.email.trim().toLowerCase()
    const password = input.password
    const role = input.role ?? "Member"

    if (!name) return { ok: false, error: "Name is required." }
    if (!email || !email.includes("@")) {
      return { ok: false, error: "A valid email is required." }
    }
    if (!password || password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." }
    }

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    const userId = data.user?.id
    if (!userId) {
      return { ok: false, error: "User created but no user id was returned." }
    }

    // Trigger usually creates the row; upsert so create still works if it races.
    const { error: updateError } = await admin.from("profiles").upsert({
      id: userId,
      full_name: name,
      email,
      role: toDbRole(role),
      status: toDbStatus("Active"),
    })

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateUser(
  userId: string,
  input: {
    name: string
    email: string
    title: string
    role: UserRole
    password?: string
  },
): Promise<ActionResult> {
  try {
    const { supabase, userId: actorId } = await requireAdmin()

    const name = input.name.trim()
    const email = input.email.trim().toLowerCase()
    const title = input.title.trim()
    const role = input.role
    const password = input.password?.trim() ?? ""

    if (!name) return { ok: false, error: "Name is required." }
    if (!email || !email.includes("@")) {
      return { ok: false, error: "A valid email is required." }
    }
    if (password && password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." }
    }

    if (userId === actorId && role !== "Owner" && role !== "Admin") {
      return {
        ok: false,
        error: "You cannot remove your own admin access.",
      }
    }

    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single()

    if (fetchError) return { ok: false, error: fetchError.message }

    const emailChanged = existing?.email?.toLowerCase() !== email

    const admin = createAdminClient()
    const authUpdate: {
      email?: string
      password?: string
      user_metadata: { full_name: string }
    } = {
      user_metadata: { full_name: name },
    }
    if (emailChanged) authUpdate.email = email
    if (password) authUpdate.password = password

    const { error: authError } = await admin.auth.admin.updateUserById(
      userId,
      authUpdate,
    )
    if (authError) return { ok: false, error: authError.message }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        email,
        title: title || null,
        role: toDbRole(role),
      })
      .eq("id", userId)

    if (error) return { ok: false, error: error.message }

    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<ActionResult> {
  try {
    const { supabase, userId: actorId } = await requireAdmin()

    if (userId === actorId && role !== "Owner" && role !== "Admin") {
      return {
        ok: false,
        error: "You cannot remove your own admin access.",
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: toDbRole(role) })
      .eq("id", userId)

    if (error) return { ok: false, error: error.message }

    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
): Promise<ActionResult> {
  try {
    const { supabase, userId: actorId } = await requireAdmin()

    if (userId === actorId && status === "Suspended") {
      return { ok: false, error: "You cannot suspend your own account." }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ status: toDbStatus(status) })
      .eq("id", userId)

    if (error) return { ok: false, error: error.message }

    if (status === "Suspended") {
      const revoked = await revokeSessionsForSuspendedUsers([userId])
      if (!revoked.ok) return revoked
    }

    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const { userId: actorId } = await requireAdmin()

    if (userId === actorId) {
      return { ok: false, error: "You cannot delete your own account." }
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(userId)

    if (error) return { ok: false, error: error.message }

    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function bulkUpdateRole(
  userIds: string[],
  role: UserRole,
): Promise<ActionResult> {
  try {
    const { supabase, userId: actorId } = await requireAdmin()
    const ids = [...new Set(userIds.filter(Boolean))]

    if (ids.length === 0) {
      return { ok: false, error: "No users selected." }
    }

    if (
      ids.includes(actorId) &&
      role !== "Owner" &&
      role !== "Admin"
    ) {
      return {
        ok: false,
        error: "Selection includes you — you cannot remove your own admin access.",
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: toDbRole(role) })
      .in("id", ids)

    if (error) return { ok: false, error: error.message }

    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function bulkUpdateStatus(
  userIds: string[],
  status: UserStatus,
): Promise<ActionResult> {
  try {
    const { supabase, userId: actorId } = await requireAdmin()
    const ids = [...new Set(userIds.filter(Boolean))]

    if (ids.length === 0) {
      return { ok: false, error: "No users selected." }
    }

    if (status === "Suspended" && ids.includes(actorId)) {
      return {
        ok: false,
        error: "Selection includes you — you cannot suspend your own account.",
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ status: toDbStatus(status) })
      .in("id", ids)

    if (error) return { ok: false, error: error.message }

    if (status === "Suspended") {
      const revoked = await revokeSessionsForSuspendedUsers(ids)
      if (!revoked.ok) return revoked
    }

    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function bulkDeleteUsers(userIds: string[]): Promise<ActionResult> {
  try {
    const { userId: actorId } = await requireAdmin()
    const ids = [...new Set(userIds.filter((id) => id && id !== actorId))]

    if (ids.length === 0) {
      return {
        ok: false,
        error: "No users selected (you cannot delete your own account).",
      }
    }

    const admin = createAdminClient()
    const failures: string[] = []

    for (const id of ids) {
      const { error } = await admin.auth.admin.deleteUser(id)
      if (error) failures.push(`${id}: ${error.message}`)
    }

    revalidatePath("/users")

    if (failures.length > 0) {
      return {
        ok: false,
        error: `Deleted with errors: ${failures.join("; ")}`,
      }
    }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
