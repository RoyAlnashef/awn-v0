"use server"

import { revalidatePath } from "next/cache"

import { wrapBroadcastBodyHtml } from "@/lib/email/catalog"
import { sendEmail } from "@/lib/email/send"
import { AuthError, requireAdmin } from "@/lib/auth/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DbUserRole, DbUserStatus } from "@/lib/users-data"

export type BroadcastFilters = {
  roles: DbUserRole[]
  statuses: DbUserStatus[]
}

export type BroadcastHistoryItem = {
  id: string
  subject: string
  htmlBody: string
  filters: BroadcastFilters
  recipientCount: number
  sentAt: string
  testSentAt: string | null
  sentByName: string
}

export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; error: string }

const DEFAULT_STATUSES: DbUserStatus[] = ["active"]
const ALL_ROLES: DbUserRole[] = ["owner", "admin", "manager", "member"]

function normalizeFilters(filters: BroadcastFilters): BroadcastFilters {
  return {
    roles: filters.roles.length > 0 ? filters.roles : ALL_ROLES,
    statuses: filters.statuses.length > 0 ? filters.statuses : DEFAULT_STATUSES,
  }
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

async function queryRecipientEmails(
  filters: BroadcastFilters,
): Promise<string[]> {
  const normalized = normalizeFilters(filters)
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("profiles")
    .select("email")
    .in("role", normalized.roles)
    .in("status", normalized.statuses)
    .not("email", "is", null)

  if (error) {
    throw new Error(error.message)
  }

  const emails = new Set<string>()
  for (const row of data ?? []) {
    const email = row.email?.trim().toLowerCase()
    if (email && email.includes("@")) {
      emails.add(email)
    }
  }

  return [...emails]
}

export async function getBroadcastRecipientCount(
  filters: BroadcastFilters,
): Promise<ActionResult<{ count: number }>> {
  try {
    await requireAdmin()
    const emails = await queryRecipientEmails(filters)
    return { ok: true, data: { count: emails.length } }
  } catch (error) {
    return actionError(error)
  }
}

export async function listBroadcastHistory(): Promise<
  ActionResult<{ history: BroadcastHistoryItem[] }>
> {
  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from("email_broadcasts")
      .select(
        `
        id,
        subject,
        html_body,
        filters,
        recipient_count,
        sent_at,
        test_sent_at,
        sender:profiles!email_broadcasts_sent_by_fkey ( full_name )
      `,
      )
      .order("sent_at", { ascending: false })
      .limit(50)

    if (error) {
      return { ok: false, error: error.message }
    }

    const history: BroadcastHistoryItem[] = (data ?? []).map((row) => {
      const filtersRaw = row.filters as Partial<BroadcastFilters> | null
      const senderRaw = row.sender as
        | { full_name: string | null }
        | { full_name: string | null }[]
        | null
      const sender = Array.isArray(senderRaw) ? senderRaw[0] : senderRaw

      return {
        id: row.id,
        subject: row.subject,
        htmlBody: row.html_body,
        filters: {
          roles: filtersRaw?.roles ?? ALL_ROLES,
          statuses: filtersRaw?.statuses ?? DEFAULT_STATUSES,
        },
        recipientCount: row.recipient_count,
        sentAt: row.sent_at,
        testSentAt: row.test_sent_at,
        sentByName: sender?.full_name?.trim() || "Admin",
      }
    })

    return { ok: true, data: { history } }
  } catch (error) {
    return actionError(error)
  }
}

async function sendToRecipients({
  subject,
  html,
  recipients,
}: {
  subject: string
  html: string
  recipients: string[]
}): Promise<{ sent: number; failed: number; lastId?: string }> {
  const BATCH_SIZE = 10
  let sent = 0
  let failed = 0
  let lastId: string | undefined

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map((to) => sendEmail({ to, subject, html })),
    )

    for (const result of results) {
      if (result.ok) {
        sent += 1
        lastId = result.id ?? lastId
      } else {
        failed += 1
      }
    }
  }

  return { sent, failed, lastId }
}

export async function sendBroadcastTest({
  subject,
  bodyText,
  filters,
}: {
  subject: string
  bodyText: string
  filters: BroadcastFilters
}): Promise<ActionResult> {
  try {
    const { profile } = await requireAdmin()
    const trimmedSubject = subject.trim()
    const trimmedBody = bodyText.trim()

    if (!trimmedSubject) {
      return { ok: false, error: "Subject is required." }
    }
    if (!trimmedBody) {
      return { ok: false, error: "Message body is required." }
    }

    const html = wrapBroadcastBodyHtml({
      subject: trimmedSubject,
      bodyText: trimmedBody,
    })

    const result = await sendEmail({
      to: profile.email,
      subject: `[Test] ${trimmedSubject}`,
      html,
    })

    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    return { ok: true }
  } catch (error) {
    return actionError(error)
  }
}

export async function sendBroadcast({
  subject,
  bodyText,
  filters,
}: {
  subject: string
  bodyText: string
  filters: BroadcastFilters
}): Promise<ActionResult<{ recipientCount: number }>> {
  try {
    const { userId } = await requireAdmin()
    const trimmedSubject = subject.trim()
    const trimmedBody = bodyText.trim()

    if (!trimmedSubject) {
      return { ok: false, error: "Subject is required." }
    }
    if (!trimmedBody) {
      return { ok: false, error: "Message body is required." }
    }

    const recipients = await queryRecipientEmails(filters)
    if (recipients.length === 0) {
      return { ok: false, error: "No recipients match the selected filters." }
    }

    const html = wrapBroadcastBodyHtml({
      subject: trimmedSubject,
      bodyText: trimmedBody,
    })

    const { sent, failed, lastId } = await sendToRecipients({
      subject: trimmedSubject,
      html,
      recipients,
    })

    if (sent === 0) {
      return { ok: false, error: "Failed to send to any recipients." }
    }

    const admin = createAdminClient()
    const normalized = normalizeFilters(filters)

    const { error: insertError } = await admin.from("email_broadcasts").insert({
      subject: trimmedSubject,
      html_body: html,
      filters: normalized,
      recipient_count: sent,
      sent_by: userId,
      resend_batch_id: lastId ?? null,
    })

    if (insertError) {
      return {
        ok: false,
        error: `Sent to ${sent} recipients but failed to save history: ${insertError.message}`,
      }
    }

    revalidatePath("/email/broadcast")

    return { ok: true, data: { recipientCount: sent } }
  } catch (error) {
    return actionError(error)
  }
}
