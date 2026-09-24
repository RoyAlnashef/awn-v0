/** Approximate miles per degree of latitude. */
const MILES_PER_LAT_DEGREE = 69

/** Default nearby radius in miles. */
export const NEARBY_RADIUS_MILES = 25

/** Check-ins older than this are not shown. */
export const CHECK_IN_TTL_MS = 24 * 60 * 60 * 1000

export type Coordinates = {
  latitude: number
  longitude: number
}

export type MapOrigin = Coordinates & {
  city?: string
  source: "home_base" | "check_in" | "none"
}

/** Continental US center — neutral fallback when home base cannot be geocoded. */
export const FALLBACK_MAP_CENTER: Coordinates = {
  latitude: 39.8283,
  longitude: -98.5795,
}

export function milesBetween(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusMiles = 3958.8
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h))
}

export function boundingBox(
  center: Coordinates,
  radiusMiles: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusMiles / MILES_PER_LAT_DEGREE
  const lngDelta =
    radiusMiles / (MILES_PER_LAT_DEGREE * Math.cos((center.latitude * Math.PI) / 180))

  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  }
}

type MapboxFeature = {
  center?: [number, number]
  place_name?: string
  text?: string
  place_type?: string[]
}

type MapboxGeocodeResponse = {
  features?: MapboxFeature[]
}

function mapboxToken(): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()
  return token || null
}

export async function geocodePlace(query: string): Promise<Coordinates & { city?: string } | null> {
  const token = mapboxToken()
  const trimmed = query.trim()
  if (!token || !trimmed) return null

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`,
  )
  url.searchParams.set("access_token", token)
  url.searchParams.set("limit", "1")
  url.searchParams.set("types", "place,locality,neighborhood,region")

  const response = await fetch(url.toString(), { next: { revalidate: 86400 } })
  if (!response.ok) return null

  const data = (await response.json()) as MapboxGeocodeResponse
  const feature = data.features?.[0]
  const center = feature?.center
  if (!center) return null

  const city =
    feature.text?.trim() ||
    feature.place_name?.split(",")[0]?.trim() ||
    undefined

  return {
    longitude: center[0],
    latitude: center[1],
    city,
  }
}

export async function reverseGeocodeCity(
  coords: Coordinates,
): Promise<string | null> {
  const token = mapboxToken()
  if (!token) return null

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json`,
  )
  url.searchParams.set("access_token", token)
  url.searchParams.set("limit", "1")
  url.searchParams.set("types", "place,locality,neighborhood")

  const response = await fetch(url.toString(), { next: { revalidate: 86400 } })
  if (!response.ok) return null

  const data = (await response.json()) as MapboxGeocodeResponse
  const feature = data.features?.[0]
  if (!feature) return null

  return (
    feature.text?.trim() ||
    feature.place_name?.split(",")[0]?.trim() ||
    null
  )
}

export function freshCheckInCutoffIso(): string {
  return new Date(Date.now() - CHECK_IN_TTL_MS).toISOString()
}
