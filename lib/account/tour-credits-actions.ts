"use server"

import { revalidatePath } from "next/cache"

import {
  TOUR_CREDIT_SELECT,
  tourCreditRowToAccountCredit,
  venueTierToDbValue,
  type TourCreditRow,
} from "@/lib/account/profile-data"
import { AuthError } from "@/lib/auth/require-admin"
import { requireProfileEditor } from "@/lib/auth/require-profile-editor"
import type { AccountTourCredit } from "@/lib/account-profile"
import { createClient } from "@/lib/supabase/server"

export type TourCreditsActionResult =
  | { ok: true; credits: AccountTourCredit[] }
  | { ok: false; error: string }

function actionError(error: unknown): { ok: false; error: string } {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message }
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Something went wrong." }
}

function revalidateTourCreditPaths() {
  revalidatePath("/account/tour-credits")
  revalidatePath("/people")
  revalidatePath("/account", "layout")
}

export async function listMemberTourCredits(
  profileId: string,
): Promise<TourCreditsActionResult> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("tour_credits")
      .select(TOUR_CREDIT_SELECT)
      .eq("profile_id", profileId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      return { ok: false, error: error.message }
    }

    const credits = ((data ?? []) as unknown as TourCreditRow[]).map(
      tourCreditRowToAccountCredit,
    )

    return { ok: true, credits }
  } catch (error) {
    return actionError(error)
  }
}

export async function createTourCredit(
  profileId: string,
  input: {
    title: string
    artist?: string
    role: string
    venueTier: string
    years: string
  },
): Promise<TourCreditsActionResult> {
  try {
    await requireProfileEditor(profileId)
    const supabase = await createClient()

    const { count, error: countError } = await supabase
      .from("tour_credits")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)

    if (countError) {
      return { ok: false, error: countError.message }
    }

    const { error } = await supabase.from("tour_credits").insert({
      profile_id: profileId,
      title: input.title.trim() || "New Tour Credit",
      artist: input.artist?.trim() || null,
      role: input.role.trim() || "Tour Manager",
      venue_tier: venueTierToDbValue(input.venueTier),
      years: input.years.trim() || null,
      sort_order: count ?? 0,
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateTourCreditPaths()
    return listMemberTourCredits(profileId)
  } catch (error) {
    return actionError(error)
  }
}

export async function deleteTourCredit(
  profileId: string,
  creditId: string,
): Promise<TourCreditsActionResult> {
  try {
    await requireProfileEditor(profileId)
    const supabase = await createClient()

    const { error } = await supabase
      .from("tour_credits")
      .delete()
      .eq("id", creditId)
      .eq("profile_id", profileId)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateTourCreditPaths()
    return listMemberTourCredits(profileId)
  } catch (error) {
    return actionError(error)
  }
}

export async function updateTourCredit(
  profileId: string,
  creditId: string,
  input: Partial<{
    title: string
    artist: string
    role: string
    venueTier: string
    years: string
  }>,
): Promise<TourCreditsActionResult> {
  try {
    await requireProfileEditor(profileId)
    const supabase = await createClient()

    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title.trim()
    if (input.artist !== undefined) patch.artist = input.artist.trim() || null
    if (input.role !== undefined) patch.role = input.role.trim()
    if (input.venueTier !== undefined) {
      patch.venue_tier = venueTierToDbValue(input.venueTier)
    }
    if (input.years !== undefined) patch.years = input.years.trim() || null

    const { error } = await supabase
      .from("tour_credits")
      .update(patch)
      .eq("id", creditId)
      .eq("profile_id", profileId)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateTourCreditPaths()
    return listMemberTourCredits(profileId)
  } catch (error) {
    return actionError(error)
  }
}
