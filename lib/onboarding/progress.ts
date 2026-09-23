import { cache } from "react"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { createClient } from "@/lib/supabase/server"
import type { ChecklistItemId } from "@/lib/now/now-data"

export type OnboardingStatus = Record<ChecklistItemId, boolean>

export type OnboardingSignals = {
  status: OnboardingStatus
  dismissed: boolean
}

const EMPTY_STATUS: OnboardingStatus = {
  profile: false,
  "join-group": false,
  connect: false,
  invite: false,
  "help-now": false,
  "create-job": false,
  "apply-job": false,
}

/**
 * Derives Now getting-started checklist completion for the current member from
 * existing Supabase data (no dedicated tracking table). Cached per request.
 */
export const getOnboardingSignals = cache(
  async (): Promise<OnboardingSignals> => {
    const user = await getSessionUser()
    if (!user) return { status: { ...EMPTY_STATUS }, dismissed: false }

    const supabase = await createClient()
    const userId = user.id

    const [
      savedRes,
      dismissedRes,
      roomsRes,
      connectionsRes,
      invitesRes,
      helpNowRes,
      jobsRes,
      applicationsRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("profile_saved_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("onboarding_dismissed_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("room_memberships")
        .select("room_id", { count: "exact", head: true })
        .eq("profile_id", userId),
      supabase
        .from("member_connections")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`),
      supabase
        .from("member_invites")
        .select("id", { count: "exact", head: true })
        .eq("inviter_id", userId),
      supabase
        .from("job_postings")
        .select("id", { count: "exact", head: true })
        .eq("poster_id", userId)
        .eq("kind", "urgent")
        .neq("status", "deleted"),
      supabase
        .from("job_postings")
        .select("id", { count: "exact", head: true })
        .eq("poster_id", userId)
        .neq("status", "deleted"),
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true })
        .eq("applicant_id", userId)
        .neq("status", "withdrawn"),
    ])

    return {
      status: {
        profile: Boolean(savedRes.data?.profile_saved_at),
        "join-group": (roomsRes.count ?? 0) > 0,
        connect: (connectionsRes.count ?? 0) > 0,
        invite: (invitesRes.count ?? 0) > 0,
        "help-now": (helpNowRes.count ?? 0) > 0,
        "create-job": (jobsRes.count ?? 0) > 0,
        "apply-job": (applicationsRes.count ?? 0) > 0,
      },
      dismissed: Boolean(dismissedRes.data?.onboarding_dismissed_at),
    }
  },
)
