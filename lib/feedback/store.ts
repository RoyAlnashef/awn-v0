import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { initials } from "@/lib/users-data"

import type {
  Feedback,
  FeedbackAttachment,
  FeedbackContext,
  FeedbackImpact,
  FeedbackStatus,
  FeedbackType,
} from "./types"
import { FEEDBACK_STATUSES, isFeedbackImpact, isFeedbackStatus, isFeedbackType } from "./types"

export type CreateFeedbackInput = {
  type: FeedbackType
  impact: FeedbackImpact | null
  area: string
  summary: string
  details: string
  allowContact: boolean
  attachments: FeedbackAttachment[]
  context: FeedbackContext
  submitter: { id: string }
}

export type NewFeedbackAttachmentInput = {
  id: string
  storagePath: string
  name: string
  contentType: string
  sizeBytes: number
  width?: number
  height?: number
}

const FEEDBACK_BUCKET = "feedback-attachments"
const SIGNED_URL_TTL_SECONDS = 3600

const FEEDBACK_SELECT = `
  id,
  reference,
  type,
  status,
  impact,
  area,
  summary,
  details,
  allow_contact,
  context,
  admin_note,
  created_at,
  updated_at,
  user_id,
  submitter:profiles!feedback_user_id_fkey (
    id,
    full_name,
    email,
    avatar_url
  ),
  feedback_attachments (
    id,
    storage_path,
    file_name,
    content_type,
    size_bytes,
    width,
    height
  )
`

type AttachmentRow = {
  id: string
  storage_path: string
  file_name: string
  content_type: string
  size_bytes: number
  width: number | null
  height: number | null
}

type FeedbackRow = {
  id: string
  reference: string
  type: string
  status: string
  impact: string | null
  area: string
  summary: string
  details: string
  allow_contact: boolean
  context: FeedbackContext | null
  admin_note: string
  created_at: string
  updated_at: string
  user_id: string
  submitter: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
  feedback_attachments: AttachmentRow[] | null
}

function parseContext(raw: FeedbackContext | null | undefined): FeedbackContext {
  const value: Partial<FeedbackContext> = raw ?? {}
  return {
    url: String(value.url ?? ""),
    pageTitle: String(value.pageTitle ?? ""),
    userAgent: String(value.userAgent ?? ""),
    viewport: String(value.viewport ?? ""),
    platform:
      value.platform === "ios" || value.platform === "android"
        ? value.platform
        : "web",
    appVersion: value.appVersion ? String(value.appVersion) : undefined,
  }
}

async function signedAttachmentUrls(
  rows: AttachmentRow[],
): Promise<FeedbackAttachment[]> {
  if (rows.length === 0) return []

  const admin = createAdminClient()
  const results = await Promise.all(
    rows.map(async (row) => {
      const { data, error } = await admin.storage
        .from(FEEDBACK_BUCKET)
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS)

      return {
        id: row.id,
        name: row.file_name,
        url: error ? "" : (data?.signedUrl ?? ""),
        contentType: row.content_type,
        sizeBytes: row.size_bytes,
        width: row.width ?? undefined,
        height: row.height ?? undefined,
      } satisfies FeedbackAttachment
    }),
  )

  return results
}

async function mapFeedbackRow(row: FeedbackRow): Promise<Feedback | null> {
  if (!row.submitter) return null
  if (!isFeedbackType(row.type) || !isFeedbackStatus(row.status)) return null

  const impact =
    row.impact === null
      ? null
      : isFeedbackImpact(row.impact)
        ? row.impact
        : null

  const name =
    row.submitter.full_name?.trim() ||
    row.submitter.email?.split("@")[0] ||
    "Member"

  const attachmentRows = row.feedback_attachments ?? []

  return {
    id: row.id,
    reference: row.reference,
    type: row.type,
    status: row.status,
    impact,
    area: row.area,
    summary: row.summary,
    details: row.details,
    allowContact: row.allow_contact,
    attachments: await signedAttachmentUrls(attachmentRows),
    context: parseContext(row.context),
    submitter: {
      id: row.submitter.id,
      name,
      email: row.submitter.email ?? "",
      avatarUrl: row.submitter.avatar_url ?? undefined,
      initials: initials(name),
    },
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function fetchFeedbackById(
  id: string,
  scope: "user" | "admin" = "user",
): Promise<Feedback | null> {
  const supabase =
    scope === "admin" ? createAdminClient() : await createClient()
  const { data, error } = await supabase
    .from("feedback")
    .select(FEEDBACK_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return mapFeedbackRow(data as unknown as FeedbackRow)
}

export async function listFeedbackRecords(): Promise<Feedback[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("feedback")
    .select(FEEDBACK_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as unknown as FeedbackRow[]
  const mapped = await Promise.all(rows.map((row) => mapFeedbackRow(row)))
  return mapped.filter((item): item is Feedback => item !== null)
}

export async function insertFeedbackRecord(
  input: CreateFeedbackInput,
): Promise<Feedback> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      user_id: input.submitter.id,
      type: input.type,
      impact: input.impact,
      area: input.area,
      summary: input.summary,
      details: input.details,
      allow_contact: input.allowContact,
      context: input.context,
    })
    .select("id, reference")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create feedback.")
  }

  const record = await fetchFeedbackById(data.id, "admin")
  if (!record) {
    throw new Error("Failed to load feedback after insert.")
  }

  return record
}

export async function insertFeedbackAttachments(
  feedbackId: string,
  items: NewFeedbackAttachmentInput[],
): Promise<void> {
  if (items.length === 0) return

  const admin = createAdminClient()
  const { error } = await admin.from("feedback_attachments").insert(
    items.map((item) => ({
      id: item.id,
      feedback_id: feedbackId,
      storage_path: item.storagePath,
      file_name: item.name,
      content_type: item.contentType,
      size_bytes: item.sizeBytes,
      width: item.width ?? null,
      height: item.height ?? null,
    })),
  )

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteFeedbackRecord(feedbackId: string): Promise<void> {
  const admin = createAdminClient()

  const { data: attachmentRows } = await admin
    .from("feedback_attachments")
    .select("storage_path")
    .eq("feedback_id", feedbackId)

  const paths = (attachmentRows ?? []).map(
    (row) => row.storage_path as string,
  )

  if (paths.length > 0) {
    await admin.storage.from(FEEDBACK_BUCKET).remove(paths)
  }

  const { error } = await admin.from("feedback").delete().eq("id", feedbackId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateFeedbackRecord(
  id: string,
  patch: { status?: FeedbackStatus; adminNote?: string },
): Promise<Feedback | null> {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  if (patch.status !== undefined) {
    if (!FEEDBACK_STATUSES.includes(patch.status)) return null
    updates.status = patch.status
  }
  if (patch.adminNote !== undefined) {
    updates.admin_note = patch.adminNote
  }

  if (Object.keys(updates).length === 0) {
    return fetchFeedbackById(id)
  }

  const { error } = await supabase.from("feedback").update(updates).eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  return fetchFeedbackById(id)
}

/** @internal exported for actions upload path helper */
export const FEEDBACK_ATTACHMENTS_BUCKET = FEEDBACK_BUCKET

export function feedbackAttachmentStoragePath(
  userId: string,
  feedbackId: string,
  attachmentId: string,
  contentType: string,
): string {
  const ext = extForContentType(contentType)
  return `${userId}/${feedbackId}/${attachmentId}.${ext}`
}

function extForContentType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png"
    case "image/jpeg":
      return "jpg"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "bin"
  }
}
