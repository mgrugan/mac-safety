import { useEffect, useMemo, useRef } from 'react'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import { hasCoords, type Project, type Status } from '../types'
import { useStore } from '../store'
import type { Effective } from '../theme'

// Keyless raster basemaps (CARTO) so no Mapbox/Google token is required.
// Light & dark variants keep the map consistent with the app theme.
function basemapStyle(theme: Effective): StyleSpecification {
  const variant = theme === 'dark' ? 'dark_all' : 'light_all'
  return {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [
          `https://a.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}@2x.png`,
          `https://b.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}@2x.png`,
          `https://c.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}@2x.png`,
        ],
        tileSize: 256,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
      },
    },
    layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
  }
}

const STATUS_HEX: Record<Status, string> = {
  planned: '#8a8375',
  active: '#2e6d53',
  blocked: '#b4362e',
  done: '#2b6cb0',
}

function pinElement(color: string, selected: boolean): HTMLElement {
  const el = document.createElement('div')
  el.className = 'map-pin' + (selected ? ' selected' : '')
  el.innerHTML = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="1.4">
      <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/>
      <circle cx="12" cy="10" r="2.7" fill="#fff" stroke="none"/>
    </svg>`
  if (selected) {
    ;(el.firstElementChild as SVGElement | null)?.setAttribute('stroke-width', '2.2')
    el.style.transform = 'translate(-50%, -100%) scale(1.18)'
  }
  return el
}

export function ProjectMap({
  projects,
  theme,
  onEdit,
}: {
  projects: Project[]
  theme: Effective
  onEdit: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const readyRef = useRef(false)

  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)

  const mapped = useMemo(() => projects.filter(hasCoords), [projects])
  const missing = projects.length - mapped.length

  // init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: basemapStyle(theme),
      center: [-98.5, 39.5],
      zoom: 3.2,
      attributionControl: { compact: true },
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => {
      readyRef.current = true
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      readyRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // theme → swap basemap
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setStyle(basemapStyle(theme))
  }, [theme])

  // markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    mapped.forEach((p) => {
      const el = pinElement(STATUS_HEX[p.status], p.id === selectedId)
      el.title = p.title || 'Untitled project'

      const popup = new maplibregl.Popup({ offset: 18, closeButton: true }).setHTML(
        `<h4>${escapeHtml(p.title || 'Untitled project')}</h4>
         <div class="pc-row">${escapeHtml(p.location.label || '')}</div>
         <div class="pc-row">Status: ${p.status} · Priority: ${p.priority}</div>
         ${p.dueDate ? `<div class="pc-row">Due ${escapeHtml(p.dueDate)}</div>` : ''}`,
      )

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([p.location.lng!, p.location.lat!])
        .setPopup(popup)
        .addTo(map)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        select(p.id)
      })
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation()
        onEdit(p.id)
      })
      markersRef.current.push(marker)
    })
  }, [mapped, selectedId, select, onEdit])

  // fit bounds when the mapped set changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || mapped.length === 0) return
    const fit = () => {
      const bounds = new maplibregl.LngLatBounds()
      mapped.forEach((p) => bounds.extend([p.location.lng!, p.location.lat!]))
      map.fitBounds(bounds, { padding: 80, maxZoom: 9, duration: 500 })
    }
    if (readyRef.current) fit()
    else map.once('load', fit)
  }, [mapped])

  // pan to selection
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedId) return
    const p = mapped.find((m) => m.id === selectedId)
    if (p) map.easeTo({ center: [p.location.lng!, p.location.lat!], duration: 500 })
  }, [selectedId, mapped])

  return (
    <div className="map-wrap">
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="map-legend" aria-hidden>
        {(['active', 'planned', 'blocked', 'done'] as Status[]).map((s) => (
          <div className="row" key={s}>
            <i style={{ background: STATUS_HEX[s] }} />
            {s[0].toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>
      {missing > 0 && (
        <div className="map-nocoords">
          {missing} project{missing === 1 ? '' : 's'} without coordinates not shown
        </div>
      )}
      {mapped.length === 0 && (
        <div className="map-nocoords" style={{ left: 16, right: 'auto' }}>
          No mapped projects yet — add coordinates to see them here.
        </div>
      )}
    </div>
  )
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )
}
