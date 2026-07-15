import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { hasCoords, type Project } from '../types'
import { fetchWeather, cToF, type Weather } from '../api/weather'
import { PriorityBadge, StatusBadge } from './Badges'
import {
  IconCalendar,
  IconCheck,
  IconClose,
  IconCopy,
  IconEdit,
  IconPin,
  IconTrash,
  IconWind,
} from './icons'

export function ProjectDetail({
  project,
  onEdit,
  onClose,
}: {
  project: Project
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
    if (!hasCoords(project)) {
      setWx(null)
      return
    }
    const ctrl = new AbortController()
    setWxBusy(true)
    fetchWeather(project.location.lat!, project.location.lng!, ctrl.signal)
      .then(setWx)
      .catch(() => setWx(null))
      .finally(() => setWxBusy(false))
    return () => ctrl.abort()
  }, [project.location.lat, project.location.lng])

  const done = project.status === 'done'
  const today = new Date().toISOString().slice(0, 10)
  const overdue = project.dueDate && !done && project.dueDate < today

  return (
    <div
      className="scrim"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Project details">
        <header>
          <h2>Project Details</h2>
          <div style={{ flex: 1 }} />
          <button className="iconbtn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </header>

        <div className="form">
          <div className="detail-title">
            <h3 style={done ? { textDecoration: 'line-through', color: 'var(--ink-3)' } : undefined}>
              {project.title || 'Untitled project'}
            </h3>
            <div className="detail-badges">
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
          </div>

          {/* Weather — featured */}
          <section className="detail-weather" aria-label="On-site weather">
            {hasCoords(project) ? (
              wx ? (
                <>
                  <div className="dw-em" aria-hidden>{wx.emoji}</div>
                  <div className="dw-main">
                    <div className="dw-temp">
                      {wx.temperatureC}°C <span className="dw-f">/ {cToF(wx.temperatureC)}°F</span>
                    </div>
                    <div className="dw-label">{wx.label}</div>
                    <div className="dw-wind">
                      <IconWind /> {wx.windKph} km/h wind · on-site now
                    </div>
                  </div>
                </>
              ) : (
                <div className="dw-main">
                  <div className="dw-label">{wxBusy ? 'Loading conditions…' : 'Weather unavailable'}</div>
                </div>
              )
            ) : (
              <div className="dw-main">
                <div className="dw-label">Add coordinates to see on-site weather</div>
              </div>
            )}
          </section>

          <dl className="detail-list">
            <div className="detail-row">
              <dt><IconCalendar /> Due date</dt>
              <dd className={overdue ? 'overdue' : undefined}>
                {project.dueDate ? formatDate(project.dueDate) : 'No due date'}
                {overdue ? ' · overdue' : ''}
              </dd>
            </div>
            <div className="detail-row">
              <dt><IconPin width={14} height={14} /> Location</dt>
              <dd>{project.location.label || 'Not set'}</dd>
            </div>
            {hasCoords(project) && (
              <div className="detail-row">
                <dt>Coordinates</dt>
                <dd className="mono">
                  {project.location.lat!.toFixed(4)}, {project.location.lng!.toFixed(4)}
                </dd>
              </div>
            )}
          </dl>

          {project.notes && (
            <div className="detail-notes">
              <h4>Notes</h4>
              <p>{project.notes}</p>
            </div>
          )}
        </div>

        <footer>
          <button
            className="btn"
            onClick={() => toggleComplete(project.id)}
            title={done ? 'Mark as active' : 'Mark complete'}
          >
            <IconCheck /> {done ? 'Reopen' : 'Complete'}
          </button>
          <button className="btn" onClick={() => duplicate(project.id)} title="Duplicate">
            <IconCopy width={15} height={15} />
          </button>
          <button
            className="btn danger"
            onClick={() => {
              if (confirm('Delete this project?')) {
                remove(project.id)
                onClose()
              }
            }}
            title="Delete"
          >
            <IconTrash width={15} height={15} />
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn primary" onClick={() => onEdit(project.id)}>
            <IconEdit width={15} height={15} /> Edit
          </button>
        </footer>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
