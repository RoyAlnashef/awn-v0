"use server"

import { revalidatePath } from "next/cache"

import { AuthError } from "@/lib/auth/require-admin"
import { requireAdmin } from "@/lib/auth/require-admin"
import { membersAreBlocked } from "@/lib/moderation/blocks"
import type {
  BlockedMemberSummary,
  JobReportRow,
  MemberReportRow,
} from "@/lib/moderation/data"
import {
  isJobReportReason,
  type JobReportReason,
} from "@/lib/moderation/job-report-reasons"
import {
  isMemberReportReason,
  type MemberReportReason,
} from "@/lib/moderation/report-reasons"
import type { JobStatus } from "@/lib/jobs-data"
import { urgentExpiresAt } from "@/lib/jobs/kind"
import { notifyJobPoster } from "@/lib/moderation/job-poster-notifications"
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

export type SubmitJobReportResult = ActionOk | ActionError

export type JobModerationStateResult =
  | {
      ok: true
      isPoster: boolean
      hasOpenReport: boolean
      isHiddenFromBoard: boolean
    }
  | ActionError

export type ListJobReportsResult =
  | { ok: true; reports: JobReportRow[] }
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
  revalidatePath("/community-reports/members")
}

function revalidateJobModerationPaths() {
  revalidatePath("/jobs")
  revalidatePath("/jobs/mine")
  revalidatePath("/community-reports/jobs")
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
    })

    if (insertError) {
      return { ok: false, error: insertError.message }
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

    revalidatePath("/community-reports/members")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function getJobModerationState(
  jobId: string,
): Promise<JobModerationStateResult> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("poster_id")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) {
      return { ok: false, error: jobError.message }
    }
    if (!job) {
      return { ok: false, error: "Job not found." }
    }
    if (job.poster_id === userId) {
      return {
        ok: true,
        isPoster: true,
        hasOpenReport: false,
        isHiddenFromBoard: false,
      }
    }

    const [openReportResult, hideResult] = await Promise.all([
      supabase
        .from("job_reports")
        .select("id")
        .eq("reporter_id", userId)
        .eq("job_id", jobId)
        .is("dismissed_at", null)
        .maybeSingle(),
      supabase
        .from("job_board_hides")
        .select("job_id")
        .eq("user_id", userId)
        .eq("job_id", jobId)
        .maybeSingle(),
    ])

    return {
      ok: true,
      isPoster: false,
      hasOpenReport: Boolean(openReportResult.data),
      isHiddenFromBoard: Boolean(hideResult.data),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function submitJobReport(
  jobId: string,
  reason: string,
): Promise<SubmitJobReportResult> {
  try {
    if (!isJobReportReason(reason)) {
      return { ok: false, error: "Select a reason for your report." }
    }

    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("poster_id")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) {
      return { ok: false, error: jobError.message }
    }
    if (!job) {
      return { ok: false, error: "Job not found." }
    }
    if (job.poster_id === userId) {
      return { ok: false, error: "You cannot report your own job." }
    }

    const { data: existing } = await supabase
      .from("job_reports")
      .select("id")
      .eq("reporter_id", userId)
      .eq("job_id", jobId)
      .is("dismissed_at", null)
      .maybeSingle()

    if (existing) {
      return { ok: false, error: "You have already reported this job." }
    }

    const { error: insertError } = await supabase.from("job_reports").insert({
      reporter_id: userId,
      job_id: jobId,
      reason,
    })

    if (insertError) {
      return { ok: false, error: insertError.message }
    }

    revalidateJobModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function hideJobFromBoard(jobId: string): Promise<ActionOk | ActionError> {
  try {
    const userId = await requireUserId()
    const supabase = await createClient()

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("poster_id")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) {
      return { ok: false, error: jobError.message }
    }
    if (!job) {
      return { ok: false, error: "Job not found." }
    }
    if (job.poster_id === userId) {
      return { ok: false, error: "You cannot hide your own job." }
    }

    const { error: insertError } = await supabase.from("job_board_hides").insert({
      user_id: userId,
      job_id: jobId,
    })

    if (insertError && insertError.code !== "23505") {
      return { ok: false, error: insertError.message }
    }

    revalidateJobModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

type JobReportDbRow = {
  id: string
  reason: JobReportReason
  created_at: string
  reporter: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    status: string
  } | null
  job: {
    id: string
    role: string
    production: string
    status: string
    poster_id: string
    under_review_at: string | null
    poster: {
      id: string
      full_name: string | null
      email: string | null
      status: string
    } | null
  } | null
}

export async function listJobReports(): Promise<ListJobReportsResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("job_reports")
      .select(
        `
        id,
        reason,
        created_at,
        reporter:profiles!job_reports_reporter_id_fkey (
          id,
          full_name,
          email,
          avatar_url,
          status
        ),
        job:job_postings!job_reports_job_id_fkey (
          id,
          role,
          production,
          status,
          poster_id,
          under_review_at,
          poster:profiles!job_postings_poster_id_fkey (
            id,
            full_name,
            email,
            status
          )
        )
      `,
      )
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    const reports: JobReportRow[] = ((data ?? []) as unknown as JobReportDbRow[])
      .map((row) => {
        if (!row.reporter || !row.job || !row.job.poster) return null
        return {
          id: row.id,
          reason: row.reason,
          createdAt: row.created_at,
          reporter: {
            id: row.reporter.id,
            name: row.reporter.full_name ?? "Member",
            email: row.reporter.email ?? "",
            avatar: row.reporter.avatar_url ?? undefined,
            status: row.reporter.status,
          },
          job: {
            id: row.job.id,
            role: row.job.role,
            production: row.job.production,
            status: row.job.status as JobStatus,
            posterId: row.job.poster_id,
            posterName: row.job.poster.full_name ?? "Member",
            posterEmail: row.job.poster.email ?? "",
            posterStatus: row.job.poster.status,
            underReviewAt: row.job.under_review_at,
          },
        }
      })
      .filter((report): report is JobReportRow => report != null)

    return { ok: true, reports }
  } catch (error) {
    return actionError(error)
  }
}

export async function dismissJobReport(reportId: string): Promise<ActionOk | ActionError> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from("job_reports")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", reportId)
      .is("dismissed_at", null)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateJobModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function startJobUnderReview(
  jobId: string,
  reportId?: string,
): Promise<ActionOk | ActionError> {
  try {
    const { userId: adminId } = await requireAdmin()
    const supabase = await createClient()

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("id, status, under_review_at, poster_id, role")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) {
      return { ok: false, error: jobError.message }
    }
    if (!job) {
      return { ok: false, error: "Job not found." }
    }
    if (job.under_review_at) {
      return { ok: false, error: "This job is already under review." }
    }

    const { error: updateError } = await supabase
      .from("job_postings")
      .update({
        under_review_at: new Date().toISOString(),
        status_before_review: job.status,
        under_review_by: adminId,
        under_review_report_id: reportId ?? null,
        status: "draft",
      })
      .eq("id", jobId)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    void notifyJobPoster({
      posterId: job.poster_id as string,
      jobId,
      role: job.role as string,
      event: "under_review",
    })

    revalidateJobModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function releaseJobFromReview(jobId: string): Promise<ActionOk | ActionError> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select(
        "status_before_review, kind, under_review_at, poster_id, role",
      )
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) {
      return { ok: false, error: jobError.message }
    }
    if (!job?.under_review_at) {
      return { ok: false, error: "This job is not under review." }
    }
    if (!job.status_before_review) {
      return { ok: false, error: "Missing review snapshot." }
    }

    const restoredStatus = job.status_before_review as JobStatus
    const jobKind = job.kind as string
    const patch: Record<string, unknown> = {
      status: restoredStatus,
      under_review_at: null,
      status_before_review: null,
      under_review_by: null,
      under_review_report_id: null,
    }

    if (restoredStatus === "open" && jobKind === "urgent") {
      patch.expires_at = urgentExpiresAt()
    }

    const { error: updateError } = await supabase
      .from("job_postings")
      .update(patch)
      .eq("id", jobId)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    void notifyJobPoster({
      posterId: job.poster_id as string,
      jobId,
      role: job.role as string,
      event: "released",
    })

    revalidateJobModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function closeJobFromReview(
  jobId: string,
  status: "filled" | "deleted",
): Promise<ActionOk | ActionError> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("under_review_at, poster_id, role")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) {
      return { ok: false, error: jobError.message }
    }
    if (!job?.under_review_at) {
      return { ok: false, error: "This job is not under review." }
    }

    const patch: Record<string, unknown> = {
      status,
      under_review_at: null,
      status_before_review: null,
      under_review_by: null,
      under_review_report_id: null,
    }
    if (status === "filled") {
      patch.filled_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from("job_postings")
      .update(patch)
      .eq("id", jobId)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    void notifyJobPoster({
      posterId: job.poster_id as string,
      jobId,
      role: job.role as string,
      event: "closed",
      closeStatus: status,
    })

    revalidateJobModerationPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
