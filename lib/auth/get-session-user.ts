import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import { canAccessAdmin } from "@/lib/auth/require-admin"
import { profileIsOnline } from "@/lib/presence/is-online"
import { initials } from "@/lib/users-data"

export type SessionUser = {
  id: string
  email: string
  name: string
  title: string
  avatarUrl?: string
  initials: string
  canAccessAdmin: boolean
  isApproved: boolean
  appearOffline: boolean
  availableForWork: boolean
  online: boolean
}

/**
 * Current auth user + profile fields for chrome (header, etc.).
 * Cached per request via React.cache.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, email, title, avatar_url, role, status, is_approved, appear_offline, last_active_at, availability",
    )
    .eq("id", user.id)
    .maybeSingle()

  const email = profile?.email || user.email || ""
  const name =
    profile?.full_name?.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    email.split("@")[0] ||
    "Member"

  const appearOffline = profile?.appear_offline ?? false

  return {
    id: user.id,
    email,
    name,
    title: profile?.title?.trim() || "",
    avatarUrl: profile?.avatar_url ?? undefined,
    initials: initials(name),
    canAccessAdmin: canAccessAdmin(profile),
    isApproved: profile?.is_approved ?? false,
    appearOffline,
    availableForWork: profile?.availability === "available_now",
    online: profileIsOnline(
      profile?.last_active_at ?? null,
      appearOffline,
    ),
  }
})
