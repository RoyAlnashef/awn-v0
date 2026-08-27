import { emailLayout } from "@/lib/email/templates/base"

export function applicationDeniedHtml({
  note,
}: {
  note?: string | null
}) {
  const preview = "Update on your AWN application"

  const noteBlock = note?.trim()
    ? `<p style="margin:16px 0 0;padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;font-size:14px;line-height:1.6;color:#d4d4d8;">
        ${note.trim().replace(/\n/g, "<br />")}
      </p>`
    : ""

  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;line-height:1.3;color:#fafafa;">
      Application update
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#d4d4d8;">
      Thank you for applying to A Wright Network. After review, we're unable to approve your application at this time.
    </p>
    ${noteBlock}
  `

  return emailLayout({ preview, body })
}

export const applicationDeniedSubject =
  "Update on your AWN application"
