"use server"

import { revalidatePath } from "next/cache"

import { AuthError, requireAdmin } from "@/lib/auth/require-admin"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { sendEmail } from "@/lib/email/send"
import {
  applicationApprovedHtml,
  applicationApprovedSubject,
} from "@/lib/email/templates/application-approved"
import {
  applicationDeniedHtml,
  applicationDeniedSubject,
} from "@/lib/email/templates/application-denied"
import {
  applicationConfirmationHtml,
  applicationConfirmationSubject,
} from "@/lib/email/templates/application-confirmation"
import {
  type ApplicationNoteVisibility,
  type MembershipApplication,
  type MembershipApplicationStatus,
  type SocialLinksInput,
} from "@/lib/invites/data"
import { createNotification } from "@/lib/notifications/actions"
import {
  hasMinimumSocialLinks,
  normalizeSocialField,
  SOCIAL_FIELD_IDS,
  type SocialFieldId,
} from "@/lib/social-links"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { unwrapOne } from "@/lib/supabase/unwrap-one"

const RESUME_BUCKET = "resumes"
const MAX_RESUME_BYTES = 5 * 1024 * 1024
const ALLOWED_RESUME_TYPES = new Set(["application/pdf"])

export type ActionError = { ok: false; error: string }

export type SubmitApplicationResult = { ok: true } | ActionError

export type GetApplicationStatusResult =
  | {
      ok: true
      application: {
        status: MembershipApplicationStatus
        adminNote: string | null
        noteVisibility: ApplicationNoteVisibility | null
        fullName: string
        email: string
        title: string
        createdAt: string
        reviewedAt: string | null
      }
    }
  | ActionError

export type ListApplicationsResult =
  | { ok: true; applications: MembershipApplication[] }
  | ActionError

export type ReviewApplicationResult = { ok: true } | ActionError

export type ResumeSignedUrlResult =
  | { ok: true; url: string }
  | ActionError

type ApplicationRow = {
  id: string
  invite_id: string
  invitee_user_id: string | null
  full_name: string
  email: string
  title: string
  resume_url: string | null
  social_links: SocialLinksInput
  status: MembershipApplicationStatus
  admin_note: string | null
  note_visibility: ApplicationNoteVisibility | null
  reviewed_at: string | null
  created_at: string
  invite: {
    inviter_id: string
    inviter: {
      full_name: string | null
      email: string
      avatar_url: string | null
    } | null
  } | null
}

function actionError(error: unknown): ActionError {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message }
  }
  if (error instanceof Error) return { ok: false, error: error.message }
  return { ok: false, error: "Something went wrong." }
}

function normalizeSocialLinksInput(
  input: Record<string, string | undefined>,
): Record<SocialFieldId, string | null> {
  const normalized = {} as Record<SocialFieldId, string | null>
  for (const id of SOCIAL_FIELD_IDS) {
    normalized[id] = normalizeSocialField(id, input[id])
  }
  return normalized
}


function socialLinksToJson(
  links: Record<SocialFieldId, string | null>,
): SocialLinksInput {
  const result: SocialLinksInput = {}
  for (const id of SOCIAL_FIELD_IDS) {
    if (links[id]) result[id] = links[id]!
  }
  return result
}

function mapApplicationRow(row: ApplicationRow): MembershipApplication {
  const inviter = row.invite?.inviter
  return {
    id: row.id,
    inviteId: row.invite_id,
    inviteeUserId: row.invitee_user_id,
    fullName: row.full_name,
    email: row.email,
    title: row.title,
    resumeUrl: row.resume_url,
    socialLinks: row.social_links ?? {},
    status: row.status,
    adminNote: row.admin_note,
    noteVisibility: row.note_visibility,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    inviterId: row.invite?.inviter_id ?? "",
    inviterName: inviter?.full_name?.trim() || "Member",
    inviterEmail: inviter?.email ?? "",
    inviterAvatarUrl: inviter?.avatar_url ?? null,
  }
}

async function uploadResume(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_RESUME_TYPES.has(file.type)) {
    throw new Error("Resume must be a PDF file.")
  }

  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("Resume must be 5 MB or smaller.")
  }

  const path = `${applicationId}/resume.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage.from(RESUME_BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  })

  if (error) {
    throw new Error(error.message)
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")

  return `${base}/storage/v1/object/${RESUME_BUCKET}/${path}`
}

export async function submitApplication(
  formData: FormData,
): Promise<SubmitApplicationResult> {
  try {
    const token = String(formData.get("token") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const fullName = String(formData.get("fullName") ?? "").trim()
    const title = String(formData.get("title") ?? "").trim()
    const resume = formData.get("resume")

    if (!token) return { ok: false, error: "Invalid invite link." }
    if (!fullName) return { ok: false, error: "Full name is required." }
    if (!title) return { ok: false, error: "Title is required." }
    if (!password || password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." }
    }
    if (!(resume instanceof File) || resume.size === 0) {
      return { ok: false, error: "Resume PDF is required." }
    }

    const socialInput: Record<string, string | undefined> = {}
    for (const id of SOCIAL_FIELD_IDS) {
      const value = formData.get(id)
      if (typeof value === "string" && value.trim()) {
        socialInput[id] = value
      }
    }

    const socialLinks = normalizeSocialLinksInput(socialInput)
    if (!hasMinimumSocialLinks(socialLinks)) {
      return {
        ok: false,
        error: "Add at least two social links so admins can verify you.",
      }
    }

    const admin = createAdminClient()

    const { data: invite, error: inviteError } = await admin
      .from("member_invites")
      .select("id, invitee_email, status, application_id, inviter_id")
      .eq("token", token)
      .maybeSingle()

    if (inviteError) return { ok: false, error: inviteError.message }
    if (!invite) return { ok: false, error: "This invite link is invalid." }
    if (invite.status === "rescinded") {
      return { ok: false, error: "This invite was rescinded." }
    }
    if (invite.status === "accepted" || invite.application_id) {
      return {
        ok: false,
        error: "This invite has already been used. Sign in to check your status.",
      }
    }
    if (invite.status !== "pending") {
      return { ok: false, error: "This invite is no longer valid." }
    }

    const email = invite.invitee_email.trim().toLowerCase()

    const { data: existingMember } = await admin
      .from("profiles")
      .select("id, is_approved")
      .ilike("email", email)
      .maybeSingle()

    if (existingMember?.is_approved) {
      return {
        ok: false,
        error: "This email already belongs to an active AWN member.",
      }
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        application_flow: true,
      },
    })

    if (authError) {
      if (authError.message.toLowerCase().includes("already")) {
        return {
          ok: false,
          error: "An account with this email already exists. Try signing in.",
        }
      }
      return { ok: false, error: authError.message }
    }

    const userId = authData.user?.id
    if (!userId) {
      return { ok: false, error: "Account created but user id was missing." }
    }

    const { data: application, error: appError } = await admin
      .from("membership_applications")
      .insert({
        invite_id: invite.id,
        invitee_user_id: userId,
        full_name: fullName,
        email,
        title,
        social_links: socialLinksToJson(socialLinks),
        status: "pending",
      })
      .select("id")
      .single()

    if (appError) {
      await admin.auth.admin.deleteUser(userId)
      return { ok: false, error: appError.message }
    }

    let resumeUrl: string
    try {
      resumeUrl = await uploadResume(admin, application.id, resume)
    } catch (uploadError) {
      await admin.from("membership_applications").delete().eq("id", application.id)
      await admin.auth.admin.deleteUser(userId)
      return actionError(uploadError)
    }

    const { error: resumeUpdateError } = await admin
      .from("membership_applications")
      .update({ resume_url: resumeUrl })
      .eq("id", application.id)

    if (resumeUpdateError) {
      return { ok: false, error: resumeUpdateError.message }
    }

    const now = new Date().toISOString()
    const { error: inviteUpdateError } = await admin
      .from("member_invites")
      .update({
        status: "accepted",
        accepted_at: now,
        application_id: application.id,
      })
      .eq("id", invite.id)

    if (inviteUpdateError) {
      return { ok: false, error: inviteUpdateError.message }
    }

    await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      title,
      status: "pending",
      role: "member",
      is_approved: false,
    })

    const emailResult = await sendEmail({
      to: email,
      subject: applicationConfirmationSubject,
      html: applicationConfirmationHtml(),
    })

    if (!emailResult.ok && process.env.NODE_ENV !== "development") {
      console.error("[submitApplication] confirmation email failed", emailResult.error)
    }

    revalidatePath("/invites")
    revalidatePath("/applications")

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function getApplicationStatus(): Promise<GetApplicationStatusResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Sign in to view your application status." }
    }

    const { data, error } = await supabase
      .from("membership_applications")
      .select(
        "full_name, email, title, status, admin_note, note_visibility, created_at, reviewed_at",
      )
      .eq("invitee_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return { ok: false, error: error.message }
    }

    if (!data) {
      return { ok: false, error: "No application found for this account." }
    }

    return {
      ok: true,
      application: {
        fullName: data.full_name,
        email: data.email,
        title: data.title,
        status: data.status,
        adminNote:
          data.status === "denied" &&
          (data.note_visibility === "invitee_only" ||
            data.note_visibility === "both")
            ? data.admin_note
            : null,
        noteVisibility: data.note_visibility,
        createdAt: data.created_at,
        reviewedAt: data.reviewed_at,
      },
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function listApplications(): Promise<ListApplicationsResult> {
  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from("membership_applications")
      .select(
        `
        id,
        invite_id,
        invitee_user_id,
        full_name,
        email,
        title,
        resume_url,
        social_links,
        status,
        admin_note,
        note_visibility,
        reviewed_at,
        created_at,
        invite:member_invites!membership_applications_invite_id_fkey (
          inviter_id,
          inviter:profiles!member_invites_inviter_id_fkey (
            full_name,
            email,
            avatar_url
          )
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (error) {
      return { ok: false, error: error.message }
    }

    return {
      ok: true,
      applications: (data ?? []).map((row) => {
        const record = row as Record<string, unknown>
        const invite = unwrapOne(
          record.invite as ApplicationRow["invite"] | ApplicationRow["invite"][],
        )

        return mapApplicationRow({
          id: String(record.id),
          invite_id: String(record.invite_id),
          invitee_user_id: (record.invitee_user_id as string | null) ?? null,
          full_name: String(record.full_name),
          email: String(record.email),
          title: String(record.title),
          resume_url: (record.resume_url as string | null) ?? null,
          social_links: (record.social_links as SocialLinksInput) ?? {},
          status: record.status as MembershipApplicationStatus,
          admin_note: (record.admin_note as string | null) ?? null,
          note_visibility:
            (record.note_visibility as ApplicationNoteVisibility | null) ?? null,
          reviewed_at: (record.reviewed_at as string | null) ?? null,
          created_at: String(record.created_at),
          invite,
        })
      }),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function getApplicationResumeSignedUrl(
  applicationId: string,
): Promise<ResumeSignedUrlResult> {
  try {
    await requireAdmin()

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("membership_applications")
      .select("resume_url")
      .eq("id", applicationId)
      .maybeSingle()

    if (error) return { ok: false, error: error.message }
    if (!data?.resume_url) {
      return { ok: false, error: "No resume on file." }
    }

    const path = `${applicationId}/resume.pdf`
    const { data: signed, error: signError } = await admin.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(path, 60 * 10)

    if (signError || !signed?.signedUrl) {
      return { ok: false, error: signError?.message || "Could not load resume." }
    }

    return { ok: true, url: signed.signedUrl }
  } catch (error) {
    return actionError(error)
  }
}

export async function approveApplication(
  applicationId: string,
): Promise<ReviewApplicationResult> {
  try {
    const { userId: adminId } = await requireAdmin()
    const admin = createAdminClient()
    const now = new Date().toISOString()

    const { data: application, error: fetchError } = await admin
      .from("membership_applications")
      .select(
        `
        id,
        email,
        full_name,
        status,
        invitee_user_id,
        invite:member_invites!membership_applications_invite_id_fkey (
          inviter_id
        )
      `,
      )
      .eq("id", applicationId)
      .maybeSingle()

    if (fetchError) return { ok: false, error: fetchError.message }
    if (!application) return { ok: false, error: "Application not found." }
    if (application.status !== "pending") {
      return { ok: false, error: "Only pending applications can be approved." }
    }

    const inviteeUserId = application.invitee_user_id
    if (!inviteeUserId) {
      return { ok: false, error: "Application is missing an invitee account." }
    }

    const { error: appError } = await admin
      .from("membership_applications")
      .update({
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: now,
      })
      .eq("id", applicationId)

    if (appError) return { ok: false, error: appError.message }

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        is_approved: true,
        status: "active",
      })
      .eq("id", inviteeUserId)

    if (profileError) return { ok: false, error: profileError.message }

    await sendEmail({
      to: application.email,
      subject: applicationApprovedSubject,
      html: applicationApprovedHtml(),
    })

    const inviterId = unwrapOne(
      application.invite as
        | { inviter_id: string }
        | { inviter_id: string }[]
        | null,
    )?.inviter_id

    if (inviterId) {
      await createNotification({
        userId: inviterId,
        kind: "invite_accepted",
        title: "Your invite was accepted",
        body: `${application.full_name} was approved and is now an AWN member.`,
        data: { applicationId, inviteeUserId },
      })
    }

    revalidatePath("/applications")
    revalidatePath("/invites")

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function denyApplication(input: {
  applicationId: string
  note?: string
  noteVisibility?: ApplicationNoteVisibility
}): Promise<ReviewApplicationResult> {
  try {
    const { userId: adminId } = await requireAdmin()
    const admin = createAdminClient()
    const now = new Date().toISOString()

    const note = input.note?.trim() || null
    const noteVisibility = note ? input.noteVisibility ?? "invitee_only" : null

    const { data: application, error: fetchError } = await admin
      .from("membership_applications")
      .select(
        `
        id,
        email,
        full_name,
        status,
        invite:member_invites!membership_applications_invite_id_fkey (
          inviter_id
        )
      `,
      )
      .eq("id", input.applicationId)
      .maybeSingle()

    if (fetchError) return { ok: false, error: fetchError.message }
    if (!application) return { ok: false, error: "Application not found." }
    if (application.status !== "pending") {
      return { ok: false, error: "Only pending applications can be denied." }
    }

    const { error: appError } = await admin
      .from("membership_applications")
      .update({
        status: "denied",
        admin_note: note,
        note_visibility: noteVisibility,
        reviewed_by: adminId,
        reviewed_at: now,
      })
      .eq("id", input.applicationId)

    if (appError) return { ok: false, error: appError.message }

    if (note) {
      await sendEmail({
        to: application.email,
        subject: applicationDeniedSubject,
        html: applicationDeniedHtml({ note }),
      })
    }

    const inviterId = unwrapOne(
      application.invite as
        | { inviter_id: string }
        | { inviter_id: string }[]
        | null,
    )?.inviter_id

    if (inviterId && note && noteVisibility === "both") {
      await createNotification({
        userId: inviterId,
        kind: "application_denied",
        title: "Invite application denied",
        body: `${application.full_name}'s application was denied.${note ? ` Note: ${note}` : ""}`,
        data: { applicationId: input.applicationId },
      })
    }

    revalidatePath("/applications")
    revalidatePath("/pending")

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
