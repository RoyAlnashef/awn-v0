import { departmentByRole } from "@/lib/jobs-data"
import type {
  Availability,
  Person,
  TourCredit,
  VenueTier,
  WorkAuth,
} from "@/lib/people-data"
import { socialFieldsFromPerson } from "@/lib/social-links"

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

export type ConnectionStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected"

export interface MemberProfileRow {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  title: string | null
  department: string | null
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
  website: string | null
  instagram: string | null
  facebook: string | null
  twitter: string | null
  linkedin: string | null
  youtube: string | null
  resume_url: string | null
  handle: string | null
  created_at: string
  updated_at: string
}

export interface TourCreditRow {
  id: string
  profile_id: string
  title: string
  artist: string | null
  role: string
  venue_tier: DbVenueTier | null
  years: string | null
  sort_order: number
  created_at: string
  // Work History fields (added in tour_credits_v2 migration)
  engagement_type: string | null
  started_at: string | null
  ended_at: string | null
  is_current: boolean
  notes: string | null
  // Vouch count aggregated via join
  credit_vouches?: { count: number }[] | null
}

export interface MemberProfileUpdate {
  full_name?: string
  title?: string
  department?: string | null
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
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
  linkedin?: string | null
  youtube?: string | null
}

export interface PersonDirectoryExtras {
  tourCreditCount?: number
  vouchCount?: number
  connectionStatus?: ConnectionStatus
}

const availabilityToUi: Record<DbMemberAvailability, Availability> = {
  available_now: "Available Now",
  between_tours: "Between gigs",
  on_tour: "On assignment",
}

const availabilityToDb: Record<Availability, DbMemberAvailability> = {
  "Available Now": "available_now",
  "Between gigs": "between_tours",
  "On assignment": "on_tour",
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

export function departmentFromTitle(title: string | null | undefined): string {
  const trimmed = title?.trim()
  if (!trimmed) return "Production"
  return departmentByRole[trimmed] ?? "Production"
}

export function resolveDepartment(
  department: string | null | undefined,
  title: string | null | undefined,
): string {
  const trimmed = department?.trim()
  if (trimmed) return trimmed
  return departmentFromTitle(title)
}

export function connectionStatusToFollowed(
  status: ConnectionStatus | undefined,
): boolean {
  return status === "connected"
}

export function toTourCreditsFromRows(
  rows: TourCreditRow[],
  vouchedCreditIds?: Set<string>,
): TourCredit[] {
  return rows.map((row) => {
    const vouchCount = row.credit_vouches?.[0]?.count ?? 0
    return {
      id: row.id,
      title: row.title,
      artist: row.artist?.trim() || undefined,
      venueTier: row.venue_tier ? venueTierToUi[row.venue_tier] : "Arena",
      role: row.role,
      years: row.years?.trim() || "—",
      engagementType: (row.engagement_type as import("@/lib/account-profile").EngagementType | undefined) ?? undefined,
      startedAt: row.started_at ?? undefined,
      endedAt: row.ended_at ?? undefined,
      isCurrent: row.is_current ?? false,
      vouchCount,
      hasVouched: vouchedCreditIds ? vouchedCreditIds.has(row.id) : undefined,
    }
  })
}

export function toPersonFromProfile(
  row: MemberProfileRow,
  extras: PersonDirectoryExtras = {},
): Person {
  const name =
    row.full_name?.trim() ||
    row.email.split("@")[0] ||
    "Member"

  const department = resolveDepartment(row.department, row.title)

  return {
    id: row.id,
    name,
    role: row.title?.trim() || "",
    department,
    homeBase: row.home_base?.trim() || "",
    city: row.city?.trim() || row.home_base?.split(",")[0]?.trim() || "",
    availability:
      availabilityToUi[row.availability ?? "between_tours"] ?? "Between gigs",
    availableFrom: toIsoDate(row.available_from),
    availableTo: toIsoDate(row.available_to),
    venueTiers: (row.venue_tiers ?? []).map((tier) => venueTierToUi[tier]),
    workAuth: (row.work_auth ?? []).map((auth) => workAuthToUi[auth]),
    yearsExperience: row.years_experience ?? 0,
    credits: extras.tourCreditCount ?? 0,
    vouches: extras.vouchCount ?? 0,
    topTours: [],
    skills: row.skills ?? [],
    avatar: row.avatar_url ?? undefined,
    banner: row.banner_url ?? undefined,
    bannerPositionY: clampBannerPositionY(row.banner_position_y ?? undefined),
    followed: connectionStatusToFollowed(extras.connectionStatus),
    verified: row.is_verified ?? false,
    founding: row.is_founding_member ?? false,
    company: row.company?.trim() || undefined,
    bio: row.bio?.trim() || undefined,
    memberSince: formatMemberSince(row.created_at),
    website: row.website?.trim() || undefined,
    instagram: row.instagram?.trim() || undefined,
    facebook: row.facebook?.trim() || undefined,
    twitter: row.twitter?.trim() || undefined,
    linkedin: row.linkedin?.trim() || undefined,
    youtube: row.youtube?.trim() || undefined,
    handle: row.handle?.trim() || undefined,
  }
}

export function toProfileUpdateFromPerson(person: Person): MemberProfileUpdate {
  const social = socialFieldsFromPerson(person)

  return {
    full_name: person.name.trim(),
    title: person.role.trim(),
    department: person.department.trim() || null,
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
    website: social.website,
    instagram: social.instagram,
    facebook: social.facebook,
    twitter: social.twitter,
    linkedin: social.linkedin,
    youtube: social.youtube,
  }
}

export const MEMBER_PROFILE_SELECT = [
  "id",
  "full_name",
  "email",
  "avatar_url",
  "title",
  "department",
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
  "website",
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "youtube",
  "handle",
  "created_at",
  "updated_at",
].join(", ")

export const TOUR_CREDIT_SELECT =
  "id, profile_id, title, artist, role, venue_tier, years, sort_order, created_at, engagement_type, started_at, ended_at, is_current, notes, credit_vouches(count)"

function tourCreditStartTimestamp(row: TourCreditRow): number | null {
  if (row.started_at) {
    const timestamp = new Date(row.started_at).getTime()
    if (!Number.isNaN(timestamp)) return timestamp
  }

  const yearMatch = row.years?.trim().match(/^(\d{4})/)
  if (yearMatch) {
    return new Date(`${yearMatch[1]}-01-01`).getTime()
  }

  return null
}

export function sortTourCreditRowsByStartDateDesc(
  rows: TourCreditRow[],
): TourCreditRow[] {
  return rows.toSorted((a, b) => {
    const aStart = tourCreditStartTimestamp(a)
    const bStart = tourCreditStartTimestamp(b)

    if (aStart !== null && bStart !== null && bStart !== aStart) {
      return bStart - aStart
    }
    if (aStart !== null && bStart === null) return -1
    if (aStart === null && bStart !== null) return 1

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function tourCreditRowToAccountCredit(row: TourCreditRow) {
  const vouchCount = row.credit_vouches?.[0]?.count ?? 0
  return {
    id: row.id,
    title: row.title,
    artist: row.artist?.trim() || "",
    role: row.role,
    venueTier: row.venue_tier ? venueTierToUi[row.venue_tier] : "Arena",
    years: row.years?.trim() || "—",
    engagementType: (row.engagement_type as import("@/lib/account-profile").EngagementType | null) ?? null,
    startedAt: row.started_at ?? null,
    endedAt: row.ended_at ?? null,
    isCurrent: row.is_current ?? false,
    notes: row.notes?.trim() || "",
    vouches: vouchCount,
  }
}

export function venueTierToDbValue(tier: string): DbVenueTier {
  return venueTierToDb[tier as VenueTier] ?? "arena"
}
