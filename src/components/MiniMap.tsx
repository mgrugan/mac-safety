import { useEffect, useRef } from 'react'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import type { Effective } from '../theme'

function style(theme: Effective): StyleSpecification {
  const v = theme === 'dark' ? 'dark_all' : 'light_all'
  return {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [
          `https://a.basemaps.cartocdn.com/${v}/{z}/{x}/{y}@2x.png`,
          `https://b.basemaps.cartocdn.com/${v}/{z}/{x}/{y}@2x.png`,
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap · © CARTO',
      },
    },
    layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
  }
}

export function MiniMap({ lat, lng, theme }: { lat: number; lng: number; theme: Effective }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: ref.current,
      style: style(theme),
      center: [lng, lat],
      zoom: 12,
      interactive: false,
      attributionControl: false,
    })
    const el = document.createElement('div')
    el.className = 'map-pin'
    el.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="#3525cd" stroke="#fff" stroke-width="1.6"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="10" r="2.7" fill="#fff" stroke="none"/></svg>`
    new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    mapRef.current?.setStyle(style(theme))
  }, [theme])

  useEffect(() => {
    mapRef.current?.jumpTo({ center: [lng, lat], zoom: 12 })
  }, [lat, lng])

  return <div className="minimap"><div ref={ref} style={{ position: 'absolute', inset: 0 }} /></div>
}
