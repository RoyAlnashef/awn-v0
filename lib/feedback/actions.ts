"use server"

import { revalidatePath } from "next/cache"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { AuthError, requireAdmin } from "@/lib/auth/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

import {
  deleteFeedbackRecord,
  feedbackAttachmentStoragePath,
  FEEDBACK_ATTACHMENTS_BUCKET,
  insertFeedbackAttachments,
  insertFeedbackRecord,
  listFeedbackRecords,
  updateFeedbackRecord,
} from "./store"
import {
  FEEDBACK_ACCEPTED_IMAGE_TYPES,
  FEEDBACK_GENERAL_AREA,
  FEEDBACK_LIMITS,
  FEEDBACK_TYPE_CONFIG,
  isFeedbackImpact,
  isFeedbackStatus,
  isFeedbackType,
  type Feedback,
  type FeedbackContext,
  type FeedbackStatus,
} from "./types"

export type SubmitFeedbackResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> }

export type ListFeedbackResult =
  | { ok: true; items: Feedback[] }
  | { ok: false; error: string; items: [] }

export type UpdateFeedbackResult =
  | { ok: true; item: Feedback }
  | { ok: false; error: string }

export type FeedbackNewCountResult =
  | { ok: true; count: number }
  | { ok: false; error: string }

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function parseContext(raw: string): FeedbackContext {
  const fallback: FeedbackContext = {
    url: "",
    pageTitle: "",
    userAgent: "",
    viewport: "",
    platform: "web",
  }
  try {
    const parsed = JSON.parse(raw) as Partial<FeedbackContext>
    return {
      url: String(parsed.url ?? "").slice(0, 2000),
      pageTitle: String(parsed.pageTitle ?? "").slice(0, 200),
      userAgent: String(parsed.userAgent ?? "").slice(0, 500),
      viewport: String(parsed.viewport ?? "").slice(0, 40),
      platform:
        parsed.platform === "ios" || parsed.platform === "android"
          ? parsed.platform
          : "web",
      appVersion: parsed.appVersion
        ? String(parsed.appVersion).slice(0, 40)
        : undefined,
    }
  } catch {
    return fallback
  }
}

async function uploadFeedbackAttachment(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  feedbackId: string,
  file: File,
): Promise<{ id: string; storagePath: string; name: string; contentType: string; sizeBytes: number }> {
  const id = crypto.randomUUID()
  const contentType = file.type
  const storagePath = feedbackAttachmentStoragePath(
    userId,
    feedbackId,
    id,
    contentType,
  )
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage
    .from(FEEDBACK_ATTACHMENTS_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  return {
    id,
    storagePath,
    name: file.name.slice(0, 200),
    contentType,
    sizeBytes: file.size,
  }
}

export async function submitFeedback(
  formData: FormData,
): Promise<SubmitFeedbackResult> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return { ok: false, error: "Please sign in to send feedback." }
  }

  const type = readString(formData, "type")
  const impactRaw = readString(formData, "impact")
  const area = readString(formData, "area") || FEEDBACK_GENERAL_AREA
  const summary = readString(formData, "summary")
  const details = readString(formData, "details")
  const allowContact = readString(formData, "allowContact") === "true"
  const context = parseContext(readString(formData, "context"))
  const files = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  const fieldErrors: Partial<Record<string, string>> = {}

  if (!isFeedbackType(type)) {
    fieldErrors.type = "Choose what kind of feedback this is."
  }
  if (!summary) {
    fieldErrors.summary = "Add a short summary."
  } else if (summary.length > FEEDBACK_LIMITS.summaryMax) {
    fieldErrors.summary = `Keep it under ${FEEDBACK_LIMITS.summaryMax} characters.`
  }
  if (details.length < FEEDBACK_LIMITS.detailsMin) {
    fieldErrors.details = "Add a few more details so we can follow up."
  } else if (details.length > FEEDBACK_LIMITS.detailsMax) {
    fieldErrors.details = `Keep it under ${FEEDBACK_LIMITS.detailsMax} characters.`
  }
  if (files.length > FEEDBACK_LIMITS.maxAttachments) {
    fieldErrors.attachments = `Attach up to ${FEEDBACK_LIMITS.maxAttachments} images.`
  }
  const acceptedTypes: readonly string[] = FEEDBACK_ACCEPTED_IMAGE_TYPES
  if (files.some((file) => !acceptedTypes.includes(file.type))) {
    fieldErrors.attachments = "Attachments must be PNG, JPG, WebP, or GIF images."
  }
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > FEEDBACK_LIMITS.maxTotalUploadBytes) {
    fieldErrors.attachments = "Attachments are too large. Try fewer images."
  }

  if (Object.keys(fieldErrors).length > 0 || !isFeedbackType(type)) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors }
  }

  const impact =
    FEEDBACK_TYPE_CONFIG[type].asksImpact && isFeedbackImpact(impactRaw)
      ? impactRaw
      : null

  let feedbackId: string | null = null
  const uploadedPaths: string[] = []

  try {
    const record = await insertFeedbackRecord({
      type,
      impact,
      area: area.slice(0, 80),
      summary,
      details,
      allowContact,
      attachments: [],
      context,
      submitter: { id: sessionUser.id },
    })
    feedbackId = record.id

    if (files.length > 0) {
      const admin = createAdminClient()
      const uploaded = []

      for (const file of files) {
        const item = await uploadFeedbackAttachment(
          admin,
          sessionUser.id,
          record.id,
          file,
        )
        uploadedPaths.push(item.storagePath)
        uploaded.push({
          id: item.id,
          storagePath: item.storagePath,
          name: item.name,
          contentType: item.contentType,
          sizeBytes: item.sizeBytes,
        })
      }

      await insertFeedbackAttachments(record.id, uploaded)
    }

    revalidatePath("/feedback")
    return { ok: true, reference: record.reference }
  } catch (error) {
    console.error("[feedback] submit failed", error)

    if (feedbackId) {
      try {
        await deleteFeedbackRecord(feedbackId)
      } catch (cleanupError) {
        console.error("[feedback] cleanup failed", cleanupError)
      }
    } else if (uploadedPaths.length > 0) {
      try {
        const admin = createAdminClient()
        await admin.storage.from(FEEDBACK_ATTACHMENTS_BUCKET).remove(uploadedPaths)
      } catch (cleanupError) {
        console.error("[feedback] storage cleanup failed", cleanupError)
      }
    }

    return { ok: false, error: "Something went wrong sending your feedback." }
  }
}

export async function getFeedbackNewCount(): Promise<FeedbackNewCountResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { count, error } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, count: count ?? 0 }
  } catch (error) {
    const message =
      error instanceof AuthError ? error.message : "Failed to load feedback count."
    return { ok: false, error: message }
  }
}

export async function listFeedback(): Promise<ListFeedbackResult> {
  try {
    await requireAdmin()
    return { ok: true, items: await listFeedbackRecords() }
  } catch (error) {
    const message =
      error instanceof AuthError ? error.message : "Failed to load feedback."
    return { ok: false, error: message, items: [] }
  }
}

export async function updateFeedback(
  id: string,
  patch: { status?: FeedbackStatus; adminNote?: string },
): Promise<UpdateFeedbackResult> {
  try {
    await requireAdmin()

    if (patch.status !== undefined && !isFeedbackStatus(patch.status)) {
      return { ok: false, error: "Unknown status." }
    }
    const adminNote =
      patch.adminNote === undefined
        ? undefined
        : patch.adminNote.trim().slice(0, FEEDBACK_LIMITS.noteMax)

    const item = await updateFeedbackRecord(id, {
      status: patch.status,
      adminNote,
    })
    if (!item) return { ok: false, error: "Feedback not found." }

    revalidatePath("/feedback")
    return { ok: true, item }
  } catch (error) {
    const message =
      error instanceof AuthError ? error.message : "Failed to update feedback."
    return { ok: false, error: message }
  }
}
