"use server"

import { revalidatePath } from "next/cache"

import {
  MEMBER_PROFILE_SELECT,
  TOUR_CREDIT_SELECT,
  sortTourCreditRowsByStartDateDesc,
  type ConnectionStatus,
  type MemberProfileRow,
  type PersonDirectoryExtras,
  type TourCreditRow,
  toPersonFromProfile,
  toTourCreditsFromRows,
} from "@/lib/account/profile-data"
import { AuthError } from "@/lib/auth/require-admin"
import { personToSharePayload } from "@/lib/messages/member-share"
import type { MemberSharePayload } from "@/lib/messages-data"
import type { Person, TourCredit } from "@/lib/people-data"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type ActionError = { ok: false; error: string }

const RESUME_BUCKET = "resumes"

export type MemberResumeResult =
  | { ok: true; url: string; fileName: string }
  | ActionError

function normalizeResumeFileName(name: string | null | undefined): string {
  const trimmed = name?.trim()
  return trimmed || "resume.pdf"
}

export type ListDirectoryMembersResult =
  | { ok: true; people: Person[] }
  | ActionError & { people: Person[] }

export type GetMemberResult =
  | { ok: true; person: Person; tourCredits: TourCredit[] }
  | ActionError

export type ConnectionActionResult = { ok: true; connected: boolean } | ActionError

type ConnectionRow = {
  requester_id: string
  recipient_id: string
  status: "pending" | "accepted" | "ignored"
}

function actionError(error: unknown): ActionError {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message }
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Something went wrong." }
}

async function requireUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthError("You must be signed in.")
  }

  return user.id
}

function resolveConnectionStatus(
  userId: string,
  profileId: string,
  connections: ConnectionRow[],
): ConnectionStatus {
  for (const connection of connections) {
    const involvesProfile =
      (connection.requester_id === userId &&
        connection.recipient_id === profileId) ||
      (connection.requester_id === profileId &&
        connection.recipient_id === userId)

    if (!involvesProfile) continue

    if (connection.status === "accepted") {
      return "connected"
    }

    if (connection.status === "pending") {
      return connection.requester_id === userId
        ? "pending_sent"
        : "pending_received"
    }
  }

  return "none"
}

async function fetchDirectoryExtras(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profileIds: string[],
): Promise<Map<string, PersonDirectoryExtras>> {
  const extras = new Map<string, PersonDirectoryExtras>()
  if (profileIds.length === 0) return extras

  const [creditCountsResult, vouchCountsResult, connectionsResult] =
    await Promise.all([
      supabase.from("tour_credits").select("profile_id").in("profile_id", profileIds),
      supabase.from("profile_vouches").select("vouchee_id").in("vouchee_id", profileIds),
      supabase
        .from("member_connections")
        .select("requester_id, recipient_id, status")
        .or(
          `requester_id.eq.${userId},recipient_id.eq.${userId}`,
        ),
    ])

  const creditCountMap = new Map<string, number>()
  for (const row of creditCountsResult.data ?? []) {
    const id = row.profile_id as string
    creditCountMap.set(id, (creditCountMap.get(id) ?? 0) + 1)
  }

  const vouchCountMap = new Map<string, number>()
  for (const row of vouchCountsResult.data ?? []) {
    const id = row.vouchee_id as string
    vouchCountMap.set(id, (vouchCountMap.get(id) ?? 0) + 1)
  }

  const connections = (connectionsResult.data ?? []) as ConnectionRow[]

  for (const profileId of profileIds) {
    extras.set(profileId, {
      tourCreditCount: creditCountMap.get(profileId) ?? 0,
      vouchCount: vouchCountMap.get(profileId) ?? 0,
      connectionStatus: resolveConnectionStatus(userId, profileId, connections),
    })
  }

  return extras
}

export async function listDirectoryMembers(): Promise<ListDirectoryMembersResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select(MEMBER_PROFILE_SELECT)
      .eq("status", "active")
      .order("full_name", { ascending: true })

    if (error) {
      return { ok: false, error: error.message, people: [] }
    }

    const rows = (data ?? []) as unknown as MemberProfileRow[]
    const profileIds = rows.map((row) => row.id)
    const extrasMap = await fetchDirectoryExtras(supabase, userId, profileIds)

    const people = rows.map((row) =>
      toPersonFromProfile(row, extrasMap.get(row.id)),
    )

    return { ok: true, people }
  } catch (error) {
    const result = actionError(error)
    return { ...result, people: [] }
  }
}

export async function getMemberById(profileId: string): Promise<GetMemberResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const profilePromise = supabase
      .from("profiles")
      .select(MEMBER_PROFILE_SELECT)
      .eq("id", profileId)
      .eq("status", "active")
      .maybeSingle()

    const creditsPromise = supabase
      .from("tour_credits")
      .select(TOUR_CREDIT_SELECT)
      .eq("profile_id", profileId)

    const extrasPromise = fetchDirectoryExtras(supabase, userId, [profileId])

    const [profileResult, creditsResult, extrasMap] = await Promise.all([
      profilePromise,
      creditsPromise,
      extrasPromise,
    ])

    if (profileResult.error) {
      return { ok: false, error: profileResult.error.message }
    }

    if (!profileResult.data) {
      return { ok: false, error: "Member not found." }
    }

    const row = profileResult.data as unknown as MemberProfileRow
    const creditRows = sortTourCreditRowsByStartDateDesc(
      (creditsResult.data ?? []) as unknown as TourCreditRow[],
    )

    // Fetch which credits the current user has already vouched for
    const creditIds = creditRows.map((c) => c.id)
    let vouchedCreditIds: Set<string> | undefined

    if (creditIds.length > 0) {
      const { data: myVouches } = await supabase
        .from("credit_vouches")
        .select("credit_id")
        .in("credit_id", creditIds)
        .eq("voucher_id", userId)
      if (myVouches) {
        vouchedCreditIds = new Set(myVouches.map((v) => v.credit_id as string))
      }
    }

    const tourCredits = toTourCreditsFromRows(creditRows, vouchedCreditIds)

    const extras = extrasMap.get(profileId) ?? {
      tourCreditCount: tourCredits.length,
      vouchCount: 0,
      connectionStatus: "none" as ConnectionStatus,
    }

    if (extras.tourCreditCount === 0 && tourCredits.length > 0) {
      extras.tourCreditCount = tourCredits.length
    }

    return {
      ok: true,
      person: toPersonFromProfile(row, extras),
      tourCredits,
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function getMemberResumeSignedUrl(
  profileId: string,
): Promise<MemberResumeResult> {
  try {
    await requireUserId()
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("resume_url, resume_filename, status")
      .eq("id", profileId)
      .maybeSingle()

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    if (!profile || profile.status !== "active") {
      return { ok: false, error: "Member not found." }
    }

    const resumePath = profile.resume_url?.trim()
    if (!resumePath) {
      return { ok: false, error: "No resume on file." }
    }

    const fileName = normalizeResumeFileName(profile.resume_filename)
    const admin = createAdminClient()
    const { data: signed, error: signError } = await admin.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(resumePath, 60 * 10, { download: fileName })

    if (signError || !signed?.signedUrl) {
      return {
        ok: false,
        error: signError?.message || "Could not download resume.",
      }
    }

    return { ok: true, url: signed.signedUrl, fileName }
  } catch (error) {
    return actionError(error)
  }
}

export async function getMemberSharePayloadFromProfile(
  profileId: string,
): Promise<{ ok: true; memberShare: MemberSharePayload } | ActionError> {
  const result = await getMemberById(profileId)
  if (!result.ok) return result
  return {
    ok: true,
    memberShare: {
      ...personToSharePayload(result.person),
      skills: result.person.skills,
    },
  }
}

function revalidatePeoplePaths() {
  revalidatePath("/people")
  revalidatePath("/messages")
  revalidatePath("/groups")
}

export async function requestConnection(
  recipientId: string,
): Promise<ConnectionActionResult> {
  try {
    const userId = await requireUserId()
    if (userId === recipientId) {
      return { ok: false, error: "You cannot connect with yourself." }
    }

    const supabase = await createClient()

    const { data: existingRows, error: existingError } = await supabase
      .from("member_connections")
      .select("requester_id, recipient_id, status")
      .or(
        `and(requester_id.eq.${userId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${userId})`,
      )

    if (existingError) {
      return { ok: false, error: existingError.message }
    }

    const existing = (existingRows ?? []) as ConnectionRow[]

    for (const connection of existing) {
      if (connection.status === "accepted") {
        return { ok: true, connected: true }
      }

      if (
        connection.status === "pending" &&
        connection.requester_id === recipientId &&
        connection.recipient_id === userId
      ) {
        const { error: updateError } = await supabase
          .from("member_connections")
          .update({ status: "accepted" })
          .eq("requester_id", recipientId)
          .eq("recipient_id", userId)

        if (updateError) {
          return { ok: false, error: updateError.message }
        }

        revalidatePeoplePaths()
        return { ok: true, connected: true }
      }
    }

    const { error: insertError } = await supabase
      .from("member_connections")
      .insert({
        requester_id: userId,
        recipient_id: recipientId,
        status: "accepted",
      })

    if (insertError) {
      return { ok: false, error: insertError.message }
    }

    revalidatePeoplePaths()
    return { ok: true, connected: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeConnection(
  recipientId: string,
): Promise<ConnectionActionResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("member_connections")
      .delete()
      .or(
        `and(requester_id.eq.${userId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${userId})`,
      )

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePeoplePaths()
    return { ok: true, connected: false }
  } catch (error) {
    return actionError(error)
  }
}

export async function toggleConnection(
  recipientId: string,
  connected: boolean,
): Promise<ConnectionActionResult> {
  if (connected) {
    return removeConnection(recipientId)
  }
  return requestConnection(recipientId)
}
