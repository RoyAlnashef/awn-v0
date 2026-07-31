import { people, type Person, type TourCredit, type VenueTier } from "@/lib/people-data"

export interface AccountTourCredit {
  id: string
  title: string
  artist: string
  role: string
  venueTier: VenueTier | string
  years: string
  vouches: number
}

export function createInitialAccountDraft(): Person {
  return { ...people[0] }
}

export function createInitialTourCredits(): AccountTourCredit[] {
  return [
    {
      id: "1",
      title: "Midnight Echo — Arena Run",
      artist: "Midnight Echo",
      role: "Tour Manager",
      venueTier: "Arena",
      years: "2024–26",
      vouches: 11,
    },
    {
      id: "2",
      title: "Cassette Kids — World Tour",
      artist: "Cassette Kids",
      role: "Tour Manager",
      venueTier: "Stadium",
      years: "2022–24",
      vouches: 8,
    },
    {
      id: "3",
      title: "Riverbend — Amphitheater Run",
      artist: "Riverbend",
      role: "Tour Manager",
      venueTier: "Arena",
      years: "2020–22",
      vouches: 6,
    },
    {
      id: "4",
      title: "Solar Drift — Festival Circuit",
      artist: "Solar Drift",
      role: "Production Coordinator",
      venueTier: "Festival",
      years: "2018–20",
      vouches: 3,
    },
  ]
}

export function toProfileTourCredits(credits: AccountTourCredit[]): TourCredit[] {
  return credits.map(({ title, venueTier, role, years }) => ({
    title,
    venueTier: venueTier as VenueTier,
    role,
    years,
  }))
}
