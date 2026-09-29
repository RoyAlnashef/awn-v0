import { getAppOrigin } from "@/lib/email/constants"
import { buildInviteApplyUrl } from "@/lib/invites/urls"
import {
  emailButton,
  emailLayout,
  emailTextStyle,
  emailThemeColors,
  type EmailTheme,
} from "@/lib/email/templates/base"
import {
  renderSupabaseTemplate,
  substituteSupabaseTags,
} from "@/lib/email/templates/supabase/shared"

export const EMAIL_TEMPLATE_IDS = [
  "invite",
  "application-confirmation",
  "application-approved",
  "application-denied",
  "supabase-magic-link",
  "supabase-recovery",
  "supabase-confirmation",
  "supabase-invite-user",
  "supabase-email-change",
  "supabase-reauthentication",
] as const

export type EmailTemplateId = (typeof EMAIL_TEMPLATE_IDS)[number]

export type EmailTemplateContent = {
  subject: string
  preview: string
  heading: string
  paragraphs: string[]
  buttonLabel?: string
}

export type RenderTemplateOptions = {
  theme?: EmailTheme
  inviterName?: string
  token?: string
  origin?: string
  note?: string | null
}

type TemplateMeta = {
  source: "resend" | "supabase"
  hasButton: boolean
  footerNote?: (theme: EmailTheme) => string
}

const TEMPLATE_META: Record<EmailTemplateId, TemplateMeta> = {
  invite: { source: "resend", hasButton: true },
  "application-confirmation": { source: "resend", hasButton: true },
  "application-approved": { source: "resend", hasButton: true },
  "application-denied": { source: "resend", hasButton: false },
  "supabase-magic-link": {
    source: "supabase",
    hasButton: true,
    footerNote: (theme) => {
      const colors = emailThemeColors(theme)
      return `Or enter this code: <strong style="color:${colors.strong};">{{ .Token }}</strong>`
    },
  },
  "supabase-recovery": {
    source: "supabase",
    hasButton: true,
    footerNote: (theme) => {
      const colors = emailThemeColors(theme)
      return `Or enter this code: <strong style="color:${colors.strong};">{{ .Token }}</strong>`
    },
  },
  "supabase-confirmation": { source: "supabase", hasButton: true },
  "supabase-invite-user": { source: "supabase", hasButton: true },
  "supabase-email-change": { source: "supabase", hasButton: true },
  "supabase-reauthentication": {
    source: "supabase",
    hasButton: true,
    footerNote: (theme) => {
      const colors = emailThemeColors(theme)
      return `Your verification code: <strong style="color:${colors.strong};font-size:18px;letter-spacing:0.1em;">{{ .Token }}</strong>`
    },
  },
}

const TEMPLATE_DEFAULTS: Record<EmailTemplateId, EmailTemplateContent> = {
  invite: {
    subject: "{{inviterName}} invited you to join A Wright Network",
    preview: "{{inviterName}} invited you to join AWN",
    heading: "You're invited to AWN",
    paragraphs: [
      "{{inviterName}} invited you to apply for membership on A Wright Network — the private network for live entertainment crew.",
      "Complete your application to join. Membership is reviewed manually by our team.",
    ],
    buttonLabel: "Start your application",
  },
  "application-confirmation": {
    subject: "We received your AWN application",
    preview: "Your AWN application was received",
    heading: "Application received",
    paragraphs: [
      "Thanks for applying to A Wright Network. Our team will review your application and you'll hear from us soon.",
      "You can sign in anytime to check your application status.",
    ],
    buttonLabel: "View application status",
  },
  "application-approved": {
    subject: "Welcome to A Wright Network — you're approved",
    preview: "Welcome to A Wright Network",
    heading: "You're approved",
    paragraphs: [
      "Welcome to A Wright Network. Your membership application has been approved — sign in to start connecting with crew across the network.",
    ],
    buttonLabel: "Sign in to AWN",
  },
  "application-denied": {
    subject: "Update on your AWN application",
    preview: "Update on your AWN application",
    heading: "Application update",
    paragraphs: [
      "Thank you for applying to A Wright Network. After review, we're unable to approve your application at this time.",
    ],
  },
  "supabase-magic-link": {
    subject: "Your AWN sign-in link",
    preview: "Sign in to A Wright Network",
    heading: "Sign in to AWN",
    paragraphs: [
      "Use the button below to sign in to your A Wright Network account. This link expires soon.",
      "If you didn't request this email, you can safely ignore it.",
    ],
    buttonLabel: "Sign in to AWN",
  },
  "supabase-recovery": {
    subject: "Reset your AWN password",
    preview: "Reset your A Wright Network password",
    heading: "Reset your password",
    paragraphs: [
      "We received a request to reset the password for your AWN account.",
      "If you didn't request a reset, you can ignore this email.",
    ],
    buttonLabel: "Reset password",
  },
  "supabase-confirmation": {
    subject: "Confirm your AWN account",
    preview: "Confirm your A Wright Network account",
    heading: "Confirm your email",
    paragraphs: [
      "Thanks for signing up for A Wright Network. Confirm your email address to finish setting up your account.",
    ],
    buttonLabel: "Confirm email",
  },
  "supabase-invite-user": {
    subject: "You're invited to AWN",
    preview: "You're invited to A Wright Network",
    heading: "You're invited to AWN",
    paragraphs: [
      "You've been invited to join A Wright Network — the private network for live entertainment crew.",
      "Accept the invite to create your account and complete your profile.",
    ],
    buttonLabel: "Accept invite",
  },
  "supabase-email-change": {
    subject: "Confirm your new AWN email",
    preview: "Confirm your new AWN email address",
    heading: "Confirm email change",
    paragraphs: [
      "You requested to change the email on your AWN account from {{ .OldEmail }} to {{ .NewEmail }}.",
      "Confirm this change using the button below.",
    ],
    buttonLabel: "Confirm new email",
  },
  "supabase-reauthentication": {
    subject: "Confirm it's you — AWN",
    preview: "Confirm your identity on AWN",
    heading: "Confirm it's you",
    paragraphs: [
      "For your security, enter the code below to continue with a sensitive account action.",
    ],
    buttonLabel: "Continue",
  },
}

export function isEmailTemplateId(id: string): id is EmailTemplateId {
  return EMAIL_TEMPLATE_IDS.includes(id as EmailTemplateId)
}

export function getTemplateMeta(id: EmailTemplateId): TemplateMeta {
  return TEMPLATE_META[id]
}

export function getTemplateDefaults(id: EmailTemplateId): EmailTemplateContent {
  const defaults = TEMPLATE_DEFAULTS[id]
  return {
    ...defaults,
    paragraphs: [...defaults.paragraphs],
  }
}

export function mergeTemplateContent(
  id: EmailTemplateId,
  override: Partial<EmailTemplateContent> | null | undefined,
): EmailTemplateContent {
  const defaults = getTemplateDefaults(id)
  if (!override) return defaults

  return {
    subject: override.subject?.trim() || defaults.subject,
    preview: override.preview?.trim() || defaults.preview,
    heading: override.heading?.trim() || defaults.heading,
    paragraphs:
      override.paragraphs && override.paragraphs.length > 0
        ? override.paragraphs.map((p) => p.trim()).filter(Boolean)
        : defaults.paragraphs,
    buttonLabel:
      override.buttonLabel !== undefined
        ? override.buttonLabel.trim() || undefined
        : defaults.buttonLabel,
  }
}

export function validateEmailTemplateContent(
  content: EmailTemplateContent,
  templateId: EmailTemplateId,
): string | null {
  if (!content.subject.trim()) return "Subject is required."
  if (!content.preview.trim()) return "Preview line is required."
  if (!content.heading.trim()) return "Heading is required."
  if (content.paragraphs.length === 0) {
    return "At least one paragraph is required."
  }
  if (content.paragraphs.some((p) => !p.trim())) {
    return "Paragraphs cannot be empty."
  }

  const meta = TEMPLATE_META[templateId]
  if (meta.hasButton && !content.buttonLabel?.trim()) {
    return "Button label is required for this template."
  }

  return null
}

export function substituteInviterPlaceholders(
  value: string,
  inviterName: string,
): string {
  return value.replace(/\{\{inviterName\}\}/g, inviterName)
}

function buildParagraphHtml(
  paragraphs: string[],
  theme: EmailTheme,
): string {
  const colors = emailThemeColors(theme)
  return paragraphs
    .map(
      (p, index) =>
        `<p style="margin:0${index > 0 ? ";margin-top:16px" : ""};font-size:15px;line-height:1.6;color:${colors.body};">${p}</p>`,
    )
    .join("")
}

function buildResendBody(
  content: EmailTemplateContent,
  theme: EmailTheme,
  options: {
    buttonHref?: string
    note?: string | null
    afterButtonHtml?: string
  },
): string {
  const colors = emailThemeColors(theme)
  const paragraphHtml = buildParagraphHtml(content.paragraphs, theme)

  const buttonHtml =
    content.buttonLabel && options.buttonHref
      ? emailButton(options.buttonHref, content.buttonLabel, theme)
      : ""

  const noteBlock = options.note?.trim()
    ? `<p style="margin:16px 0 0;padding:16px;background:${colors.noteBg};border:1px solid ${colors.noteBorder};border-radius:12px;font-size:14px;line-height:1.6;color:${colors.body};">
        ${options.note.trim().replace(/\n/g, "<br />")}
      </p>`
    : ""

  return `
    <h1 style="${emailTextStyle(theme, "heading")}">
      ${content.heading}
    </h1>
    ${paragraphHtml}
    ${noteBlock}
    ${buttonHtml}
    ${options.afterButtonHtml ?? ""}
  `
}

function resolveButtonHref(
  id: EmailTemplateId,
  options: RenderTemplateOptions,
): string | undefined {
  switch (id) {
    case "invite":
      return buildInviteApplyUrl(
        options.token ?? "sample-invite-token",
        options.origin,
      )
    case "application-confirmation":
      return `${getAppOrigin()}/pending`
    case "application-approved":
      return `${getAppOrigin()}/login`
    default:
      return undefined
  }
}

function prepareContentForRender(
  id: EmailTemplateId,
  content: EmailTemplateContent,
  options: RenderTemplateOptions,
): EmailTemplateContent {
  if (id !== "invite") return content

  const inviterName = options.inviterName ?? "Alex Rivera"
  return {
    ...content,
    subject: substituteInviterPlaceholders(content.subject, inviterName),
    preview: substituteInviterPlaceholders(content.preview, inviterName),
    heading: substituteInviterPlaceholders(content.heading, inviterName),
    paragraphs: content.paragraphs.map((p) =>
      substituteInviterPlaceholders(p, inviterName),
    ),
    buttonLabel: content.buttonLabel
      ? substituteInviterPlaceholders(content.buttonLabel, inviterName)
      : content.buttonLabel,
  }
}

export function renderTemplateSubject(
  id: EmailTemplateId,
  content: EmailTemplateContent,
  options: RenderTemplateOptions = {},
): string {
  const prepared = prepareContentForRender(id, content, options)
  return prepared.subject
}

export function renderTemplateHtml(
  id: EmailTemplateId,
  content: EmailTemplateContent,
  options: RenderTemplateOptions = {},
): string {
  const theme = options.theme ?? "dark"
  const meta = TEMPLATE_META[id]
  const prepared = prepareContentForRender(id, content, options)

  if (meta.source === "supabase") {
    const footerNote = meta.footerNote?.(theme)
    const html = renderSupabaseTemplate({
      preview: prepared.preview,
      heading: prepared.heading,
      paragraphs: prepared.paragraphs,
      buttonLabel: prepared.buttonLabel,
      buttonHref: "{{ .ConfirmationURL }}",
      footerNote,
      theme,
    })
    return substituteSupabaseTags(html)
  }

  let afterButtonHtml: string | undefined

  if (id === "invite") {
    const applyUrl = resolveButtonHref(id, options)!
    afterButtonHtml = `
    <p style="${emailTextStyle(theme, "muted")}">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${applyUrl}" style="${emailTextStyle(theme, "link")}">${applyUrl}</a>
    </p>
  `
  }

  const body = buildResendBody(prepared, theme, {
    buttonHref: resolveButtonHref(id, options),
    note: id === "application-denied" ? options.note : undefined,
    afterButtonHtml,
  })

  return emailLayout({
    preview: prepared.preview,
    body,
    theme,
  })
}

export function renderTemplateSupabaseHtml(
  id: EmailTemplateId,
  content: EmailTemplateContent,
): string {
  const meta = TEMPLATE_META[id]
  if (meta.source !== "supabase") {
    throw new Error(`Template ${id} is not a Supabase template.`)
  }

  const theme: EmailTheme = "dark"
  const footerNote = meta.footerNote?.(theme)

  return renderSupabaseTemplate({
    preview: content.preview,
    heading: content.heading,
    paragraphs: content.paragraphs,
    buttonLabel: content.buttonLabel,
    buttonHref: "{{ .ConfirmationURL }}",
    footerNote,
    theme,
  })
}

export function cloneTemplateContent(
  content: EmailTemplateContent,
): EmailTemplateContent {
  return {
    ...content,
    paragraphs: [...content.paragraphs],
  }
}

export function templateContentEquals(
  a: EmailTemplateContent,
  b: EmailTemplateContent,
): boolean {
  if (a.subject !== b.subject) return false
  if (a.preview !== b.preview) return false
  if (a.heading !== b.heading) return false
  if (a.buttonLabel !== b.buttonLabel) return false
  if (a.paragraphs.length !== b.paragraphs.length) return false
  return a.paragraphs.every((p, i) => p === b.paragraphs[i])
}
