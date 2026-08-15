import type { Person, TourCredit, VenueTier } from "@/lib/people-data"

export interface AccountTourCredit {
  id: string
  title: string
  artist: string
  role: string
  venueTier: VenueTier | string
  years: string
  vouches: number
}

export function toProfileTourCredits(credits: AccountTourCredit[]): TourCredit[] {
  return credits.map(({ title, venueTier, role, years }) => ({
    title,
    venueTier: venueTier as VenueTier,
    role,
    years,
  }))
}
