export type Availability = "Available Now" | "Between Tours" | "On Tour"

export const availabilityStatuses: Availability[] = [
  "Available Now",
  "Between Tours",
  "On Tour",
]

/**
 * Visual config for each availability status. Kept within the app palette:
 * "Available Now" uses the teal success tone (with a live ping, mirroring the
 * sidebar availability card); the others step down to muted neutrals.
 */
export const availabilityConfig: Record<
  Availability,
  { dot: string; ping: boolean; label: string }
> = {
  "Available Now": { dot: "bg-success", ping: true, label: "Available Now" },
  "Between Tours": {
    dot: "bg-foreground/50",
    ping: false,
    label: "Between Tours",
  },
  "On Tour": { dot: "bg-foreground/40", ping: false, label: "On Tour" },
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
  banner?: string
  bannerPositionY?: number
  followed: boolean
  verified?: boolean
  founding?: boolean
  company?: string
  bio?: string
  memberSince?: string
  website?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
}

export interface TourCredit {
  /** DB id — present when loaded from the server; absent in preview/mock data. */
  id?: string
  title: string
  venueTier: VenueTier
  role: string
  years: string
  engagementType?: string
  startedAt?: string
  endedAt?: string
  isCurrent?: boolean
  /** Total vouch count for this credit. */
  vouchCount?: number
  /** Whether the currently signed-in user has already vouched for this credit. */
  hasVouched?: boolean
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

/**
 * Builds a fully-populated profile for the profile drawer. Explicit fields on
 * the Person win; tour credits come from the database when provided.
 */
export function getPersonProfile(
  person: Person,
  tourCredits: TourCredit[] = [],
): PersonProfile {
  const firstName = person.name.split(" ")[0]
  const skillsText =
    person.skills.length > 0 ? person.skills.join(", ") : "live production"
  const venueText =
    person.venueTiers.length > 0
      ? person.venueTiers.join(" and ").toLowerCase()
      : "arena and festival"

  const bio =
    person.bio ??
    `${person.name} is a ${person.role || "touring professional"} based in ${person.homeBase || "the road"} with ${person.yearsExperience}+ years across touring and live events. Known for ${skillsText}, ${firstName} works ${venueText}-scale productions and is currently ${person.availability.toLowerCase()}.`

  return {
    verified: person.verified ?? false,
    founding: person.founding ?? false,
    company: person.company,
    bio,
    memberSince: person.memberSince ?? "",
    website: person.website ?? "",
    tourCredits,
  }
}
