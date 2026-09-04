import type { ComponentType } from "react"

import {
  SOCIAL_FIELD_ICONS,
  type SocialBrandIcon,
} from "@/components/icons/social-brand-icons"
import type { Person } from "@/lib/people-data"

export const SOCIAL_FIELD_IDS = [
  "website",
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "youtube",
] as const

export type SocialFieldId = (typeof SOCIAL_FIELD_IDS)[number]

export const MIN_SOCIAL_LINKS = 2

export interface SocialLinkDisplay {
  id: SocialFieldId
  label: string
  display: string
  href: string
  icon: SocialBrandIcon
}

const SOCIAL_CONFIG: Record<
  SocialFieldId,
  {
    label: string
    icon: ComponentType<{ className?: string }>
    displayPrefix?: string
    hrefPrefix: string
  }
> = {
  website: {
    label: "Website",
    icon: SOCIAL_FIELD_ICONS.website,
    hrefPrefix: "https://",
  },
  instagram: {
    label: "Instagram",
    icon: SOCIAL_FIELD_ICONS.instagram,
    displayPrefix: "instagram.com/",
    hrefPrefix: "https://instagram.com/",
  },
  facebook: {
    label: "Facebook",
    icon: SOCIAL_FIELD_ICONS.facebook,
    displayPrefix: "facebook.com/",
    hrefPrefix: "https://facebook.com/",
  },
  twitter: {
    label: "X / Twitter",
    icon: SOCIAL_FIELD_ICONS.twitter,
    displayPrefix: "x.com/",
    hrefPrefix: "https://x.com/",
  },
  linkedin: {
    label: "LinkedIn",
    icon: SOCIAL_FIELD_ICONS.linkedin,
    hrefPrefix: "https://",
  },
  youtube: {
    label: "YouTube",
    icon: SOCIAL_FIELD_ICONS.youtube,
    hrefPrefix: "https://",
  },
}

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "")
}

function stripLeadingSlash(value: string): string {
  return value.replace(/^\/+/, "")
}

function normalizeUsername(value: string, prefixes: string[]): string {
  let normalized = stripProtocol(stripLeadingSlash(value.trim()))
  for (const prefix of prefixes) {
    const lower = normalized.toLowerCase()
    if (lower.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length)
      break
    }
  }
  return normalized.replace(/^@+/, "").replace(/\/+$/, "")
}

export function normalizeSocialField(
  id: SocialFieldId,
  raw: string | undefined | null,
): string | null {
  if (!raw?.trim()) return null

  switch (id) {
    case "website":
      return stripProtocol(stripLeadingSlash(raw)).replace(/\/+$/, "") || null
    case "instagram":
      return (
        normalizeUsername(raw, [
          "instagram.com/",
          "instagram.com",
          "instagr.am/",
        ]) || null
      )
    case "facebook":
      return (
        normalizeUsername(raw, [
          "facebook.com/",
          "facebook.com",
          "m.facebook.com/",
          "m.facebook.com",
          "fb.com/",
          "fb.com",
        ]) || null
      )
    case "twitter":
      return (
        normalizeUsername(raw, ["x.com/", "x.com", "twitter.com/", "twitter.com"]) ||
        null
      )
    case "linkedin":
      return stripProtocol(stripLeadingSlash(raw)).replace(/\/+$/, "") || null
    case "youtube":
      return stripProtocol(stripLeadingSlash(raw)).replace(/\/+$/, "") || null
    default:
      return null
  }
}

export function countFilledSocialLinks(
  input: Record<SocialFieldId, string | null | undefined>,
): number {
  let count = 0
  for (const id of SOCIAL_FIELD_IDS) {
    if (normalizeSocialField(id, input[id] ?? null)) count++
  }
  return count
}

export function hasMinimumSocialLinks(
  input: Record<SocialFieldId, string | null | undefined>,
  min = MIN_SOCIAL_LINKS,
): boolean {
  return countFilledSocialLinks(input) >= min
}

export function buildSocialHref(
  id: SocialFieldId,
  stored: string | undefined | null,
): string | null {
  const normalized = normalizeSocialField(id, stored)
  if (!normalized) return null

  const config = SOCIAL_CONFIG[id]
  if (id === "instagram" || id === "facebook" || id === "twitter") {
    return `${config.hrefPrefix}${normalized}`
  }
  return `${config.hrefPrefix}${normalized}`
}

export function buildSocialDisplay(
  id: SocialFieldId,
  stored: string | undefined | null,
): string | null {
  const normalized = normalizeSocialField(id, stored)
  if (!normalized) return null

  const config = SOCIAL_CONFIG[id]
  if (config.displayPrefix) {
    return `${config.displayPrefix}${normalized}`
  }
  return normalized
}

export function getPersonSocialLinks(person: Person): SocialLinkDisplay[] {
  const links: SocialLinkDisplay[] = []

  for (const id of SOCIAL_FIELD_IDS) {
    const stored = person[id]
    const href = buildSocialHref(id, stored)
    const display = buildSocialDisplay(id, stored)
    if (!href || !display) continue

    const config = SOCIAL_CONFIG[id]
    links.push({
      id,
      label: config.label,
      display,
      href,
      icon: config.icon,
    })
  }

  return links
}

export function socialFieldsFromPerson(
  person: Person,
): Record<SocialFieldId, string | null> {
  return {
    website: normalizeSocialField("website", person.website),
    instagram: normalizeSocialField("instagram", person.instagram),
    facebook: normalizeSocialField("facebook", person.facebook),
    twitter: normalizeSocialField("twitter", person.twitter),
    linkedin: normalizeSocialField("linkedin", person.linkedin),
    youtube: normalizeSocialField("youtube", person.youtube),
  }
}
