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
import { getSessionUser } from "@/lib/auth/get-session-user"
import { createNotification } from "@/lib/notifications/actions"
import type { AccountTourCredit } from "@/lib/account-profile"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { isUuid } from "@/lib/messages/format"

export type TourCreditsActionResult =
  | { ok: true; credits: AccountTourCredit[] }
  | { ok: false; error: string }

export type VouchActionResult =
  | { ok: true }
  | { ok: false; error: string }

export type HasVouchedResult =
  | { ok: true; hasVouched: boolean; vouchCount: number }
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

function validateTourCreditDates(input: {
  startedAt?: string | null
  endedAt?: string | null
  isCurrent?: boolean
}): { ok: true } | { ok: false; error: string } {
  const isCurrent = input.isCurrent ?? false
  const startedAt = input.startedAt?.trim() || null
  const endedAt = input.endedAt?.trim() || null

  if (!startedAt) {
    return { ok: false, error: "Start date is required." }
  }
  if (!isCurrent && !endedAt) {
    return { ok: false, error: "End date is required." }
  }
  if (!isCurrent && endedAt && endedAt <= startedAt) {
    return { ok: false, error: "End date must be after start date." }
  }
  return { ok: true }
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
    venueTier?: string
    years?: string
    engagementType?: string | null
    startedAt?: string | null
    endedAt?: string | null
    isCurrent?: boolean
    notes?: string | null
  },
): Promise<TourCreditsActionResult> {
  try {
    await requireProfileEditor(profileId)

    const dateValidation = validateTourCreditDates(input)
    if (!dateValidation.ok) {
      return dateValidation
    }

    const supabase = await createClient()

    const { count, error: countError } = await supabase
      .from("tour_credits")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)

    if (countError) {
      return { ok: false, error: countError.message }
    }

    // Derive years text from dates if not supplied
    const yearsText =
      input.years?.trim() ||
      buildYearsText(input.startedAt ?? null, input.endedAt ?? null, input.isCurrent ?? false) ||
      null

    const { error } = await supabase.from("tour_credits").insert({
      profile_id: profileId,
      title: input.title.trim() || "New Tour Credit",
      artist: input.artist?.trim() || null,
      role: input.role.trim() || "Tour Manager",
      venue_tier: input.venueTier ? venueTierToDbValue(input.venueTier) : null,
      years: yearsText,
      sort_order: count ?? 0,
      engagement_type: input.engagementType?.trim() || null,
      started_at: input.startedAt || null,
      ended_at: input.isCurrent ? null : (input.endedAt || null),
      is_current: input.isCurrent ?? false,
      notes: input.notes?.trim() || null,
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
    engagementType: string | null
    startedAt: string | null
    endedAt: string | null
    isCurrent: boolean
    notes: string | null
  }>,
): Promise<TourCreditsActionResult> {
  try {
    await requireProfileEditor(profileId)

    if (
      input.startedAt !== undefined ||
      input.endedAt !== undefined ||
      input.isCurrent !== undefined
    ) {
      const dateValidation = validateTourCreditDates({
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        isCurrent: input.isCurrent,
      })
      if (!dateValidation.ok) {
        return dateValidation
      }
    }

    const supabase = await createClient()

    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title.trim()
    if (input.artist !== undefined) patch.artist = input.artist.trim() || null
    if (input.role !== undefined) patch.role = input.role.trim()
    if (input.venueTier !== undefined) {
      patch.venue_tier = venueTierToDbValue(input.venueTier)
    }
    if (input.engagementType !== undefined) {
      patch.engagement_type = input.engagementType?.trim() || null
    }
    if (input.startedAt !== undefined) patch.started_at = input.startedAt || null
    if (input.isCurrent !== undefined) {
      patch.is_current = input.isCurrent
      if (input.isCurrent) patch.ended_at = null
    }
    if (input.endedAt !== undefined && !input.isCurrent) {
      patch.ended_at = input.endedAt || null
    }
    if (input.notes !== undefined) patch.notes = input.notes?.trim() || null

    // Rebuild years text if date fields changed
    if (
      input.startedAt !== undefined ||
      input.endedAt !== undefined ||
      input.isCurrent !== undefined
    ) {
      const isCurrent = input.isCurrent ?? false
      patch.years =
        input.years?.trim() ||
        buildYearsText(
          input.startedAt ?? null,
          input.endedAt ?? null,
          isCurrent,
        ) ||
        null
    } else if (input.years !== undefined) {
      patch.years = input.years.trim() || null
    }

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

// ---------------------------------------------------------------------------
// Vouching
// ---------------------------------------------------------------------------

/**
 * Returns whether the current user has vouched for a specific tour credit,
 * along with the total vouch count for that credit.
 */
export async function hasCreditVouch(
  creditId: string,
): Promise<HasVouchedResult> {
  try {
    if (!isUuid(creditId)) {
      return { ok: false, error: "Invalid credit." }
    }

    const user = await getSessionUser()
    if (!user) {
      return { ok: true, hasVouched: false, vouchCount: 0 }
    }

    const supabase = await createClient()

    const [countResult, myVouchResult] = await Promise.all([
      supabase
        .from("credit_vouches")
        .select("id", { count: "exact", head: true })
        .eq("credit_id", creditId),
      supabase
        .from("credit_vouches")
        .select("id")
        .eq("credit_id", creditId)
        .eq("voucher_id", user.id)
        .maybeSingle(),
    ])

    if (countResult.error) {
      return { ok: false, error: countResult.error.message }
    }

    return {
      ok: true,
      hasVouched: !!myVouchResult.data,
      vouchCount: countResult.count ?? 0,
    }
  } catch (error) {
    return actionError(error)
  }
}

/**
 * Vouches for a tour credit. Sends a notification to the credit owner.
 * Idempotent — if already vouched, returns ok without error.
 */
export async function createCreditVouch(
  creditId: string,
): Promise<VouchActionResult> {
  try {
    if (!isUuid(creditId)) {
      return { ok: false, error: "Invalid credit." }
    }

    const user = await getSessionUser()
    if (!user) {
      return { ok: false, error: "You must be signed in to vouch." }
    }

    const supabase = await createClient()

    // Fetch the credit to get owner info and prevent self-vouch
    const { data: credit, error: fetchError } = await supabase
      .from("tour_credits")
      .select("id, profile_id, title, profiles!inner(id, full_name, user_id:id)")
      .eq("id", creditId)
      .single()

    if (fetchError || !credit) {
      return { ok: false, error: "Tour credit not found." }
    }

    if (credit.profile_id === user.id) {
      return { ok: false, error: "You cannot vouch for your own credit." }
    }

    // Insert vouch (upsert-style: unique constraint handles duplicates)
    const { error: insertError } = await supabase
      .from("credit_vouches")
      .insert({ credit_id: creditId, voucher_id: user.id })

    if (insertError) {
      // Unique violation = already vouched, treat as success
      if (insertError.code === "23505") {
        return { ok: true }
      }
      return { ok: false, error: insertError.message }
    }

    // Notify the credit owner
    const voucherName = user.email?.split("@")[0] ?? "A member"

    await createNotification({
      userId: credit.profile_id,
      kind: "credit_vouched",
      title: "Someone vouched for your tour credit",
      body: `${voucherName} vouched for your credit: ${credit.title}`,
      data: { creditId, voucherId: user.id },
    })

    revalidateTourCreditPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

/**
 * Removes the current user's vouch from a tour credit.
 */
export async function deleteCreditVouch(
  creditId: string,
): Promise<VouchActionResult> {
  try {
    if (!isUuid(creditId)) {
      return { ok: false, error: "Invalid credit." }
    }

    const user = await getSessionUser()
    if (!user) {
      return { ok: false, error: "You must be signed in." }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("credit_vouches")
      .delete()
      .eq("credit_id", creditId)
      .eq("voucher_id", user.id)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateTourCreditPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildYearsText(
  startedAt: string | null,
  endedAt: string | null,
  isCurrent: boolean,
): string {
  if (!startedAt) return ""
  const startYear = new Date(startedAt).getFullYear()
  if (isCurrent) return `${startYear}–present`
  if (!endedAt) return String(startYear)
  const endYear = new Date(endedAt).getFullYear()
  if (startYear === endYear) return String(startYear)
  return `${startYear}–${String(endYear).slice(-2)}`
}
