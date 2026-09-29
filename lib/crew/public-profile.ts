import {
  MEMBER_PROFILE_SELECT,
  TOUR_CREDIT_SELECT,
  sortTourCreditRowsByStartDateDesc,
  toPersonFromProfile,
  toTourCreditsFromRows,
  type MemberProfileRow,
  type TourCreditRow,
} from "@/lib/account/profile-data"
import type { PublicCrewProfile } from "@/lib/crew/build-resume-data"
import { createAdminClient } from "@/lib/supabase/admin"

export type { CrewResumeData, PublicCrewProfile } from "@/lib/crew/build-resume-data"
export { buildCrewResumeData } from "@/lib/crew/build-resume-data"

function normalizeHandle(handle: string): string {
  return handle.trim().toLowerCase()
}

async function fetchPublicProfileByHandle(
  handle: string,
): Promise<PublicCrewProfile | null> {
  const admin = createAdminClient()
  const normalized = normalizeHandle(handle)

  const { data: profile, error } = await admin
    .from("profiles")
    .select(MEMBER_PROFILE_SELECT)
    .eq("status", "active")
    .ilike("handle", normalized)
    .maybeSingle()

  if (error || !profile) {
    return null
  }

  const row = profile as unknown as MemberProfileRow
  const resolvedHandle = row.handle?.trim()
  if (!resolvedHandle || normalizeHandle(resolvedHandle) !== normalized) {
    return null
  }

  const { data: creditRows, error: creditsError } = await admin
    .from("tour_credits")
    .select(TOUR_CREDIT_SELECT)
    .eq("profile_id", row.id)

  if (creditsError) {
    return null
  }

  const tourCredits = toTourCreditsFromRows(
    sortTourCreditRowsByStartDateDesc(
      (creditRows ?? []) as unknown as TourCreditRow[],
    ),
  )

  const [creditCountResult, vouchCountResult] = await Promise.all([
    admin
      .from("tour_credits")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", row.id),
    admin
      .from("profile_vouches")
      .select("id", { count: "exact", head: true })
      .eq("vouchee_id", row.id),
  ])

  return {
    handle: resolvedHandle,
    updatedAt: row.updated_at,
    person: toPersonFromProfile(row, {
      tourCreditCount: creditCountResult.count ?? tourCredits.length,
      vouchCount: vouchCountResult.count ?? 0,
    }),
    tourCredits,
  }
}

export async function getPublicCrewProfile(
  handle: string,
): Promise<PublicCrewProfile | null> {
  return fetchPublicProfileByHandle(handle)
}

export async function getPublicCrewProfileById(
  profileId: string,
): Promise<PublicCrewProfile | null> {
  const admin = createAdminClient()

  const { data: profile, error } = await admin
    .from("profiles")
    .select("handle")
    .eq("id", profileId)
    .eq("status", "active")
    .maybeSingle()

  if (error || !profile) {
    return null
  }

  const handle = profile.handle?.trim()
  if (!handle) {
    return null
  }

  return fetchPublicProfileByHandle(handle)
}
