import { cache } from "react"

import {
  MEMBER_PROFILE_SELECT,
  type MemberProfileRow,
  toPersonFromProfile,
} from "@/lib/account/profile-data"
import { getSessionUser } from "@/lib/auth/get-session-user"
import type { Person } from "@/lib/people-data"
import { fetchBlockedProfileIdsForUser } from "@/lib/moderation/blocks"
import { createClient } from "@/lib/supabase/server"

import {
  boundingBox,
  FALLBACK_MAP_CENTER,
  freshCheckInCutoffIso,
  geocodePlace,
  milesBetween,
  NEARBY_RADIUS_MILES,
  reverseGeocodeCity,
  type Coordinates,
  type MapOrigin,
} from "@/lib/now/geo"

export type CheckInRow = {
  profile_id: string
  latitude: number
  longitude: number
  city: string | null
  checked_in_at: string
  note: string | null
}

export type OwnCheckIn = {
  latitude: number
  longitude: number
  city: string | null
  checkedInAt: string
  note: string | null
}

export type CheckedInMember = {
  person: Person
  latitude: number
  longitude: number
  city: string | null
  checkedInAt: string
  note: string | null
  isSelf: boolean
}

export type CheckInMapData = {
  origin: MapOrigin
  members: CheckedInMember[]
  cityLabel: string
  checkedInCount: number
  ownCheckIn: OwnCheckIn | null
}

type CheckInWithProfile = CheckInRow & {
  profiles: MemberProfileRow
}

async function fetchDirectoryExtrasForProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profileIds: string[],
) {
  const extras = new Map<
    string,
    { tourCreditCount?: number; vouchCount?: number; connectionStatus?: import("@/lib/account/profile-data").ConnectionStatus }
  >()

  if (profileIds.length === 0) return extras

  const [creditCountsResult, vouchCountsResult, connectionsResult] =
    await Promise.all([
      supabase.from("tour_credits").select("profile_id").in("profile_id", profileIds),
      supabase.from("profile_vouches").select("vouchee_id").in("vouchee_id", profileIds),
      supabase
        .from("member_connections")
        .select("requester_id, recipient_id, status")
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`),
    ])

  const creditCountMap = new Map<string, number>()
  for (const row of creditCountsResult.data ?? []) {
    const id = row.profile_id as string
    creditCountMap.set(id, (creditCountMap.get(id) ?? 0) + 1)
  }

  const vouchCountMap = new Map<string, number>()
  for (const row of vouchCountsResult.data ?? []) {
    const id = row.vouchee_id as string
    vouchCountMap.set(id, (vouchCountMap.get(id) ?? 0) + 1)
  }

  const connections = (connectionsResult.data ?? []) as {
    requester_id: string
    recipient_id: string
    status: "pending" | "accepted" | "ignored"
  }[]

  for (const profileId of profileIds) {
    let connectionStatus: import("@/lib/account/profile-data").ConnectionStatus = "none"
    for (const connection of connections) {
      const matches =
        (connection.requester_id === userId &&
          connection.recipient_id === profileId) ||
        (connection.requester_id === profileId &&
          connection.recipient_id === userId)

      if (!matches) continue

      if (connection.status === "accepted") {
        connectionStatus = "connected"
        break
      }
      if (connection.status === "pending") {
        connectionStatus =
          connection.requester_id === userId ? "pending_sent" : "pending_received"
      }
    }

    extras.set(profileId, {
      tourCreditCount: creditCountMap.get(profileId) ?? 0,
      vouchCount: vouchCountMap.get(profileId) ?? 0,
      connectionStatus,
    })
  }

  return extras
}

async function fetchFreshCheckInsInBox(
  supabase: Awaited<ReturnType<typeof createClient>>,
  box: ReturnType<typeof boundingBox>,
): Promise<CheckInWithProfile[]> {
  const cutoff = freshCheckInCutoffIso()

  const { data, error } = await supabase
    .from("check_ins")
    .select(
      `profile_id, latitude, longitude, city, checked_in_at, note, profiles!inner (${MEMBER_PROFILE_SELECT})`,
    )
    .gt("checked_in_at", cutoff)
    .gte("latitude", box.minLat)
    .lte("latitude", box.maxLat)
    .gte("longitude", box.minLng)
    .lte("longitude", box.maxLng)
    .eq("profiles.status", "active")

  if (error || !data) return []

  return data as unknown as CheckInWithProfile[]
}

function toCheckedInMembers(
  rows: CheckInWithProfile[],
  origin: Coordinates,
  userId: string,
  extrasMap: Awaited<ReturnType<typeof fetchDirectoryExtrasForProfiles>>,
): CheckedInMember[] {
  const members: CheckedInMember[] = []

  for (const row of rows) {
    const coords = { latitude: row.latitude, longitude: row.longitude }
    if (milesBetween(origin, coords) > NEARBY_RADIUS_MILES) continue

    const profile = row.profiles
    if (profile.incognito && row.profile_id !== userId) continue
    const person = toPersonFromProfile(profile, extrasMap.get(row.profile_id))

    members.push({
      person,
      latitude: row.latitude,
      longitude: row.longitude,
      city: row.city,
      checkedInAt: row.checked_in_at,
      note: row.note,
      isSelf: row.profile_id === userId,
    })
  }

  members.sort((a, b) => a.person.name.localeCompare(b.person.name))
  return members
}

async function resolveOriginFromHomeBase(
  homeBase: string | null | undefined,
): Promise<MapOrigin> {
  if (homeBase?.trim()) {
    const geocoded = await geocodePlace(homeBase)
    if (geocoded) {
      return {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        city: geocoded.city,
        source: "home_base",
      }
    }
  }

  return {
    ...FALLBACK_MAP_CENTER,
    source: "none",
  }
}

async function resolveMapOrigin(
  homeBase: string | null | undefined,
  ownCheckIn: Pick<
    CheckInRow,
    "latitude" | "longitude" | "city" | "checked_in_at" | "note"
  > | null,
): Promise<MapOrigin> {
  if (ownCheckIn) {
    const origin: MapOrigin = {
      latitude: ownCheckIn.latitude,
      longitude: ownCheckIn.longitude,
      city: ownCheckIn.city ?? undefined,
      source: "check_in",
    }

    if (!origin.city) {
      const resolvedCity = await reverseGeocodeCity(ownCheckIn)
      if (resolvedCity) origin.city = resolvedCity
    }

    return origin
  }

  return resolveOriginFromHomeBase(homeBase)
}

export async function getNearbyCheckInsFromOrigin(
  origin: MapOrigin,
  userId: string,
): Promise<CheckedInMember[]> {
  const supabase = await createClient()
  const box = boundingBox(origin, NEARBY_RADIUS_MILES)
  const rows = await fetchFreshCheckInsInBox(supabase, box)
  const profileIds = rows.map((row) => row.profile_id)
  const extrasMap = await fetchDirectoryExtrasForProfiles(
    supabase,
    userId,
    profileIds,
  )

  const members = toCheckedInMembers(rows, origin, userId, extrasMap)
  const blockedIds = await fetchBlockedProfileIdsForUser(userId)
  return members.filter((member) => !blockedIds.has(member.id))
}

function cityLabelFromMembers(
  origin: MapOrigin,
  members: CheckedInMember[],
): string {
  if (origin.city) return origin.city
  const firstCity = members.find((member) => member.city)?.city
  return firstCity ?? "Nearby"
}

export const getCheckInMapData = cache(async (): Promise<CheckInMapData> => {
  const user = await getSessionUser()
  if (!user) {
    return {
      origin: { ...FALLBACK_MAP_CENTER, source: "none" },
      members: [],
      cityLabel: "Nearby",
      checkedInCount: 0,
      ownCheckIn: null,
    }
  }

  const supabase = await createClient()
  const cutoff = freshCheckInCutoffIso()

  const [profileResult, ownCheckInResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(MEMBER_PROFILE_SELECT)
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("check_ins")
      .select("latitude, longitude, city, checked_in_at, note")
      .eq("profile_id", user.id)
      .gt("checked_in_at", cutoff)
      .maybeSingle(),
  ])

  const homeBase = (profileResult.data as MemberProfileRow | null)?.home_base
  const ownCheckIn = ownCheckInResult.data as Pick<
    CheckInRow,
    "latitude" | "longitude" | "city" | "checked_in_at" | "note"
  > | null

  const origin = await resolveMapOrigin(homeBase, ownCheckIn)

  const members = await getNearbyCheckInsFromOrigin(origin, user.id)

  const cityLabel = cityLabelFromMembers(origin, members)

  return {
    origin,
    members,
    cityLabel,
    checkedInCount: members.length,
    ownCheckIn: ownCheckIn
      ? {
          latitude: ownCheckIn.latitude,
          longitude: ownCheckIn.longitude,
          city: ownCheckIn.city ?? origin.city ?? null,
          checkedInAt: ownCheckIn.checked_in_at,
          note: ownCheckIn.note,
        }
      : null,
  }
})

/** Nearby members for a map view center without changing the user's saved check-in. */
export async function refreshCheckInMapDataForViewCenter(
  latitude: number,
  longitude: number,
  city?: string | null,
): Promise<CheckInMapData> {
  const user = await getSessionUser()
  if (!user) {
    return {
      origin: { ...FALLBACK_MAP_CENTER, source: "none" },
      members: [],
      cityLabel: city ?? "Nearby",
      checkedInCount: 0,
      ownCheckIn: null,
    }
  }

  const supabase = await createClient()
  const cutoff = freshCheckInCutoffIso()

  const [profileResult, ownCheckInResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(MEMBER_PROFILE_SELECT)
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("check_ins")
      .select("latitude, longitude, city, checked_in_at, note")
      .eq("profile_id", user.id)
      .gt("checked_in_at", cutoff)
      .maybeSingle(),
  ])

  const homeBase = (profileResult.data as MemberProfileRow | null)?.home_base
  const ownCheckInRow = ownCheckInResult.data as Pick<
    CheckInRow,
    "latitude" | "longitude" | "city" | "checked_in_at" | "note"
  > | null

  const origin = await resolveMapOrigin(homeBase, ownCheckInRow)

  const viewOrigin: MapOrigin = {
    latitude,
    longitude,
    city: city?.trim() || undefined,
    source: "check_in",
  }

  const members = await getNearbyCheckInsFromOrigin(viewOrigin, user.id)
  const cityLabel =
    city?.trim() ||
    cityLabelFromMembers(viewOrigin, members) ||
    cityLabelFromMembers(origin, members)

  return {
    origin,
    members,
    cityLabel,
    checkedInCount: members.length,
    ownCheckIn: ownCheckInRow
      ? {
          latitude: ownCheckInRow.latitude,
          longitude: ownCheckInRow.longitude,
          city: ownCheckInRow.city ?? origin.city ?? null,
          checkedInAt: ownCheckInRow.checked_in_at,
          note: ownCheckInRow.note,
        }
      : null,
  }
}

export async function buildCheckInMapDataFromCoords(
  latitude: number,
  longitude: number,
  city?: string | null,
  note?: string | null,
  checkedInAt?: string,
): Promise<CheckInMapData> {
  const user = await getSessionUser()
  if (!user) {
    return {
      origin: { latitude, longitude, city: city ?? undefined, source: "check_in" },
      members: [],
      cityLabel: city ?? "Nearby",
      checkedInCount: 0,
      ownCheckIn: {
        latitude,
        longitude,
        city: city ?? null,
        checkedInAt: checkedInAt ?? new Date().toISOString(),
        note: note ?? null,
      },
    }
  }

  const origin: MapOrigin = {
    latitude,
    longitude,
    city: city ?? undefined,
    source: "check_in",
  }

  let members = await getNearbyCheckInsFromOrigin(origin, user.id)

  const supabase = await createClient()
  const { data: profileRow } = await supabase
    .from("profiles")
    .select(MEMBER_PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle()

  const typedProfile = profileRow as MemberProfileRow | null
  const selfCheckedInAt = checkedInAt ?? new Date().toISOString()
  const selfNote = note ?? null

  if (typedProfile && !members.some((member) => member.isSelf)) {
    const selfExtras = await fetchDirectoryExtrasForProfiles(supabase, user.id, [
      user.id,
    ])
    members = [
      ...members,
      {
        person: toPersonFromProfile(
          typedProfile,
          selfExtras.get(user.id),
        ),
        latitude,
        longitude,
        city: city ?? null,
        checkedInAt: selfCheckedInAt,
        note: selfNote,
        isSelf: true,
      },
    ]
  }

  const resolvedCity =
    city ?? (await reverseGeocodeCity({ latitude, longitude }))
  if (resolvedCity) {
    origin.city = resolvedCity
  }

  const cityLabel = resolvedCity ?? cityLabelFromMembers(origin, members)

  return {
    origin,
    members,
    cityLabel,
    checkedInCount: members.length,
    ownCheckIn: {
      latitude,
      longitude,
      city: resolvedCity ?? null,
      checkedInAt: selfCheckedInAt,
      note: selfNote,
    },
  }
}
