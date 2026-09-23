"use server"

import { revalidatePath } from "next/cache"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { createClient } from "@/lib/supabase/server"

export type DismissOnboardingResult = { ok: true } | { ok: false; error: string }

/**
 * Persists per-user dismissal of the Now getting-started checklist.
 */
export async function dismissOnboarding(): Promise<DismissOnboardingResult> {
  const user = await getSessionUser()
  if (!user) return { ok: false, error: "You must be signed in." }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_dismissed_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return { ok: false, error: "Could not dismiss. Please try again." }

  revalidatePath("/now")
  return { ok: true }
}
