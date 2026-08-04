"use server"

import { revalidatePath } from "next/cache"

import {
  MEMBER_PROFILE_SELECT,
  clampBannerPositionY,
  toPersonFromProfile,
  toProfileUpdateFromPerson,
  type MemberProfileRow,
} from "@/lib/account/profile-data"
import { AuthError } from "@/lib/auth/require-admin"
import { requireProfileEditor } from "@/lib/auth/require-profile-editor"
import type { Person } from "@/lib/people-data"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type ProfileActionResult =
  | { ok: true; person?: Person }
  | { ok: false; error: string }

const BANNER_BUCKET = "banners"
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

  return toPersonFromProfile(data as unknown as MemberProfileRow)
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
    return { ok: true, person: toPersonFromProfile(data as unknown as MemberProfileRow) }
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
