export type Availability = "Available Now" | "Between Tours" | "On Tour"

export const availabilityStatuses: Availability[] = [
  "Available Now",
  "Between Tours",
  "On Tour",
]

/**
 * Visual config for each availability status. Kept within the app palette:
 * "Available Now" uses the ember primary (with a live ping, mirroring the
 * sidebar availability card); the others step down to muted neutrals.
 */
export const availabilityConfig: Record<
  Availability,
  { dot: string; ping: boolean; label: string }
> = {
  "Available Now": { dot: "bg-primary", ping: true, label: "Available Now" },
  "Between Tours": {
    dot: "bg-foreground/50",
    ping: false,
    label: "Between Tours",
  },
  "On Tour": { dot: "bg-primary/60", ping: false, label: "On Tour" },
}

/** Home-base cities offered as quick chips. Anything else falls under "Other". */
export const cityOptions = [
  "Nashville",
  "Los Angeles",
  "New York",
  "London",
  "Atlanta",
  "Chicago",
  "Las Vegas",
  "Toronto",
]

/** Sentinel value for the "Other…" city chip (cities not in cityOptions). */
export const OTHER_CITY = "__other__"

export type VenueTier = "Stadium" | "Arena" | "Festival" | "Theater" | "Club"
export const venueTiers: VenueTier[] = [
  "Stadium",
  "Arena",
  "Festival",
  "Theater",
  "Club",
]

export type WorkAuth =
  | "Passport"
  | "USA"
  | "Canada"
  | "UK"
  | "EU"
  | "Australia"
  | "Worldwide"
export const workAuthOptions: WorkAuth[] = [
  "Passport",
  "USA",
  "Canada",
  "UK",
  "EU",
  "Australia",
  "Worldwide",
]

export interface Person {
  id: string
  name: string
  role: string
  department: string
  homeBase: string
  /** Normalized city used for the City chips; may be outside cityOptions. */
  city: string
  availability: Availability
  /** Availability window (date-only ISO strings) used by the Available Window filter. */
  availableFrom: string
  availableTo: string
  venueTiers: VenueTier[]
  workAuth: WorkAuth[]
  yearsExperience: number
  credits: number
  vouches: number
  topTours: string[]
  skills: string[]
  avatar?: string
  connected: boolean
  /**
   * Optional extended-profile fields. When omitted, getPersonProfile() derives
   * sensible placeholder values so the profile drawer is always fully populated.
   */
  verified?: boolean
  founding?: boolean
  company?: string
  bio?: string
  memberSince?: string
  website?: string
}

export interface TourCredit {
  title: string
  venueTier: VenueTier
  role: string
  years: string
}

export interface PersonProfile {
  verified: boolean
  founding: boolean
  company?: string
  bio: string
  memberSince: string
  website: string
  tourCredits: TourCredit[]
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export const people: Person[] = [
  {
    id: "1",
    name: "Jordan Reyes",
    role: "Tour Manager",
    department: "Production",
    homeBase: "Nashville, TN",
    city: "Nashville",
    availability: "Available Now",
    availableFrom: "2026-08-01",
    availableTo: "2026-12-20",
    venueTiers: ["Stadium", "Arena"],
    workAuth: ["USA", "Passport"],
    yearsExperience: 14,
    credits: 38,
    vouches: 27,
    topTours: ["Midnight Echo — Arena Run", "Cassette Kids — World Tour"],
    skills: ["Advancing", "Settlement", "Visa Logistics"],
    avatar: "/images/avatar-jordan.png",
    connected: true,
    verified: true,
    founding: true,
    company: "Reyes Touring Co.",
    memberSince: "Jan 2021",
    website: "reyestouring.com",
    bio: "Seasoned Tour Manager with 14+ years advancing global arena and stadium runs. Founder of Reyes Touring Co., handling routing, settlements, and visa logistics for touring artists and their crews. Known for calm, detail-obsessed leadership on the road and building repeat-booking relationships with promoters worldwide.",
  },
  {
    id: "2",
    name: "Priya Anand",
    role: "Front of House Engineer",
    department: "Audio",
    homeBase: "London, UK",
    city: "London",
    availability: "On Tour",
    availableFrom: "2026-11-15",
    availableTo: "2027-02-28",
    venueTiers: ["Arena", "Festival"],
    workAuth: ["UK", "EU", "Passport"],
    yearsExperience: 11,
    credits: 42,
    vouches: 33,
    topTours: ["Neon Tide — European Leg", "The Lofts — Festival Circuit"],
    skills: ["DiGiCo", "Waves", "System Tuning"],
    connected: true,
  },
  {
    id: "3",
    name: "Marcus Bell",
    role: "Lighting Director (LD)",
    department: "Lighting",
    homeBase: "Los Angeles, CA",
    city: "Los Angeles",
    availability: "Between Tours",
    availableFrom: "2026-07-15",
    availableTo: "2026-10-30",
    venueTiers: ["Stadium", "Arena"],
    workAuth: ["USA", "Passport"],
    yearsExperience: 16,
    credits: 51,
    vouches: 40,
    topTours: ["Ultraviolet — Stadium Tour", "Sable — Residency"],
    skills: ["grandMA3", "Previs", "Timecode"],
    connected: false,
  },
  {
    id: "4",
    name: "Dana Whitfield",
    role: "Video Director",
    department: "Video",
    homeBase: "Atlanta, GA",
    city: "Atlanta",
    availability: "Available Now",
    availableFrom: "2026-07-10",
    availableTo: "2026-11-30",
    venueTiers: ["Arena", "Theater"],
    workAuth: ["USA"],
    yearsExperience: 9,
    credits: 24,
    vouches: 19,
    topTours: ["Cassette Kids — World Tour", "Half Light — Amphitheater Run"],
    skills: ["disguise", "PPU", "Camera Cutting"],
    connected: false,
  },
  {
    id: "5",
    name: "Theo Nakamura",
    role: "Monitor Engineer",
    department: "Audio",
    homeBase: "Toronto, ON",
    city: "Toronto",
    availability: "On Tour",
    availableFrom: "2026-10-01",
    availableTo: "2027-01-15",
    venueTiers: ["Arena", "Theater"],
    workAuth: ["Canada", "Passport"],
    yearsExperience: 13,
    credits: 36,
    vouches: 28,
    topTours: ["Neon Tide — European Leg", "Riverbend — Arena Run"],
    skills: ["IEM Wrangling", "Avid", "RF Coordination"],
    connected: true,
  },
  {
    id: "6",
    name: "Sofia Marín",
    role: "Production Manager",
    department: "Production",
    homeBase: "Austin, TX",
    city: "Austin",
    availability: "Available Now",
    availableFrom: "2026-08-15",
    availableTo: "2027-03-01",
    venueTiers: ["Stadium", "Festival"],
    workAuth: ["USA", "Worldwide", "Passport"],
    yearsExperience: 18,
    credits: 61,
    vouches: 47,
    topTours: ["Ultraviolet — Stadium Tour", "Golden Hour — Festival Circuit"],
    skills: ["Budgeting", "Trucking", "Crew Hiring"],
    connected: false,
    verified: true,
    founding: true,
    company: "Marín Live",
    memberSince: "Mar 2020",
  },
  {
    id: "7",
    name: "Elliot Shaw",
    role: "Guitar Tech",
    department: "Backline",
    homeBase: "Manchester, UK",
    city: "Manchester",
    availability: "Between Tours",
    availableFrom: "2026-09-01",
    availableTo: "2026-12-15",
    venueTiers: ["Festival", "Club"],
    workAuth: ["UK", "EU"],
    yearsExperience: 8,
    credits: 22,
    vouches: 15,
    topTours: ["The Lofts — Festival Circuit", "Sable — Club Tour"],
    skills: ["Guitar Setup", "Pedalboards", "Amp Repair"],
    connected: false,
  },
  {
    id: "8",
    name: "Naomi Foster",
    role: "Lighting Programmer",
    department: "Lighting",
    homeBase: "Berlin, DE",
    city: "Berlin",
    availability: "Between Tours",
    availableFrom: "2027-01-10",
    availableTo: "2027-04-30",
    venueTiers: ["Stadium", "Arena"],
    workAuth: ["EU", "Passport"],
    yearsExperience: 12,
    credits: 34,
    vouches: 25,
    topTours: ["Neon Tide — European Leg", "Ultraviolet — Stadium Tour"],
    skills: ["grandMA3", "Pixel Mapping", "Busking"],
    connected: true,
  },
  {
    id: "9",
    name: "Carlos Rivera",
    role: "Video Engineer / EIC",
    department: "Video",
    homeBase: "Mexico City, MX",
    city: "Mexico City",
    availability: "Available Now",
    availableFrom: "2026-07-05",
    availableTo: "2026-11-10",
    venueTiers: ["Festival", "Arena"],
    workAuth: ["Worldwide", "Passport"],
    yearsExperience: 15,
    credits: 45,
    vouches: 31,
    topTours: ["Golden Hour — Festival Circuit", "Half Light — Amphitheater Run"],
    skills: ["Signal Flow", "LED Processing", "Fiber"],
    connected: false,
  },
  {
    id: "10",
    name: "Aisha Khan",
    role: "Stage Manager",
    department: "Production",
    homeBase: "New York, NY",
    city: "New York",
    availability: "On Tour",
    availableFrom: "2026-09-20",
    availableTo: "2026-12-31",
    venueTiers: ["Theater", "Arena"],
    workAuth: ["USA", "Passport"],
    yearsExperience: 10,
    credits: 29,
    vouches: 22,
    topTours: ["Sable — Residency", "Cassette Kids — World Tour"],
    skills: ["Show Calling", "Changeovers", "Union Relations"],
    connected: true,
  },
  {
    id: "11",
    name: "Liam O'Connor",
    role: "Systems Engineer",
    department: "Audio",
    homeBase: "Dublin, IE",
    city: "Dublin",
    availability: "Between Tours",
    availableFrom: "2026-08-10",
    availableTo: "2026-12-05",
    venueTiers: ["Stadium", "Arena"],
    workAuth: ["EU", "UK", "Passport"],
    yearsExperience: 17,
    credits: 48,
    vouches: 36,
    topTours: ["Riverbend — Arena Run", "Neon Tide — European Leg"],
    skills: ["L-Acoustics", "Smaart", "Line Array Design"],
    connected: false,
  },
  {
    id: "12",
    name: "Grace Kim",
    role: "Camera Operator",
    department: "Video",
    homeBase: "Seattle, WA",
    city: "Seattle",
    availability: "Available Now",
    availableFrom: "2026-07-01",
    availableTo: "2026-10-15",
    venueTiers: ["Festival", "Theater"],
    workAuth: ["USA"],
    yearsExperience: 7,
    credits: 18,
    vouches: 12,
    topTours: ["Half Light — Amphitheater Run", "Golden Hour — Festival Circuit"],
    skills: ["Handheld", "Long Lens", "Jib"],
    connected: false,
  },
]

/**
 * Builds a fully-populated profile for the profile drawer. Explicit fields on
 * the Person win; anything missing is derived from existing data so every
 * member renders a complete, believable profile.
 */
export function getPersonProfile(person: Person): PersonProfile {
  const firstName = person.name.split(" ")[0]

  const bio =
    person.bio ??
    `${person.name} is a ${person.role} based in ${person.homeBase} with ${person.yearsExperience}+ years across touring and live events. Recent credits include ${person.topTours.join(" and ")}. Known for ${person.skills.join(", ")}, ${firstName} works ${person.venueTiers.join(" and ").toLowerCase()}-scale productions and is currently ${person.availability.toLowerCase()}.`

  // Turn top tours into dated credits, most recent first.
  const tourCredits: TourCredit[] = person.topTours.map((title, i) => {
    const end = 26 - i * 2
    const start = end - 2
    return {
      title,
      venueTier: person.venueTiers[i % person.venueTiers.length] ?? "Arena",
      role: person.role,
      years: `20${start}–${end}`,
    }
  })

  return {
    verified: person.verified ?? person.credits >= 40,
    founding: person.founding ?? false,
    company: person.company,
    bio,
    memberSince: person.memberSince ?? "Apr 2026",
    website: person.website ?? `${firstName.toLowerCase()}.live`,
    tourCredits,
  }
}
