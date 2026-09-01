"use server"

import { randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { getRequestAppOrigin } from "@/lib/email/constants.server"
import { sendEmail } from "@/lib/email/send"
import {
  inviteEmailHtml,
  inviteEmailSubject,
} from "@/lib/email/templates/invite-email"
import {
  countActiveInviteSlots,
  getInviteQuota,
  type AdminMemberInvite,
  type MemberInvite,
  type MemberInviteStatus,
} from "@/lib/invites/data"
import { buildInviteApplyUrl } from "@/lib/invites/urls"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { unwrapOne } from "@/lib/supabase/unwrap-one"
import { isValidEmail } from "@/lib/validation/email"

export type ActionError = { ok: false; error: string }

export type SendInviteResult = { ok: true; invite: MemberInvite } | ActionError

export type RescindInviteResult = { ok: true } | ActionError

export type ListMyInvitesResult =
  | {
      ok: true
      invites: MemberInvite[]
      unlimitedInvites: boolean
      slotsUsed: number
      slotsRemaining: number | null
      maxSlots: number | null
    }
  | ActionError

export type ListAllInvitesResult =
  | { ok: true; invites: AdminMemberInvite[] }
  | ActionError

export type GetInviteByTokenResult =
  | {
      ok: true
      invite: {
        id: string
        inviteeEmail: string
        inviterName: string
        status: MemberInviteStatus
      }
    }
  | ActionError

type InviteRow = {
  id: string
  invitee_email: string
  token: string
  status: MemberInviteStatus
  sent_at: string
  rescinded_at: string | null
  accepted_at: string | null
  application_id: string | null
}

type AdminInviteRow = InviteRow & {
  inviter_id: string
  inviter: {
    full_name: string | null
    email: string
  } | null
  application: {
    status: "pending" | "approved" | "denied"
  } | null
}

function actionError(error: unknown): ActionError {
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: "Something went wrong." }
}

function mapInviteRow(row: InviteRow): MemberInvite {
  return {
    id: row.id,
    inviteeEmail: row.invitee_email,
    status: row.status,
    sentAt: row.sent_at,
    rescindedAt: row.rescinded_at,
    acceptedAt: row.accepted_at,
    applicationId: row.application_id,
  }
}

function createInviteToken(): string {
  return randomBytes(24).toString("base64url")
}

async function requireApprovedMember() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    throw new Error("You must be signed in to send invites.")
  }

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_approved, status")
    .eq("id", sessionUser.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!profile?.is_approved || profile.status !== "active") {
    throw new Error("Only approved members can send invites.")
  }

  return {
    supabase,
    userId: profile.id as string,
    inviterName: profile.full_name?.trim() || sessionUser.name,
    inviterEmail: profile.email,
  }
}

export async function listMyInvites(): Promise<ListMyInvitesResult> {
  try {
    const { supabase, userId } = await requireApprovedMember()

    const { data, error } = await supabase
      .from("member_invites")
      .select(
        "id, invitee_email, status, sent_at, rescinded_at, accepted_at, application_id",
      )
      .eq("inviter_id", userId)
      .order("sent_at", { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    const invites = ((data ?? []) as InviteRow[]).map(mapInviteRow)
    const slotsUsed = countActiveInviteSlots(invites)
    const sessionUser = await getSessionUser()
    const quota = getInviteQuota(
      { canAccessAdmin: sessionUser?.canAccessAdmin ?? false },
      slotsUsed,
    )

    return {
      ok: true,
      invites,
      ...quota,
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function sendInvite(email: string): Promise<SendInviteResult> {
  try {
    const { supabase, userId, inviterName } = await requireApprovedMember()

    const inviteeEmail = email.trim().toLowerCase()
    if (!isValidEmail(inviteeEmail)) {
      return { ok: false, error: "Enter a valid email address." }
    }

    const sessionUser = await getSessionUser()
    if (inviteeEmail === sessionUser?.email.toLowerCase()) {
      return { ok: false, error: "You cannot invite yourself." }
    }

    const admin = createAdminClient()
    const { data: existingMember } = await admin
      .from("profiles")
      .select("id, is_approved, status")
      .ilike("email", inviteeEmail)
      .maybeSingle()

    if (
      existingMember?.is_approved &&
      existingMember.status === "active"
    ) {
      return {
        ok: false,
        error: "This person is already an active AWN member.",
      }
    }

    const listResult = await listMyInvites()
    if (!listResult.ok) {
      return { ok: false, error: listResult.error }
    }

    if (
      !listResult.unlimitedInvites &&
      listResult.slotsRemaining !== null &&
      listResult.slotsRemaining <= 0
    ) {
      return {
        ok: false,
        error: "You've used all 5 invite slots. Rescind a pending invite to free one.",
      }
    }

    const token = createInviteToken()
    const { data, error } = await supabase
      .from("member_invites")
      .insert({
        inviter_id: userId,
        invitee_email: inviteeEmail,
        token,
        status: "pending",
      })
      .select(
        "id, invitee_email, status, sent_at, rescinded_at, accepted_at, application_id",
      )
      .single()

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          error: "You already have a pending invite for this email.",
        }
      }
      return { ok: false, error: error.message }
    }

    const invite = mapInviteRow(data as InviteRow)
    const origin = await getRequestAppOrigin()

    const emailResult = await sendEmail({
      to: inviteeEmail,
      subject: inviteEmailSubject(inviterName),
      html: inviteEmailHtml({ inviterName, token, origin }),
    })

    if (!emailResult.ok) {
      await admin
        .from("member_invites")
        .update({ status: "rescinded", rescinded_at: new Date().toISOString() })
        .eq("id", invite.id)

      return {
        ok: false,
        error: emailResult.error || "Invite created but email failed to send.",
      }
    }

    revalidatePath("/people")
    revalidatePath("/invites")

    return { ok: true, invite }
  } catch (error) {
    return actionError(error)
  }
}

export async function rescindInvite(inviteId: string): Promise<RescindInviteResult> {
  try {
    const { supabase, userId } = await requireApprovedMember()

    const { data: invite, error: fetchError } = await supabase
      .from("member_invites")
      .select("id, status, application_id")
      .eq("id", inviteId)
      .eq("inviter_id", userId)
      .maybeSingle()

    if (fetchError) {
      return { ok: false, error: fetchError.message }
    }

    if (!invite) {
      return { ok: false, error: "Invite not found." }
    }

    if (invite.status !== "pending") {
      return { ok: false, error: "Only pending invites can be rescinded." }
    }

    if (invite.application_id) {
      return {
        ok: false,
        error: "This invite already has a submitted application.",
      }
    }

    const { error } = await supabase
      .from("member_invites")
      .update({
        status: "rescinded",
        rescinded_at: new Date().toISOString(),
      })
      .eq("id", inviteId)
      .eq("inviter_id", userId)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath("/people")
    revalidatePath("/invites")

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function getInviteByToken(
  token: string,
): Promise<GetInviteByTokenResult> {
  try {
    const trimmed = token.trim()
    if (!trimmed) {
      return { ok: false, error: "This invite link is invalid." }
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("member_invites")
      .select(
        `
        id,
        invitee_email,
        status,
        inviter:profiles!member_invites_inviter_id_fkey (
          full_name
        )
      `,
      )
      .eq("token", trimmed)
      .maybeSingle()

    if (error) {
      return { ok: false, error: error.message }
    }

    if (!data) {
      return { ok: false, error: "This invite link is invalid or expired." }
    }

    if (data.status === "rescinded") {
      return { ok: false, error: "This invite was rescinded." }
    }

    if (data.status === "expired") {
      return { ok: false, error: "This invite has expired." }
    }

    if (data.status === "accepted") {
      return {
        ok: false,
        error: "This invite has already been used. Sign in to check your application.",
      }
    }

    const inviter = unwrapOne(
      data.inviter as { full_name: string | null } | { full_name: string | null }[] | null,
    )

    return {
      ok: true,
      invite: {
        id: data.id,
        inviteeEmail: data.invitee_email,
        inviterName: inviter?.full_name?.trim() || "An AWN member",
        status: data.status as MemberInviteStatus,
      },
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function listAllInvites(): Promise<ListAllInvitesResult> {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser?.canAccessAdmin) {
      return { ok: false, error: "Only admins can view all invites." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("member_invites")
      .select(
        `
        id,
        inviter_id,
        invitee_email,
        token,
        status,
        sent_at,
        rescinded_at,
        accepted_at,
        application_id,
        inviter:profiles!member_invites_inviter_id_fkey (
          full_name,
          email
        ),
        application:membership_applications!member_invites_application_id_fkey (
          status
        )
      `,
      )
      .order("sent_at", { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    const origin = await getRequestAppOrigin()

    const invites = (data ?? []).map((row) => {
      const inviteRow = row as AdminInviteRow & {
        inviter: AdminInviteRow["inviter"] | NonNullable<AdminInviteRow["inviter"]>[]
        application:
          | AdminInviteRow["application"]
          | NonNullable<AdminInviteRow["application"]>[]
      }

      return {
        ...mapInviteRow(inviteRow),
        inviterId: inviteRow.inviter_id,
        inviterName:
          unwrapOne(inviteRow.inviter)?.full_name?.trim() || "Member",
        inviterEmail: unwrapOne(inviteRow.inviter)?.email ?? "",
        applicationStatus: unwrapOne(inviteRow.application)?.status ?? null,
        applyUrl: buildInviteApplyUrl(inviteRow.token, origin),
      }
    })

    return { ok: true, invites }
  } catch (error) {
    return actionError(error)
  }
}
