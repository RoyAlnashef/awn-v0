import { Resend } from "resend"

import { getEmailFrom } from "@/lib/email/constants"

let resendClient: Resend | null = null

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

export type SendEmailInput = {
  to: string
  subject: string
  html: string
}

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string }

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const to = input.to.trim().toLowerCase()
  if (!to || !to.includes("@")) {
    return { ok: false, error: "Invalid recipient email." }
  }

  const resend = getResend()
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", { to, subject: input.subject })
      return { ok: true, id: "dev-skipped" }
    }
    return { ok: false, error: "Email is not configured." }
  }

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: input.subject,
    html: input.html,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, id: data?.id }
}
