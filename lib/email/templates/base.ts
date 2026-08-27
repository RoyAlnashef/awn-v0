export function emailLayout({
  preview,
  body,
}: {
  preview: string
  body: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${preview}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${preview}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0b;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#141416;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 28px 8px;">
              <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#a1a1aa;">A Wright Network</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 32px;color:#fafafa;">
              ${body}
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#71717a;text-align:center;">
          Touring crew, connected.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:28px 0 0;">
  <a href="${href}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px;">
    ${label}
  </a>
</p>`
}
