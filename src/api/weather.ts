// Open-Meteo forecast API — free, no API key required.
// https://open-meteo.com/en/docs
// Used to surface on-site conditions for each field project location, which is
// genuinely useful for planning field work (temperature, wind, precipitation).

export interface Weather {
  temperatureC: number
  feelsLikeC: number
  windKph: number
  humidity: number
  precipitation: number
  code: number
  isDay: boolean
  label: string
  emoji: string
}

const WMO: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Clear', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Rime fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌦️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  66: { label: 'Freezing rain', emoji: '🌧️' },
  67: { label: 'Freezing rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '🌨️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  77: { label: 'Snow grains', emoji: '🌨️' },
  80: { label: 'Rain showers', emoji: '🌦️' },
  81: { label: 'Rain showers', emoji: '🌧️' },
  82: { label: 'Violent showers', emoji: '⛈️' },
  85: { label: 'Snow showers', emoji: '🌨️' },
  86: { label: 'Snow showers', emoji: '❄️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm', emoji: '⛈️' },
  99: { label: 'Thunderstorm', emoji: '⛈️' },
}

export async function fetchWeather(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,` +
    `wind_speed_10m,weather_code,is_day&wind_speed_unit=kmh`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`)
  const data = await res.json()
  const c = data.current ?? {}
  const code: number = c.weather_code ?? 0
  const meta = WMO[code] ?? { label: 'Unknown', emoji: '•' }
  return {
    temperatureC: Math.round(c.temperature_2m ?? 0),
    feelsLikeC: Math.round(c.apparent_temperature ?? c.temperature_2m ?? 0),
    windKph: Math.round(c.wind_speed_10m ?? 0),
    humidity: Math.round(c.relative_humidity_2m ?? 0),
    precipitation: c.precipitation ?? 0,
    code,
    isDay: c.is_day === 1,
    label: meta.label,
    emoji: meta.emoji,
  }
}

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32)
}
