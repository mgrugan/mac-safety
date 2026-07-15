import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { emptyProject, PRIORITIES, STATUSES, type Priority, type Project, type Status } from '../types'
import { geocode, formatPlace, type GeoResult } from '../api/geocode'
import type { Effective } from '../theme'
import { MiniMap } from './MiniMap'
import { IconClose, IconMap, IconPin, IconTrash } from './icons'

export function ProjectEditor({
  project,
  theme,
  onClose,
}: {
  project: Project | null
  theme: Effective
  onClose: () => void
}) {
  const isNew = project === null
  const addProject = useStore((s) => s.addProject)
  const updateProject = useStore((s) => s.updateProject)
  const removeProject = useStore((s) => s.deleteProject)

  const [draft, setDraft] = useState<Project>(() => project ?? emptyProject())
  const [geoQuery, setGeoQuery] = useState('')
  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [geoOpen, setGeoOpen] = useState(false)
  const [geoBusy, setGeoBusy] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const q = geoQuery.trim()
    if (q.length < 2) { setGeoResults([]); return }
    const ctrl = new AbortController()
    setGeoBusy(true)
    const t = setTimeout(() => {
      geocode(q, ctrl.signal)
        .then((r) => { setGeoResults(r); setGeoOpen(true) })
        .catch(() => setGeoResults([]))
        .finally(() => setGeoBusy(false))
    }, 300)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [geoQuery])

  const set = <K extends keyof Project>(k: K, v: Project[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const setLoc = (patch: Partial<Project['location']>) =>
    setDraft((d) => ({ ...d, location: { ...d.location, ...patch } }))
  const pick = (r: GeoResult) => {
    setLoc({ label: formatPlace(r), lat: r.lat, lng: r.lng })
    setGeoQuery(''); setGeoResults([]); setGeoOpen(false)
  }
  const canSave = draft.title.trim().length > 0
  const save = () => {
    const clean: Partial<Project> = { ...draft, title: draft.title.trim() || 'Untitled project' }
    if (isNew) addProject(clean)
    else updateProject(draft.id, clean)
    onClose()
  }
  const hasCoords = draft.location.lat != null && draft.location.lng != null

  return (
    <div className="scrim center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={isNew ? 'New project' : 'Edit project'}>
        <header>
          <h2>{isNew ? 'New Project' : 'Edit Project'}</h2>
          <div style={{ flex: 1 }} />
          <button className="iconbtn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </header>

        <div className="body">
          <div className="field">
            <label htmlFor="f-title">Project Title</label>
            <input
              id="f-title" ref={titleRef} value={draft.title}
              placeholder="e.g. Riverside Environmental Survey 2024"
              onChange={(e) => set('title', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSave) save() }}
            />
            <span className="hint">Clear, descriptive names help team coordination.</span>
          </div>

          <div className="field">
            <label htmlFor="f-notes">Description / Notes</label>
            <textarea id="f-notes" rows={3} value={draft.notes}
              placeholder="Define scope, crew, equipment, and access notes…"
              onChange={(e) => set('notes', e.target.value)} />
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="f-status">Status</label>
              <select id="f-status" value={draft.status} onChange={(e) => set('status', e.target.value as Status)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <div className="segmented" role="group" aria-label="Priority">
                {PRIORITIES.map((p) => (
                  <button key={p.value} type="button" aria-pressed={draft.priority === p.value}
                    onClick={() => set('priority', p.value as Priority)}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="f-due">Due Date</label>
              <input id="f-due" type="date" value={draft.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
            <div className="info-box">
              <span className="ic"><IconMap width={18} height={18} /></span>
              <p>Weather &amp; geocoding are looked up automatically from the coordinates below.</p>
            </div>
          </div>

          <div className="field">
            <div className="anchor-head">
              <label style={{ marginBottom: 0 }}>Geographic Anchoring</label>
              <span className="hint" style={{ fontStyle: 'normal' }}>{geoBusy ? 'Searching…' : 'Open-Meteo geocoding'}</span>
            </div>
            <div className="geo-box">
              <input placeholder="Search a place to set coordinates…" value={geoQuery}
                onChange={(e) => setGeoQuery(e.target.value)}
                onFocus={() => geoResults.length && setGeoOpen(true)} autoComplete="off" />
              {geoOpen && geoResults.length > 0 && (
                <div className="geo-results" role="listbox">
                  {geoResults.map((r) => (
                    <button key={r.id} type="button" onClick={() => pick(r)}>
                      {r.name}
                      <span className="sub"> {[r.admin1, r.country].filter(Boolean).join(', ')} · {r.lat.toFixed(2)}, {r.lng.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="row2">
            <div className="field">
              <label>Latitude</label>
              <div className="coord-input">
                <span className="ic"><IconPin width={16} height={16} /></span>
                <input inputMode="decimal" placeholder="40.7128" value={draft.location.lat ?? ''}
                  onChange={(e) => setLoc({ lat: e.target.value === '' ? null : Number(e.target.value) })} />
              </div>
            </div>
            <div className="field">
              <label>Longitude</label>
              <div className="coord-input">
                <span className="ic"><IconPin width={16} height={16} /></span>
                <input inputMode="decimal" placeholder="-74.0060" value={draft.location.lng ?? ''}
                  onChange={(e) => setLoc({ lng: e.target.value === '' ? null : Number(e.target.value) })} />
              </div>
            </div>
          </div>

          {hasCoords && (
            <div className="map-preview">
              <MiniMap lat={draft.location.lat!} lng={draft.location.lng!} theme={theme} />
            </div>
          )}
        </div>

        <footer>
          {!isNew && (
            <button className="btn danger" style={{ marginRight: 'auto' }}
              onClick={() => { if (confirm('Delete this project?')) { removeProject(draft.id); onClose() } }}>
              <IconTrash width={15} height={15} /> Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save} disabled={!canSave}>{isNew ? 'Create Project' : 'Save'}</button>
        </footer>
      </div>
    </div>
  )
}
