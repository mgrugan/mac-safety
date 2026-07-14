import { useEffect, useRef, useState } from 'react'
import { fetchWeather, cToF, type Weather } from '../api/weather'

// Small module-level cache so we don't re-hit the API for the same coordinates
// while scrolling the table. Keyed to ~0.1° precision.
const cache = new Map<string, Weather>()
const key = (lat: number, lng: number) => `${lat.toFixed(2)},${lng.toFixed(2)}`

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; wx: Weather }
  | { kind: 'error' }

export function WeatherChip({ lat, lng }: { lat: number; lng: number }) {
  const [state, setState] = useState<State>(() => {
    const c = cache.get(key(lat, lng))
    return c ? { kind: 'ok', wx: c } : { kind: 'idle' }
  })
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const cached = cache.get(key(lat, lng))
    if (cached) {
      setState({ kind: 'ok', wx: cached })
      return
    }
    const ctrl = new AbortController()
    setState({ kind: 'loading' })
    fetchWeather(lat, lng, ctrl.signal)
      .then((wx) => {
        cache.set(key(lat, lng), wx)
        if (mounted.current) setState({ kind: 'ok', wx })
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return
        if (mounted.current) setState({ kind: 'error' })
      })
    return () => {
      mounted.current = false
      ctrl.abort()
    }
  }, [lat, lng])

  if (state.kind === 'loading' || state.kind === 'idle') {
    return (
      <span className="wx loading" aria-label="Loading weather">
        <span className="em">·</span> —
      </span>
    )
  }
  if (state.kind === 'error') {
    return (
      <span className="wx loading" title="Weather unavailable">
        <span className="em">·</span> n/a
      </span>
    )
  }
  const { wx } = state
  return (
    <span className="wx" title={`${wx.label} · wind ${wx.windKph} km/h`}>
      <span className="em" aria-hidden>
        {wx.emoji}
      </span>
      {wx.temperatureC}°C · {cToF(wx.temperatureC)}°F
    </span>
  )
}
