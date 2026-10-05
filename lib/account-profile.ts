import type { Person, TourCredit, VenueTier } from "@/lib/people-data"

export const ENGAGEMENT_TYPES = [
  "Touring",
  "Run of Shows",
  "Festival",
  "One-Off",
  "Local / Day-Of",
] as const

export type EngagementType = (typeof ENGAGEMENT_TYPES)[number]

export const engagementTypeDescriptions: Record<EngagementType, string> = {
  "Touring": "Multiple markets · extended run",
  "Run of Shows": "Multi-night run · single city",
  "Festival": "Festival dates",
  "One-Off": "Single show",
  "Local / Day-Of": "Local / regional dates",
}

export interface AccountTourCredit {
  id: string
  /** Main title: artist, act, tour name, or show name. */
  title: string
  artist: string
  role: string
  venueTier: VenueTier | string
  years: string
  /** New Work History fields */
  engagementType: EngagementType | null
  startedAt: string | null
  endedAt: string | null
  isCurrent: boolean
  notes: string
  vouches: number
}

export function toProfileTourCredits(credits: AccountTourCredit[]): TourCredit[] {
  return credits.map(({ title, venueTier, role, years, engagementType, startedAt, endedAt, isCurrent, vouches }) => ({
    title,
    venueTier: venueTier ? (venueTier as VenueTier) : undefined,
    role,
    years: years.trim() || undefined,
    engagementType: engagementType ?? undefined,
    startedAt: startedAt ?? undefined,
    endedAt: endedAt ?? undefined,
    isCurrent,
    vouchCount: vouches,
  }))
}
