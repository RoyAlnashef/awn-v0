"use server"

import { revalidatePath } from "next/cache"

import {
  cloneTemplateContent,
  EMAIL_TEMPLATE_IDS,
  getTemplateDefaults,
  isEmailTemplateId,
  mergeTemplateContent,
  validateEmailTemplateContent,
  type EmailTemplateContent,
  type EmailTemplateId,
} from "@/lib/email/template-content"
import { AuthError, requireAdmin } from "@/lib/auth/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"

export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; error: string }

export type SavedTemplateContent = EmailTemplateContent & {
  isCustomized: boolean
  updatedAt: string | null
}

export type AllTemplateContentMap = Record<EmailTemplateId, SavedTemplateContent>

type TemplateContentRow = {
  template_id: string
  content: EmailTemplateContent
  updated_at: string
}

function actionError(error: unknown): { ok: false; error: string } {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message }
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message }
  }
  return { ok: false, error: "Something went wrong." }
}

function parseStoredContent(value: unknown): Partial<EmailTemplateContent> | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  if (typeof record.subject !== "string") return null
  if (typeof record.preview !== "string") return null
  if (typeof record.heading !== "string") return null
  if (!Array.isArray(record.paragraphs)) return null

  return {
    subject: record.subject,
    preview: record.preview,
    heading: record.heading,
    paragraphs: record.paragraphs.filter(
      (p): p is string => typeof p === "string",
    ),
    buttonLabel:
      typeof record.buttonLabel === "string" ? record.buttonLabel : undefined,
  }
}

async function loadTemplateOverrideForSend(
  templateId: EmailTemplateId,
): Promise<Partial<EmailTemplateContent> | null> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("email_template_content")
    .select("content")
    .eq("template_id", templateId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return parseStoredContent(data.content)
}

async function loadTemplateOverrideForAdmin(
  templateId: EmailTemplateId,
): Promise<{ content: Partial<EmailTemplateContent> | null; updatedAt: string | null }> {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from("email_template_content")
    .select("content, updated_at")
    .eq("template_id", templateId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return { content: null, updatedAt: null }
  }

  return {
    content: parseStoredContent(data.content),
    updatedAt: data.updated_at,
  }
}

function toSavedTemplateContent(
  templateId: EmailTemplateId,
  override: Partial<EmailTemplateContent> | null,
  updatedAt: string | null,
): SavedTemplateContent {
  const merged = mergeTemplateContent(templateId, override)
  return {
    ...merged,
    isCustomized: override !== null,
    updatedAt,
  }
}

export async function getEmailTemplateContent(
  templateId: string,
): Promise<ActionResult<SavedTemplateContent>> {
  try {
    if (!isEmailTemplateId(templateId)) {
      return { ok: false, error: "Unknown template." }
    }

    const { content, updatedAt } = await loadTemplateOverrideForAdmin(templateId)
    return {
      ok: true,
      data: toSavedTemplateContent(templateId, content, updatedAt),
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function getAllTemplateContent(): Promise<
  ActionResult<AllTemplateContentMap>
> {
  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from("email_template_content")
      .select("template_id, content, updated_at")

    if (error) {
      return { ok: false, error: error.message }
    }

    const overrides = new Map<string, TemplateContentRow>()
    for (const row of data ?? []) {
      overrides.set(row.template_id, row as TemplateContentRow)
    }

    const result = {} as AllTemplateContentMap
    for (const id of EMAIL_TEMPLATE_IDS) {
      const row = overrides.get(id)
      result[id] = toSavedTemplateContent(
        id,
        row ? parseStoredContent(row.content) : null,
        row?.updated_at ?? null,
      )
    }

    return { ok: true, data: result }
  } catch (error) {
    return actionError(error)
  }
}

export async function saveEmailTemplateContent(
  templateId: string,
  content: EmailTemplateContent,
): Promise<ActionResult<SavedTemplateContent>> {
  try {
    if (!isEmailTemplateId(templateId)) {
      return { ok: false, error: "Unknown template." }
    }

    const normalized: EmailTemplateContent = {
      subject: content.subject.trim(),
      preview: content.preview.trim(),
      heading: content.heading.trim(),
      paragraphs: content.paragraphs.map((p) => p.trim()).filter(Boolean),
      buttonLabel: content.buttonLabel?.trim() || undefined,
    }

    const validationError = validateEmailTemplateContent(normalized, templateId)
    if (validationError) {
      return { ok: false, error: validationError }
    }

    const { userId } = await requireAdmin()
    const admin = createAdminClient()
    const now = new Date().toISOString()

    const { error } = await admin.from("email_template_content").upsert(
      {
        template_id: templateId,
        content: normalized,
        updated_at: now,
        updated_by: userId,
      },
      { onConflict: "template_id" },
    )

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath("/email/templates")

    return {
      ok: true,
      data: {
        ...cloneTemplateContent(normalized),
        isCustomized: true,
        updatedAt: now,
      },
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function resolveEmailTemplateContent(
  templateId: EmailTemplateId,
): Promise<EmailTemplateContent> {
  try {
    const content = await loadTemplateOverrideForSend(templateId)
    return mergeTemplateContent(templateId, content)
  } catch {
    return getTemplateDefaults(templateId)
  }
}
