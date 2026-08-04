import type {
  Availability,
  Person,
  VenueTier,
  WorkAuth,
} from "@/lib/people-data"

export type DbMemberAvailability =
  | "available_now"
  | "between_tours"
  | "on_tour"

export type DbVenueTier =
  | "stadium"
  | "arena"
  | "festival"
  | "theater"
  | "club"

export type DbWorkAuth =
  | "passport"
  | "usa"
  | "canada"
  | "uk"
  | "eu"
  | "australia"
  | "worldwide"

export interface MemberProfileRow {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  title: string | null
  company: string | null
  home_base: string | null
  city: string | null
  bio: string | null
  years_experience: number | null
  availability: DbMemberAvailability | null
  available_from: string | null
  available_to: string | null
  venue_tiers: DbVenueTier[] | null
  work_auth: DbWorkAuth[] | null
  skills: string[] | null
  banner_url: string | null
  banner_position_y: number | null
  is_verified: boolean | null
  is_founding_member: boolean | null
  created_at: string
}

export interface MemberProfileUpdate {
  full_name?: string
  title?: string
  company?: string | null
  home_base?: string
  city?: string
  bio?: string | null
  years_experience?: number
  availability?: DbMemberAvailability
  available_from?: string | null
  available_to?: string | null
  venue_tiers?: DbVenueTier[]
  work_auth?: DbWorkAuth[]
  skills?: string[]
  banner_position_y?: number
}

const availabilityToUi: Record<DbMemberAvailability, Availability> = {
  available_now: "Available Now",
  between_tours: "Between Tours",
  on_tour: "On Tour",
}

const availabilityToDb: Record<Availability, DbMemberAvailability> = {
  "Available Now": "available_now",
  "Between Tours": "between_tours",
  "On Tour": "on_tour",
}

const venueTierToUi: Record<DbVenueTier, VenueTier> = {
  stadium: "Stadium",
  arena: "Arena",
  festival: "Festival",
  theater: "Theater",
  club: "Club",
}

const venueTierToDb: Record<VenueTier, DbVenueTier> = {
  Stadium: "stadium",
  Arena: "arena",
  Festival: "festival",
  Theater: "theater",
  Club: "club",
}

const workAuthToUi: Record<DbWorkAuth, WorkAuth> = {
  passport: "Passport",
  usa: "USA",
  canada: "Canada",
  uk: "UK",
  eu: "EU",
  australia: "Australia",
  worldwide: "Worldwide",
}

const workAuthToDb: Record<WorkAuth, DbWorkAuth> = {
  Passport: "passport",
  USA: "usa",
  Canada: "canada",
  UK: "uk",
  EU: "eu",
  Australia: "australia",
  Worldwide: "worldwide",
}

function formatMemberSince(createdAt: string): string {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function toIsoDate(value: string | null | undefined): string {
  if (!value) return ""
  return value.slice(0, 10)
}

/** Clamp banner vertical position to an integer 0–100 for DB smallint column. */
export function clampBannerPositionY(value: number | undefined): number {
  return Math.round(Math.max(0, Math.min(100, value ?? 50)))
}

export function toPersonFromProfile(row: MemberProfileRow): Person {
  const name =
    row.full_name?.trim() ||
    row.email.split("@")[0] ||
    "Member"

  return {
    id: row.id,
    name,
    role: row.title?.trim() || "",
    department: "",
    homeBase: row.home_base?.trim() || "",
    city: row.city?.trim() || row.home_base?.split(",")[0]?.trim() || "",
    availability:
      availabilityToUi[row.availability ?? "between_tours"] ?? "Between Tours",
    availableFrom: toIsoDate(row.available_from),
    availableTo: toIsoDate(row.available_to),
    venueTiers: (row.venue_tiers ?? []).map((tier) => venueTierToUi[tier]),
    workAuth: (row.work_auth ?? []).map((auth) => workAuthToUi[auth]),
    yearsExperience: row.years_experience ?? 0,
    credits: 0,
    vouches: 0,
    topTours: [],
    skills: row.skills ?? [],
    avatar: row.avatar_url ?? undefined,
    banner: row.banner_url ?? undefined,
    bannerPositionY: clampBannerPositionY(row.banner_position_y ?? undefined),
    followed: false,
    verified: row.is_verified ?? false,
    founding: row.is_founding_member ?? false,
    company: row.company?.trim() || undefined,
    bio: row.bio?.trim() || undefined,
    memberSince: formatMemberSince(row.created_at),
  }
}

export function toProfileUpdateFromPerson(person: Person): MemberProfileUpdate {
  return {
    full_name: person.name.trim(),
    title: person.role.trim(),
    company: person.company?.trim() || null,
    home_base: person.homeBase.trim(),
    city: person.city.trim(),
    bio: person.bio?.trim() || null,
    years_experience: Math.max(0, person.yearsExperience),
    availability: availabilityToDb[person.availability],
    available_from: person.availableFrom || null,
    available_to: person.availableTo || null,
    venue_tiers: person.venueTiers.map((tier) => venueTierToDb[tier]),
    work_auth: person.workAuth.map((auth) => workAuthToDb[auth]),
    skills: person.skills,
    banner_position_y: clampBannerPositionY(person.bannerPositionY),
  }
}

export const MEMBER_PROFILE_SELECT = [
  "id",
  "full_name",
  "email",
  "avatar_url",
  "title",
  "company",
  "home_base",
  "city",
  "bio",
  "years_experience",
  "availability",
  "available_from",
  "available_to",
  "venue_tiers",
  "work_auth",
  "skills",
  "banner_url",
  "banner_position_y",
  "is_verified",
  "is_founding_member",
  "created_at",
].join(", ")
