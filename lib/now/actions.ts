"use server"

import { getSessionUser } from "@/lib/auth/get-session-user"
import {
  buildCheckInMapDataFromCoords,
  getCheckInMapData,
  refreshCheckInMapDataForViewCenter,
  type CheckInMapData,
} from "@/lib/now/check-in"
import { normalizeCheckInNote } from "@/lib/now/check-in-ui"
import { geocodePlace, reverseGeocodeCity } from "@/lib/now/geo"
import { createAdminClient } from "@/lib/supabase/admin"

export type CheckInActionResult =
  | { ok: true; mapData: CheckInMapData }
  | { ok: false; error: string }

export type NearbyCheckInsResult =
  | { ok: true; mapData: CheckInMapData }
  | { ok: false; error: string }

async function upsertCheckIn(input: {
  latitude: number
  longitude: number
  city: string | null
  note: string | null
}): Promise<CheckInActionResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const checkedInAt = new Date().toISOString()

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return {
      ok: false,
      error: "Check-in is unavailable. Server configuration is incomplete.",
    }
  }

  // User-scoped client cannot update/delete stale own rows hidden by
  // check_ins_select_fresh; persist via service role after session verification.
  const { error } = await admin.from("check_ins").upsert(
    {
      profile_id: user.id,
      latitude: input.latitude,
      longitude: input.longitude,
      city: input.city,
      note: input.note,
      checked_in_at: checkedInAt,
    },
    { onConflict: "profile_id" },
  )

  if (error) {
    return { ok: false, error: "Could not save check-in. Please try again." }
  }

  const mapData = await buildCheckInMapDataFromCoords(
    input.latitude,
    input.longitude,
    input.city,
    input.note,
    checkedInAt,
  )
  return { ok: true, mapData }
}

export async function checkInAtLocation(input: {
  latitude: number
  longitude: number
  city?: string | null
  note?: string | null
}): Promise<CheckInActionResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const { latitude, longitude } = input
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { ok: false, error: "Invalid location." }
  }

  let city = input.city?.trim() || null
  if (!city) {
    city = await reverseGeocodeCity({ latitude, longitude })
  }

  const note = normalizeCheckInNote(input.note)
  return upsertCheckIn({
    latitude,
    longitude,
    city,
    note: note.length > 0 ? note : null,
  })
}

export async function checkInBySearch(input: {
  query: string
  note?: string | null
}): Promise<CheckInActionResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const query = input.query.trim()
  if (!query) {
    return { ok: false, error: "Enter a city or venue." }
  }

  const geocoded = await geocodePlace(query)
  if (!geocoded) {
    return { ok: false, error: "Could not find that place. Try another search." }
  }

  const note = normalizeCheckInNote(input.note)
  return upsertCheckIn({
    latitude: geocoded.latitude,
    longitude: geocoded.longitude,
    city: geocoded.city ?? query,
    note: note.length > 0 ? note : null,
  })
}

export async function clearCheckIn(): Promise<CheckInActionResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return {
      ok: false,
      error: "Could not clear check-in. Server configuration is incomplete.",
    }
  }

  const { error } = await admin
    .from("check_ins")
    .delete()
    .eq("profile_id", user.id)

  if (error) {
    return { ok: false, error: "Could not clear check-in. Please try again." }
  }

  const mapData = await getCheckInMapData()
  return { ok: true, mapData }
}

export async function refreshNearbyCheckIns(input: {
  latitude: number
  longitude: number
  city?: string | null
}): Promise<NearbyCheckInsResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const { latitude, longitude } = input
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { ok: false, error: "Invalid location." }
  }

  const mapData = await refreshCheckInMapDataForViewCenter(
    latitude,
    longitude,
    input.city,
  )

  return { ok: true, mapData }
}

export async function reloadCheckInMapData(): Promise<NearbyCheckInsResult> {
  const user = await getSessionUser()
  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const mapData = await getCheckInMapData()
  return { ok: true, mapData }
}
