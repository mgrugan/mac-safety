import { useEffect, useMemo, useRef } from 'react'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import { hasCoords, type Project, type Status } from '../types'
import { useStore } from '../store'
import type { Effective } from '../theme'
import { StatusBadge } from './Badges'
import { IconAdd, IconPin } from './icons'

function basemap(theme: Effective): StyleSpecification {
  const v = theme === 'dark' ? 'dark_all' : 'light_all'
  return {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [
          `https://a.basemaps.cartocdn.com/${v}/{z}/{x}/{y}@2x.png`,
          `https://b.basemaps.cartocdn.com/${v}/{z}/{x}/{y}@2x.png`,
          `https://c.basemaps.cartocdn.com/${v}/{z}/{x}/{y}@2x.png`,
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap · © CARTO',
      },
    },
    layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
  }
}

const HEX: Record<Status, string> = {
  planned: '#64748b',
  active: '#3525cd',
  blocked: '#ba1a1a',
  done: '#16803c',
}

function pin(color: string, selected: boolean): HTMLElement {
  const el = document.createElement('div')
  el.className = 'map-pin'
  el.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="1.6"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="10" r="2.7" fill="#fff" stroke="none"/></svg>`
  if (selected) el.style.transform = 'translate(-50%, -100%) scale(1.2)'
  return el
}

export function ProjectMap({
  projects,
  theme,
  onOpen,
}: {
  projects: Project[]
  theme: Effective
  onOpen: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const readyRef = useRef(false)
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)

  const mapped = useMemo(() => projects.filter(hasCoords), [projects])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: basemap(theme),
      center: [-98.5, 39.5],
      zoom: 3.2,
      attributionControl: { compact: true },
    })
    map.on('load', () => { readyRef.current = true })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null; readyRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { mapRef.current?.setStyle(basemap(theme)) }, [theme])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    mapped.forEach((p) => {
      const el = pin(HEX[p.status], p.id === selectedId)
      el.title = p.title || 'Untitled project'
      const popup = new maplibregl.Popup({ offset: 20, closeButton: true }).setHTML(
        `<h4>${esc(p.title || 'Untitled project')}</h4><div class="pc">${esc(p.location.label || '')}</div><div class="pc">${p.status} · ${p.priority}</div>`,
      )
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([p.location.lng!, p.location.lat!]).setPopup(popup).addTo(map)
      el.addEventListener('click', (e) => { e.stopPropagation(); select(p.id) })
      el.addEventListener('dblclick', (e) => { e.stopPropagation(); onOpen(p.id) })
      markersRef.current.push(marker)
    })
  }, [mapped, selectedId, select, onOpen])

  useEffect(() => {
    const map = mapRef.current
    if (!map || mapped.length === 0) return
    const fit = () => {
      const b = new maplibregl.LngLatBounds()
      mapped.forEach((p) => b.extend([p.location.lng!, p.location.lat!]))
      map.fitBounds(b, { padding: { top: 80, bottom: 80, left: 360, right: 80 }, maxZoom: 9, duration: 500 })
    }
    if (readyRef.current) fit()
    else map.once('load', fit)
  }, [mapped])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedId) return
    const p = mapped.find((m) => m.id === selectedId)
    if (p) map.easeTo({ center: [p.location.lng!, p.location.lat!], duration: 500 })
  }, [selectedId, mapped])

  const active = projects.filter((p) => p.status === 'active').length

  return (
    <div className="mapview">
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      <aside className="map-panel">
        <div className="ph">
          <h3>Projects</h3>
          <span className="mono" style={{ color: 'var(--on-surface-variant)' }}>{mapped.length} mapped</span>
        </div>
        <div className="plist">
          {mapped.length === 0 && (
            <p style={{ padding: 16, color: 'var(--on-surface-variant)', fontSize: 13 }}>
              No mapped projects. Add coordinates to a project to see it here.
            </p>
          )}
          {mapped.map((p) => (
            <button key={p.id} className="map-proj" aria-selected={p.id === selectedId} onClick={() => onOpen(p.id)}>
              <div className="mp-top">
                <StatusBadge status={p.status} />
                <span className={`prio ${p.priority}`}><span className="d" />{p.priority}</span>
              </div>
              <div className="mp-title">{p.title || 'Untitled project'}</div>
              <div className="mp-loc"><IconPin width={13} height={13} /> {p.location.label || 'Field site'}</div>
            </button>
          ))}
        </div>
      </aside>

      <div className="map-controls">
        <div className="grp">
          <button aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}><IconAdd /></button>
          <button aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14" /></svg>
          </button>
        </div>
      </div>

      <div className="map-stats">
        <div className="s"><div className="k">Live Projects</div><div className="v pri">{active}</div></div>
        <div className="div" />
        <div className="s"><div className="k">Total Mapped</div><div className="v">{mapped.length}</div></div>
      </div>
    </div>
  )
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
