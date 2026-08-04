"use server"

import { revalidatePath } from "next/cache"

import { AuthError } from "@/lib/auth/require-admin"
import { requireProfileEditor } from "@/lib/auth/require-profile-editor"
import { createAdminClient } from "@/lib/supabase/admin"

export type AvatarActionResult =
  | { ok: true; avatarUrl?: string }
  | { ok: false; error: string }

const AVATAR_BUCKET = "avatars"
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function actionError(error: unknown): AvatarActionResult {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message }
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Something went wrong." }
}

function avatarPublicUrl(userId: string, ext: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  }
  return `${base}/storage/v1/object/public/${AVATAR_BUCKET}/${userId}/avatar.${ext}`
}

function avatarObjectPath(userId: string, ext: string): string {
  return `${userId}/avatar.${ext}`
}

async function deleteUserAvatarObjects(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const { data: objects, error: listError } = await admin.storage
    .from(AVATAR_BUCKET)
    .list(userId)

  if (listError) {
    throw new Error(listError.message)
  }

  if (!objects?.length) return

  const paths = objects.map((obj) => `${userId}/${obj.name}`)
  const { error: removeError } = await admin.storage
    .from(AVATAR_BUCKET)
    .remove(paths)

  if (removeError) {
    throw new Error(removeError.message)
  }
}

function revalidateAvatarPaths() {
  revalidatePath("/users")
  revalidatePath("/settings")
  revalidatePath("/account/profile")
  revalidatePath("/account", "layout")
  revalidatePath("/", "layout")
}

export async function uploadUserAvatar(
  userId: string,
  formData: FormData,
): Promise<AvatarActionResult> {
  try {
    await requireProfileEditor(userId)

    const file = formData.get("file")
    if (!(file instanceof File)) {
      return { ok: false, error: "No file was provided." }
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return {
        ok: false,
        error: "Use a JPEG, PNG, or WebP image.",
      }
    }

    if (file.size > MAX_BYTES) {
      return { ok: false, error: "Image must be 2 MB or smaller." }
    }

    const ext = EXT_BY_MIME[file.type]
    if (!ext) {
      return { ok: false, error: "Unsupported image type." }
    }

    const admin = createAdminClient()
    await deleteUserAvatarObjects(admin, userId)

    const objectPath = avatarObjectPath(userId, ext)
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from(AVATAR_BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return { ok: false, error: uploadError.message }
    }

    const avatarUrl = avatarPublicUrl(userId, ext)

    const { error: profileError } = await admin
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId)

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    revalidateAvatarPaths()
    return { ok: true, avatarUrl }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeUserAvatar(
  userId: string,
): Promise<AvatarActionResult> {
  try {
    await requireProfileEditor(userId)

    const admin = createAdminClient()
    await deleteUserAvatarObjects(admin, userId)

    const { error: profileError } = await admin
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId)

    if (profileError) {
      return { ok: false, error: profileError.message }
    }

    revalidateAvatarPaths()
    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}
