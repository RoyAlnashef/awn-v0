"use server"

import { revalidatePath } from "next/cache"

import {
  MEMBER_PROFILE_SELECT,
  clampBannerPositionY,
  toPersonFromProfile,
  toProfileUpdateFromPerson,
  type MemberProfileRow,
} from "@/lib/account/profile-data"
import { listMemberTourCredits } from "@/lib/account/tour-credits-actions"
import type { AccountTourCredit } from "@/lib/account-profile"
import { AuthError } from "@/lib/auth/require-admin"
import { requireProfileEditor } from "@/lib/auth/require-profile-editor"
import type { Person } from "@/lib/people-data"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type ProfileActionResult =
  | { ok: true; person?: Person }
  | { ok: false; error: string }

export type ProfileResumeResult =
  | {
      ok: true
      url: string | null
      resumePath: string | null
      fileName: string | null
    }
  | { ok: false; error: string }

export type UploadProfileResumeResult =
  | { ok: true; resumePath: string; signedUrl: string; fileName: string }
  | { ok: false; error: string }

const BANNER_BUCKET = "banners"
const RESUME_BUCKET = "resumes"
const MAX_RESUME_BYTES = 5 * 1024 * 1024
const ALLOWED_RESUME_TYPES = new Set(["application/pdf"])
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function actionError(error: unknown): ProfileActionResult {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message }
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Something went wrong." }
}

function revalidateProfilePaths() {
  revalidatePath("/account/profile")
  revalidatePath("/account/social")
  revalidatePath("/account/resume")
  revalidatePath("/account", "layout")
  revalidatePath("/", "layout")
}

function bannerPublicUrl(userId: string, ext: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  }
  return `${base}/storage/v1/object/public/${BANNER_BUCKET}/${userId}/banner.${ext}`
}

function bannerObjectPath(userId: string, ext: string): string {
  return `${userId}/banner.${ext}`
}

function profileResumePath(userId: string): string {
  return `users/${userId}/resume.pdf`
}

function normalizeResumeFileName(name: string | null | undefined): string {
  const trimmed = name?.trim()
  return trimmed || "resume.pdf"
}

async function deleteUserBannerObjects(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const { data: objects, error: listError } = await admin.storage
    .from(BANNER_BUCKET)
    .list(userId)

  if (listError) {
    throw new Error(listError.message)
  }

  if (!objects?.length) return

  const paths = objects.map((obj) => `${userId}/${obj.name}`)
  const { error: removeError } = await admin.storage
    .from(BANNER_BUCKET)
    .remove(paths)

  if (removeError) {
    throw new Error(removeError.message)
  }
}

export async function setAvailableForWork(
  enabled: boolean,
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Unauthorized" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        availability: enabled ? "available_now" : "between_tours",
      })
      .eq("id", user.id)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath("/", "layout")
    revalidatePath("/now")
    revalidatePath("/people")
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function getMemberProfile(): Promise<Person | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select(MEMBER_PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data) return null

  const row = data as unknown as MemberProfileRow

  const [creditCountResult, vouchCountResult] = await Promise.all([
    supabase
      .from("tour_credits")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id),
    supabase
      .from("profile_vouches")
      .select("id", { count: "exact", head: true })
      .eq("vouchee_id", user.id),
  ])

  return toPersonFromProfile(row, {
    tourCreditCount: creditCountResult.count ?? 0,
    vouchCount: vouchCountResult.count ?? 0,
  })
}

export async function getMemberProfileWithTourCredits(): Promise<{
  profile: Person
  tourCredits: AccountTourCredit[]
} | null> {
  const profile = await getMemberProfile()
  if (!profile) return null

  const creditsResult = await listMemberTourCredits(profile.id)
  return {
    profile,
    tourCredits: creditsResult.ok ? creditsResult.credits : [],
  }
}

export async function updateMemberProfile(
  person: Person,
): Promise<ProfileActionResult> {
  try {
    await requireProfileEditor(person.id)

    const admin = createAdminClient()
    const update = toProfileUpdateFromPerson(person)

    const { data, error } = await admin
      .from("profiles")
      .update(update)
      .eq("id", person.id)
      .select(MEMBER_PROFILE_SELECT)
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateProfilePaths()

    const [creditCountResult, vouchCountResult] = await Promise.all([
      admin
        .from("tour_credits")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", person.id),
      admin
        .from("profile_vouches")
        .select("id", { count: "exact", head: true })
        .eq("vouchee_id", person.id),
    ])

    return {
      ok: true,
      person: toPersonFromProfile(data as unknown as MemberProfileRow, {
        tourCreditCount: creditCountResult.count ?? person.credits,
        vouchCount: vouchCountResult.count ?? person.vouches,
      }),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function uploadMemberBanner(
  userId: string,
  formData: FormData,
): Promise<ProfileActionResult & { bannerUrl?: string }> {
  try {
    await requireProfileEditor(userId)

    const file = formData.get("file")
    if (!(file instanceof File)) {
      return { ok: false, error: "No file was provided." }
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return { ok: false, error: "Use a JPEG, PNG, or WebP image." }
    }

    if (file.size > MAX_BYTES) {
      return { ok: false, error: "Image must be 2 MB or smaller." }
    }

    const ext = EXT_BY_MIME[file.type]
    if (!ext) {
      return { ok: false, error: "Unsupported image type." }
    }

    const admin = createAdminClient()
    await deleteUserBannerObjects(admin, userId)

    const objectPath = bannerObjectPath(userId, ext)
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from(BANNER_BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return { ok: false, error: uploadError.message }
    }

    const bannerUrl = bannerPublicUrl(userId, ext)

    const { data, error: profileError } = await admin
      .from("profiles")
      .update({ banner_url: bannerUrl, banner_position_y: 50 })
      .eq("id", userId)
      .select(MEMBER_PROFILE_SELECT)
      .single()

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    revalidateProfilePaths()
    return {
      ok: true,
      bannerUrl,
      person: toPersonFromProfile(data as unknown as MemberProfileRow),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeMemberBanner(
  userId: string,
): Promise<ProfileActionResult> {
  try {
    await requireProfileEditor(userId)

    const admin = createAdminClient()
    await deleteUserBannerObjects(admin, userId)

    const { data, error: profileError } = await admin
      .from("profiles")
      .update({ banner_url: null, banner_position_y: 50 })
      .eq("id", userId)
      .select(MEMBER_PROFILE_SELECT)
      .single()

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    revalidateProfilePaths()
    return { ok: true, person: toPersonFromProfile(data as unknown as MemberProfileRow) }
  } catch (error) {
    return actionError(error)
  }
}

export async function getProfileResumeSignedUrl(): Promise<ProfileResumeResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Unauthorized" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("resume_url, resume_filename")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    const resumePath = profile?.resume_url?.trim() || null
    if (!resumePath) {
      return { ok: true, url: null, resumePath: null, fileName: null }
    }

    const admin = createAdminClient()
    const { data: signed, error: signError } = await admin.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(resumePath, 60 * 10)

    if (signError || !signed?.signedUrl) {
      return {
        ok: false,
        error: signError?.message || "Could not load resume.",
      }
    }

    return {
      ok: true,
      url: signed.signedUrl,
      resumePath,
      fileName: normalizeResumeFileName(profile?.resume_filename),
    }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}

export async function uploadProfileResume(
  formData: FormData,
): Promise<UploadProfileResumeResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Unauthorized" }
    }

    const file = formData.get("resume")
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Resume is required." }
    }

    if (!ALLOWED_RESUME_TYPES.has(file.type)) {
      return { ok: false, error: "Resume must be a PDF file." }
    }

    if (file.size > MAX_RESUME_BYTES) {
      return { ok: false, error: "Resume must be 5 MB or smaller." }
    }

    const path = profileResumePath(user.id)
    const fileName = normalizeResumeFileName(file.name)
    const admin = createAdminClient()
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from(RESUME_BUCKET)
      .upload(path, buffer, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (uploadError) {
      return { ok: false, error: uploadError.message }
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ resume_url: path, resume_filename: fileName })
      .eq("id", user.id)

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    const { data: signed, error: signError } = await admin.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(path, 60 * 10)

    if (signError || !signed?.signedUrl) {
      return {
        ok: false,
        error: signError?.message || "Resume uploaded but could not be previewed.",
      }
    }

    revalidateProfilePaths()
    return { ok: true, resumePath: path, signedUrl: signed.signedUrl, fileName }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}

export async function removeProfileResume(): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Unauthorized" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("resume_url")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    const resumePath = profile?.resume_url?.trim() || null
    const admin = createAdminClient()

    if (resumePath) {
      const { error: deleteError } = await admin.storage
        .from(RESUME_BUCKET)
        .remove([resumePath])

      if (deleteError) {
        return { ok: false, error: deleteError.message }
      }
    }

    const { data, error: updateError } = await admin
      .from("profiles")
      .update({ resume_url: null, resume_filename: null })
      .eq("id", user.id)
      .select(MEMBER_PROFILE_SELECT)
      .single()

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    revalidateProfilePaths()
    return { ok: true, person: toPersonFromProfile(data as unknown as MemberProfileRow) }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateBannerPosition(
  userId: string,
  positionY: number,
): Promise<ProfileActionResult> {
  try {
    await requireProfileEditor(userId)

    const clamped = clampBannerPositionY(positionY)
    const admin = createAdminClient()

    const { data, error } = await admin
      .from("profiles")
      .update({ banner_position_y: clamped })
      .eq("id", userId)
      .select(MEMBER_PROFILE_SELECT)
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidateProfilePaths()
    return { ok: true, person: toPersonFromProfile(data as unknown as MemberProfileRow) }
  } catch (error) {
    return actionError(error)
  }
}
