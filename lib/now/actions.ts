"use server"

import { getSessionUser } from "@/lib/auth/get-session-user"
import {
  buildCheckInMapDataFromCoords,
  type CheckInMapData,
} from "@/lib/now/check-in"
import { reverseGeocodeCity } from "@/lib/now/geo"
import { createClient } from "@/lib/supabase/server"

export type CheckInActionResult =
  | { ok: true; mapData: CheckInMapData }
  | { ok: false; error: string }

export type NearbyCheckInsResult =
  | { ok: true; mapData: CheckInMapData }
  | { ok: false; error: string }

export async function checkInAtLocation(input: {
  latitude: number
  longitude: number
  city?: string | null
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

  const supabase = await createClient()
  const { error } = await supabase.from("check_ins").upsert(
    {
      profile_id: user.id,
      latitude,
      longitude,
      city,
      checked_in_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" },
  )

  if (error) {
    return { ok: false, error: "Could not save check-in. Please try again." }
  }

  const mapData = await buildCheckInMapDataFromCoords(latitude, longitude, city)
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

  const mapData = await buildCheckInMapDataFromCoords(
    input.latitude,
    input.longitude,
    input.city,
  )

  return { ok: true, mapData }
}
