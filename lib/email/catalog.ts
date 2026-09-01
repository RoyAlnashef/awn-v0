import { inviteEmailHtml, inviteEmailSubject } from "@/lib/email/templates/invite-email"
import {
  applicationConfirmationHtml,
  applicationConfirmationSubject,
} from "@/lib/email/templates/application-confirmation"
import {
  applicationApprovedHtml,
  applicationApprovedSubject,
} from "@/lib/email/templates/application-approved"
import {
  applicationDeniedHtml,
  applicationDeniedSubject,
} from "@/lib/email/templates/application-denied"
import {
  emailLayout,
  emailTextStyle,
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"
import {
  confirmationPreviewHtml,
  confirmationSubject,
  confirmationSupabaseHtml,
} from "@/lib/email/templates/supabase/confirmation"
import {
  emailChangePreviewHtml,
  emailChangeSubject,
  emailChangeSupabaseHtml,
} from "@/lib/email/templates/supabase/email-change"
import {
  inviteUserPreviewHtml,
  inviteUserSubject,
  inviteUserSupabaseHtml,
} from "@/lib/email/templates/supabase/invite-user"
import {
  magicLinkPreviewHtml,
  magicLinkSubject,
  magicLinkSupabaseHtml,
} from "@/lib/email/templates/supabase/magic-link"
import {
  reauthenticationPreviewHtml,
  reauthenticationSubject,
  reauthenticationSupabaseHtml,
} from "@/lib/email/templates/supabase/reauthentication"
import {
  recoveryPreviewHtml,
  recoverySubject,
  recoverySupabaseHtml,
} from "@/lib/email/templates/supabase/recovery"

export type EmailTemplateSource = "resend" | "supabase"

export type EmailTemplateEntry = {
  id: string
  name: string
  description: string
  source: EmailTemplateSource
  category: "transactional" | "auth"
  defaultSubject: string
  /** HTML for in-app preview (sample data substituted). */
  previewHtml: string
  /** Raw HTML with Go template tags — Supabase entries only. */
  supabaseHtml?: string
  /** Where admins paste Supabase templates in the Dashboard. */
  supabaseDashboardPath?: string
}

export const emailTemplateCatalog: EmailTemplateEntry[] = [
  {
    id: "invite",
    name: "Member invite",
    description: "Sent when a member invites someone to apply for AWN membership.",
    source: "resend",
    category: "transactional",
    defaultSubject: inviteEmailSubject("Alex Rivera"),
    previewHtml: inviteEmailHtml({
      inviterName: "Alex Rivera",
      token: "sample-invite-token",
    }),
  },
  {
    id: "application-confirmation",
    name: "Application received",
    description: "Sent when an invitee submits their membership application.",
    source: "resend",
    category: "transactional",
    defaultSubject: applicationConfirmationSubject,
    previewHtml: applicationConfirmationHtml(),
  },
  {
    id: "application-approved",
    name: "Application approved",
    description: "Sent when an admin approves a membership application.",
    source: "resend",
    category: "transactional",
    defaultSubject: applicationApprovedSubject,
    previewHtml: applicationApprovedHtml(),
  },
  {
    id: "application-denied",
    name: "Application denied",
    description: "Sent when an admin denies an application with an optional note.",
    source: "resend",
    category: "transactional",
    defaultSubject: applicationDeniedSubject,
    previewHtml: applicationDeniedHtml({
      note: "Thanks for your interest. We're keeping membership focused on active touring crew for now.",
    }),
  },
  {
    id: "supabase-magic-link",
    name: "Magic link",
    description: "Supabase Auth sign-in link (OTP login).",
    source: "supabase",
    category: "auth",
    defaultSubject: magicLinkSubject,
    previewHtml: magicLinkPreviewHtml(),
    supabaseHtml: magicLinkSupabaseHtml(),
    supabaseDashboardPath: "Authentication → Email Templates → Magic Link",
  },
  {
    id: "supabase-recovery",
    name: "Password recovery",
    description: "Supabase Auth password reset email.",
    source: "supabase",
    category: "auth",
    defaultSubject: recoverySubject,
    previewHtml: recoveryPreviewHtml(),
    supabaseHtml: recoverySupabaseHtml(),
    supabaseDashboardPath: "Authentication → Email Templates → Reset Password",
  },
  {
    id: "supabase-confirmation",
    name: "Confirm signup",
    description: "Supabase Auth email confirmation for new accounts.",
    source: "supabase",
    category: "auth",
    defaultSubject: confirmationSubject,
    previewHtml: confirmationPreviewHtml(),
    supabaseHtml: confirmationSupabaseHtml(),
    supabaseDashboardPath: "Authentication → Email Templates → Confirm Signup",
  },
  {
    id: "supabase-invite-user",
    name: "Invite user",
    description: "Supabase Auth invite when creating users from the Dashboard.",
    source: "supabase",
    category: "auth",
    defaultSubject: inviteUserSubject,
    previewHtml: inviteUserPreviewHtml(),
    supabaseHtml: inviteUserSupabaseHtml(),
    supabaseDashboardPath: "Authentication → Email Templates → Invite User",
  },
  {
    id: "supabase-email-change",
    name: "Email change",
    description: "Supabase Auth confirmation when a user changes their email.",
    source: "supabase",
    category: "auth",
    defaultSubject: emailChangeSubject,
    previewHtml: emailChangePreviewHtml(),
    supabaseHtml: emailChangeSupabaseHtml(),
    supabaseDashboardPath: "Authentication → Email Templates → Change Email Address",
  },
  {
    id: "supabase-reauthentication",
    name: "Reauthentication",
    description: "Supabase Auth verification for sensitive account actions.",
    source: "supabase",
    category: "auth",
    defaultSubject: reauthenticationSubject,
    previewHtml: reauthenticationPreviewHtml(),
    supabaseHtml: reauthenticationSupabaseHtml(),
    supabaseDashboardPath: "Authentication → Email Templates → Reauthentication",
  },
]

export function getTemplatePreviewHtml(
  id: string,
  theme: EmailTheme = "dark",
): string {
  switch (id) {
    case "invite":
      return inviteEmailHtml({
        inviterName: "Alex Rivera",
        token: "sample-invite-token",
        theme,
      })
    case "application-confirmation":
      return applicationConfirmationHtml(theme)
    case "application-approved":
      return applicationApprovedHtml(theme)
    case "application-denied":
      return applicationDeniedHtml({
        note: "Thanks for your interest. We're keeping membership focused on active touring crew for now.",
        theme,
      })
    case "supabase-magic-link":
      return magicLinkPreviewHtml(theme)
    case "supabase-recovery":
      return recoveryPreviewHtml(theme)
    case "supabase-confirmation":
      return confirmationPreviewHtml(theme)
    case "supabase-invite-user":
      return inviteUserPreviewHtml(theme)
    case "supabase-email-change":
      return emailChangePreviewHtml(theme)
    case "supabase-reauthentication":
      return reauthenticationPreviewHtml(theme)
    default:
      return getEmailTemplateById(id)?.previewHtml ?? ""
  }
}

export function getEmailTemplateById(id: string): EmailTemplateEntry | undefined {
  return emailTemplateCatalog.find((entry) => entry.id === id)
}

export function wrapBroadcastBodyHtml({
  subject,
  bodyText,
  theme = "dark",
}: {
  subject: string
  bodyText: string
  theme?: EmailTheme
}): string {
  const colors = emailThemeColors(theme)
  const blocks = bodyText
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  const paragraphs = blocks
    .map(
      (block, index) =>
        `<p style="margin:0${index > 0 ? ";margin-top:16px" : ""};font-size:15px;line-height:1.6;color:${colors.body};">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`,
    )
    .join("")

  const body = `
    <h1 style="${emailTextStyle(theme, "heading")}">
      ${escapeHtml(subject)}
    </h1>
    ${paragraphs || `<p style="margin:0;font-size:15px;line-height:1.6;color:${colors.body};">&nbsp;</p>`}
  `

  return emailLayout({ preview: subject, body, theme })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
