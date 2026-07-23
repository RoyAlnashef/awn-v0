"use server"

import { createClient } from "@/lib/supabase/server"

export type PresenceResult = { ok: true } | { ok: false; error: string }

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
