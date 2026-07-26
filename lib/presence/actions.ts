"use server"

import { isUuid } from "@/lib/messages/format"
import { profileIsOnline } from "@/lib/presence/is-online"
import { createClient } from "@/lib/supabase/server"

export type PresenceResult = { ok: true } | { ok: false; error: string }

export type ProfileOnlineResult =
  | { ok: true; online: boolean }
  | { ok: false; error: string }

export async function touchPresence(): Promise<PresenceResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc("touch_last_active")

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}

export async function getProfileOnline(
  profileId: string,
): Promise<ProfileOnlineResult> {
  try {
    if (!isUuid(profileId)) {
      return { ok: true, online: false }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Unauthorized" }
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("last_active_at")
      .eq("id", profileId)
      .eq("status", "active")
      .maybeSingle()

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, online: profileIsOnline(data?.last_active_at ?? null) }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}

export async function clearPresence(): Promise<PresenceResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc("clear_last_active")

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}
