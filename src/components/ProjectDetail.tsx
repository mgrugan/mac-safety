import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { hasCoords, type Project } from '../types'
import { fetchWeather, cToF, type Weather } from '../api/weather'
import type { Effective } from '../theme'
import { PriorityBadge, StatusBadge } from './Badges'
import { MiniMap } from './MiniMap'
import { shortId } from './ProjectTable'
import {
  IconCalendar, IconCheck, IconChevronRight, IconClose, IconCopy, IconDroplet,
  IconEdit, IconInfo, IconPin, IconRain, IconThermometer, IconTrash, IconWarning, IconWind,
} from './icons'

export function ProjectDetail({
  project,
  theme,
  onEdit,
  onClose,
}: {
  project: Project
  theme: Effective
  onEdit: (id: string) => void
  onClose: () => void
}) {
  const toggleComplete = useStore((s) => s.toggleComplete)
  const duplicate = useStore((s) => s.duplicateProject)
  const remove = useStore((s) => s.deleteProject)

  const [wx, setWx] = useState<Weather | null>(null)
  const [wxBusy, setWxBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!hasCoords(project)) { setWx(null); return }
    const ctrl = new AbortController()
    setWxBusy(true)
    fetchWeather(project.location.lat!, project.location.lng!, ctrl.signal)
      .then(setWx).catch(() => setWx(null)).finally(() => setWxBusy(false))
    return () => ctrl.abort()
  }, [project.location.lat, project.location.lng])

  const done = project.status === 'done'
  const today = new Date().toISOString().slice(0, 10)
  const overdue = project.dueDate && !done && project.dueDate < today
  const windy = wx && wx.windKph >= 30

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Project details">
        <header>
          <h2>Project Details</h2>
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={() => toggleComplete(project.id)}>
            <IconCheck /> {done ? 'Reopen' : 'Complete'}
          </button>
          <button className="btn primary" onClick={() => onEdit(project.id)}>
            <IconEdit width={15} height={15} /> Edit
          </button>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </header>

        <div className="body">
          <div>
            <div className="d-breadcrumb">
              <span>Projects</span>
              <IconChevronRight width={13} height={13} />
              <span className="cur">{project.title || 'Untitled project'}</span>
            </div>
            <h1 className={`d-title ${done ? 'done' : ''}`}>{project.title || 'Untitled project'}</h1>
            <div className="mono" style={{ color: 'var(--on-surface-variant)', marginTop: 4 }}>{shortId(project.id)}</div>
          </div>

          {/* Summary */}
          <div className="dcard pad">
            <h3><span className="ic"><IconInfo width={18} height={18} /></span> Project Summary</h3>
            <div className="summary-grid">
              <div>
                <div className="lbl">Status</div>
                <StatusBadge status={project.status} />
              </div>
              <div>
                <div className="lbl">Priority</div>
                <PriorityBadge priority={project.priority} />
              </div>
              <div>
                <div className="lbl">Due Date</div>
                <div className="val" style={overdue ? { color: 'var(--error)' } : undefined}>
                  {project.dueDate ? formatDate(project.dueDate) : '—'}
                </div>
              </div>
              <div>
                <div className="lbl">Location</div>
                <div className="val" style={{ fontSize: 'var(--text-base)' }}>{project.location.label || 'Not set'}</div>
              </div>
            </div>
            {project.notes && (
              <div className="notes-block">
                <div className="lbl">Project Notes</div>
                <p>{project.notes}</p>
              </div>
            )}
          </div>

          {/* Site conditions */}
          {hasCoords(project) && (
            <div className="dcard pad wxcard">
              <span className="glyph" aria-hidden>{wx ? wx.emoji : '☁️'}</span>
              <h3><span className="ic"><IconThermometer width={18} height={18} /></span> Site Conditions</h3>
              {wx ? (
                <>
                  <div className="now">
                    <div className="temp">{wx.temperatureC}°</div>
                    <div>
                      <div className="cond">{wx.label}</div>
                      <div className="feels">Feels like {wx.feelsLikeC}° · {cToF(wx.temperatureC)}°F · {project.location.label}</div>
                    </div>
                  </div>
                  <div className="wx-tiles">
                    <Tile icon={<IconWind />} k="Wind Speed" v={`${wx.windKph} km/h`} />
                    <Tile icon={<IconThermometer />} k="Feels Like" v={`${wx.feelsLikeC}°C`} />
                    <Tile icon={<IconDroplet />} k="Humidity" v={`${wx.humidity}%`} />
                    <Tile icon={<IconRain />} k="Precipitation" v={`${wx.precipitation} mm`} />
                  </div>
                  {windy && (
                    <div className="wx-alert"><IconWarning /> High wind on site ({wx.windKph} km/h) — take care.</div>
                  )}
                </>
              ) : (
                <div className="feels">{wxBusy ? 'Loading conditions…' : 'Weather unavailable'}</div>
              )}
            </div>
          )}

          {/* Site location */}
          <div className="dcard" style={{ overflow: 'hidden' }}>
            <div style={{ padding: 'var(--stack-md)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--primary)' }}><IconPin width={16} height={16} /></span>
              <span style={{ fontWeight: 600 }}>Site Location</span>
            </div>
            {hasCoords(project) ? (
              <>
                <MiniMap lat={project.location.lat!} lng={project.location.lng!} theme={theme} />
                <div className="loc-foot">
                  <span className="addr">{project.location.label || 'Field site'}</span>
                  <span className="mono coords">
                    <span>Lat: {project.location.lat!.toFixed(4)}</span>
                    <span>Long: {project.location.lng!.toFixed(4)}</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="loc-foot"><span className="sub">No coordinates set for this project.</span></div>
            )}
          </div>
        </div>

        <footer>
          <button className="btn" onClick={() => duplicate(project.id)} title="Duplicate">
            <IconCopy width={15} height={15} /> Duplicate
          </button>
          <button
            className="btn danger"
            onClick={() => { if (confirm('Delete this project?')) { remove(project.id); onClose() } }}
          >
            <IconTrash width={15} height={15} /> Delete
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--on-surface-variant)' }}>
            <IconCalendar /> Updated {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </footer>
      </div>
    </div>
  )
}

function Tile({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="wx-tile">
      <span className="ic">{icon}</span>
      <div>
        <div className="k">{k}</div>
        <div className="v">{v}</div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
