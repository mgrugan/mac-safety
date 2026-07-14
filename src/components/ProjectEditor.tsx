import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import {
  emptyProject,
  PRIORITIES,
  STATUSES,
  type Priority,
  type Project,
  type Status,
} from '../types'
import { geocode, formatPlace, type GeoResult } from '../api/geocode'
import { fetchWeather, cToF, type Weather } from '../api/weather'
import { IconClose, IconPin, IconTrash } from './icons'

export function ProjectEditor({
  project,
  onClose,
}: {
  project: Project | null
  onClose: () => void
}) {
  const isNew = project === null
  const addProject = useStore((s) => s.addProject)
  const updateProject = useStore((s) => s.updateProject)
  const removeProject = useStore((s) => s.deleteProject)

  const [draft, setDraft] = useState<Project>(() => project ?? emptyProject())

  // geocoding search
  const [geoQuery, setGeoQuery] = useState('')
  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [geoOpen, setGeoOpen] = useState(false)
  const [geoBusy, setGeoBusy] = useState(false)

  // weather preview
  const [wx, setWx] = useState<Weather | null>(null)
  const [wxBusy, setWxBusy] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // debounced geocoding
  useEffect(() => {
    const q = geoQuery.trim()
    if (q.length < 2) {
      setGeoResults([])
      return
    }
    const ctrl = new AbortController()
    setGeoBusy(true)
    const t = setTimeout(() => {
      geocode(q, ctrl.signal)
        .then((r) => {
          setGeoResults(r)
          setGeoOpen(true)
        })
        .catch(() => setGeoResults([]))
        .finally(() => setGeoBusy(false))
    }, 300)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [geoQuery])

  // weather preview for current coords
  useEffect(() => {
    const { lat, lng } = draft.location
    if (lat == null || lng == null) {
      setWx(null)
      return
    }
    const ctrl = new AbortController()
    setWxBusy(true)
    fetchWeather(lat, lng, ctrl.signal)
      .then(setWx)
      .catch(() => setWx(null))
      .finally(() => setWxBusy(false))
    return () => ctrl.abort()
  }, [draft.location.lat, draft.location.lng])

  const set = <K extends keyof Project>(key: K, value: Project[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const setLoc = (patch: Partial<Project['location']>) =>
    setDraft((d) => ({ ...d, location: { ...d.location, ...patch } }))

  const pickPlace = (r: GeoResult) => {
    setLoc({ label: formatPlace(r), lat: r.lat, lng: r.lng })
    setGeoQuery('')
    setGeoResults([])
    setGeoOpen(false)
  }

  const save = () => {
    const clean: Partial<Project> = {
      ...draft,
      title: draft.title.trim() || 'Untitled project',
    }
    if (isNew) addProject(clean)
    else updateProject(draft.id, clean)
    onClose()
  }

  const canSave = draft.title.trim().length > 0

  return (
    <div
      className="scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'New project' : 'Edit project'}
      >
        <header>
          <h2>{isNew ? 'New Project' : 'Edit Project'}</h2>
          <div style={{ flex: 1 }} />
          <button className="iconbtn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </header>

        <div className="form">
          <div className="field">
            <label htmlFor="f-title">Title</label>
            <input
              id="f-title"
              ref={titleRef}
              value={draft.title}
              placeholder="e.g. Bridge deck inspection"
              onChange={(e) => set('title', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSave) save()
              }}
            />
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="f-status">Status</label>
              <select
                id="f-status"
                value={draft.status}
                onChange={(e) => set('status', e.target.value as Status)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-priority">Priority</label>
              <select
                id="f-priority"
                value={draft.priority}
                onChange={(e) => set('priority', e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-due">Due date</label>
            <input
              id="f-due"
              type="date"
              value={draft.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="f-geo">Location</label>
            <div className="geo-box">
              <input
                id="f-geo"
                placeholder="Search a place to set coordinates…"
                value={geoQuery}
                onChange={(e) => setGeoQuery(e.target.value)}
                onFocus={() => geoResults.length && setGeoOpen(true)}
                autoComplete="off"
              />
              {geoOpen && geoResults.length > 0 && (
                <div className="geo-results" role="listbox">
                  {geoResults.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => pickPlace(r)}
                    >
                      {r.name}
                      <span className="sub">
                        {' '}
                        {[r.admin1, r.country].filter(Boolean).join(', ')} ·{' '}
                        {r.lat.toFixed(2)}, {r.lng.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="hint">
              {geoBusy ? 'Searching…' : 'Powered by Open-Meteo geocoding — no API key.'}
            </span>
          </div>

          <div className="field">
            <label>Coordinates</label>
            <div className="coords">
              <input
                inputMode="decimal"
                placeholder="Latitude"
                aria-label="Latitude"
                value={draft.location.lat ?? ''}
                onChange={(e) =>
                  setLoc({ lat: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
              <input
                inputMode="decimal"
                placeholder="Longitude"
                aria-label="Longitude"
                value={draft.location.lng ?? ''}
                onChange={(e) =>
                  setLoc({ lng: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
            </div>
            {draft.location.label && (
              <span className="hint">
                <IconPin width={11} height={11} /> {draft.location.label}
              </span>
            )}
          </div>

          {(wxBusy || wx) && (
            <div className="wx-panel">
              <span className="big" aria-hidden>
                {wx ? wx.emoji : '·'}
              </span>
              <div>
                <div className="t">
                  {wx ? `${wx.temperatureC}°C · ${cToF(wx.temperatureC)}°F` : 'Loading…'}
                </div>
                <div className="s">
                  {wx
                    ? `${wx.label} · wind ${wx.windKph} km/h · on-site now`
                    : 'Fetching current conditions'}
                </div>
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="f-notes">Notes</label>
            <textarea
              id="f-notes"
              value={draft.notes}
              placeholder="Crew, equipment, access notes…"
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>

        <footer>
          {!isNew && (
            <button
              className="btn danger"
              onClick={() => {
                if (confirm('Delete this project?')) {
                  removeProject(draft.id)
                  onClose()
                }
              }}
            >
              <IconTrash width={15} height={15} /> Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={save} disabled={!canSave}>
            {isNew ? 'Create' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  )
}
