"use server"

import { revalidatePath } from "next/cache"

import { AuthError } from "@/lib/auth/require-admin"
import { requireAdmin } from "@/lib/auth/require-admin"
import { membersAreBlocked } from "@/lib/moderation/blocks"
import type { BlockedMemberSummary, MemberReportRow } from "@/lib/moderation/data"
import {
  isMemberReportReason,
  type MemberReportReason,
} from "@/lib/moderation/report-reasons"
import { createClient } from "@/lib/supabase/server"

type ActionError = { ok: false; error: string }
type ActionOk = { ok: true }

export type SubmitMemberReportResult = ActionOk | ActionError

export type BlockMemberResult = ActionOk | ActionError

export type ModerationStateResult =
  | {
      ok: true
      isBlocked: boolean
      hasOpenReport: boolean
    }
  | ActionError

export type ListBlockedMembersResult =
  | { ok: true; members: BlockedMemberSummary[] }
  | ActionError

export type ListMemberReportsResult =
  | { ok: true; reports: MemberReportRow[] }
  | ActionError

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

async function disconnectMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  otherId: string,
) {
  await supabase
    .from("member_connections")
    .delete()
    .or(
      `and(requester_id.eq.${userId},recipient_id.eq.${otherId}),and(requester_id.eq.${otherId},recipient_id.eq.${userId})`,
    )
}

function revalidateModerationPaths() {
  revalidatePath("/people")
  revalidatePath("/now")
  revalidatePath("/messages")
  revalidatePath("/groups")
  revalidatePath("/settings/privacy")
  revalidatePath("/reports")
}

export async function getMemberModerationState(
  otherProfileId: string,
): Promise<ModerationStateResult> {
  try {
    const userId = await requireUserId()
    if (userId === otherProfileId) {
      return { ok: true, isBlocked: false, hasOpenReport: false }
    }

    const supabase = await createClient()

    const [blocked, openReportResult] = await Promise.all([
      membersAreBlocked(userId, otherProfileId),
      supabase
        .from("member_reports")
        .select("id")
        .eq("reporter_id", userId)
        .eq("reportee_id", otherProfileId)
        .is("dismissed_at", null)
        .maybeSingle(),
    ])

    return {
      ok: true,
      isBlocked: blocked,
      hasOpenReport: Boolean(openReportResult.data),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function blockMember(otherProfileId: string): Promise<BlockMemberResult> {
  try {
    const userId = await requireUserId()
    if (userId === otherProfileId) {
      return { ok: false, error: "You cannot block yourself." }
    }

    const supabase = await createClient()

    const alreadyBlocked = await membersAreBlocked(userId, otherProfileId)
    if (alreadyBlocked) {
      return { ok: true }
    }

    const { error: insertError } = await supabase.from("member_blocks").insert({
      blocker_id: userId,
      blocked_id: otherProfileId,
    })

    if (insertError) {
      return { ok: false, error: insertError.message }
    }

    await disconnectMembers(supabase, userId, otherProfileId)
    revalidateModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function unblockMember(
  otherProfileId: string,
): Promise<BlockMemberResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from("member_blocks")
      .delete()
      .or(
        `and(blocker_id.eq.${userId},blocked_id.eq.${otherProfileId}),and(blocker_id.eq.${otherProfileId},blocked_id.eq.${userId})`,
      )

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function submitMemberReport(
  reporteeId: string,
  reason: string,
  alsoBlock: boolean,
): Promise<SubmitMemberReportResult> {
  try {
    if (!isMemberReportReason(reason)) {
      return { ok: false, error: "Select a reason for your report." }
    }

    const userId = await requireUserId()
    if (userId === reporteeId) {
      return { ok: false, error: "You cannot report yourself." }
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("member_reports")
      .select("id")
      .eq("reporter_id", userId)
      .eq("reportee_id", reporteeId)
      .is("dismissed_at", null)
      .maybeSingle()

    if (existing) {
      return { ok: false, error: "You have already reported this member." }
    }

    const { error: insertError } = await supabase.from("member_reports").insert({
      reporter_id: userId,
      reportee_id: reporteeId,
      reason,
      blocked_on_submit: alsoBlock,
    })

    if (insertError) {
      return { ok: false, error: insertError.message }
    }

    if (alsoBlock) {
      const blockResult = await blockMember(reporteeId)
      if (!blockResult.ok) {
        return blockResult
      }
    }

    revalidateModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function listBlockedMembers(): Promise<ListBlockedMembersResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: blockRows, error } = await supabase
      .from("member_blocks")
      .select("created_at, blocked_id")
      .eq("blocker_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    const blockedIds = (blockRows ?? []).map((row) => row.blocked_id as string)
    if (blockedIds.length === 0) {
      return { ok: true, members: [] }
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, title, avatar_url")
      .in("id", blockedIds)

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    const profileById = new Map(
      (profiles ?? []).map((profile) => [profile.id as string, profile]),
    )

    const members: BlockedMemberSummary[] = (blockRows ?? [])
      .map((row) => {
        const profile = profileById.get(row.blocked_id as string)
        if (!profile) return null
        return {
          id: profile.id as string,
          name: (profile.full_name as string | null) ?? "Member",
          role: (profile.title as string | null) ?? "AWN Member",
          avatar: (profile.avatar_url as string | null) ?? undefined,
          blockedAt: row.created_at as string,
        }
      })
      .filter((member): member is BlockedMemberSummary => member != null)

    return { ok: true, members }
  } catch (error) {
    return actionError(error)
  }
}

type ReportDbRow = {
  id: string
  reason: MemberReportReason
  blocked_on_submit: boolean
  created_at: string
  reporter: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    status: string
  } | null
  reportee: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    status: string
  } | null
}

export async function listMemberReports(): Promise<ListMemberReportsResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("member_reports")
      .select(
        `
        id,
        reason,
        blocked_on_submit,
        created_at,
        reporter:profiles!member_reports_reporter_id_fkey (
          id,
          full_name,
          email,
          avatar_url,
          status
        ),
        reportee:profiles!member_reports_reportee_id_fkey (
          id,
          full_name,
          email,
          avatar_url,
          status
        )
      `,
      )
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    const reports: MemberReportRow[] = ((data ?? []) as ReportDbRow[])
      .map((row) => {
        if (!row.reporter || !row.reportee) return null
        return {
          id: row.id,
          reason: row.reason,
          blockedOnSubmit: row.blocked_on_submit,
          createdAt: row.created_at,
          reporter: {
            id: row.reporter.id,
            name: row.reporter.full_name ?? "Member",
            email: row.reporter.email ?? "",
            avatar: row.reporter.avatar_url ?? undefined,
            status: row.reporter.status,
          },
          reportee: {
            id: row.reportee.id,
            name: row.reportee.full_name ?? "Member",
            email: row.reportee.email ?? "",
            avatar: row.reportee.avatar_url ?? undefined,
            status: row.reportee.status,
          },
        }
      })
      .filter((report): report is MemberReportRow => report != null)

    return { ok: true, reports }
  } catch (error) {
    return actionError(error)
  }
}

export async function dismissMemberReport(reportId: string): Promise<ActionOk | ActionError> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from("member_reports")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", reportId)
      .is("dismissed_at", null)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath("/reports")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
