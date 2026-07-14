// Open-Meteo geocoding API — free, no API key required.
// https://open-meteo.com/en/docs/geocoding-api
// Lets users type a place name and resolve it to lat/lng instead of hand-entering
// coordinates — a meaningful convenience for a location-driven tracker.

export interface GeoResult {
  id: number
  name: string
  admin1?: string
  country?: string
  countryCode?: string
  lat: number
  lng: number
}

export async function geocode(
  query: string,
  signal?: AbortSignal,
): Promise<GeoResult[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}` +
    `&count=6&language=en&format=json`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const data = await res.json()
  const results = Array.isArray(data.results) ? data.results : []
  return results.map(
    (r: {
      id: number
      name: string
      admin1?: string
      country?: string
      country_code?: string
      latitude: number
      longitude: number
    }): GeoResult => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      countryCode: r.country_code,
      lat: r.latitude,
      lng: r.longitude,
    }),
  )
}

export function formatPlace(r: GeoResult): string {
  return [r.name, r.admin1, r.country].filter(Boolean).join(', ')
}
