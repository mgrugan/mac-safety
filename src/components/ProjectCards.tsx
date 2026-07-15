import { useStore } from '../store'
import { hasCoords, type Project } from '../types'
import { PriorityBadge, StatusBadge } from './Badges'
import { WeatherChip } from './WeatherChip'
import { IconCalendar, IconCheck, IconChevronRight, IconPin } from './icons'

export function ProjectCards({
  projects,
  onOpen,
}: {
  projects: Project[]
  onOpen: (id: string) => void
}) {
  const toggleComplete = useStore((s) => s.toggleComplete)
  const today = new Date().toISOString().slice(0, 10)

  if (projects.length === 0) {
    return (
      <div className="empty">
        <h3>No projects match</h3>
        <p>Adjust your filters or search, or create a new field project.</p>
      </div>
    )
  }

  return (
    <div className="cards">
      {projects.map((p) => {
        const done = p.status === 'done'
        const overdue = p.dueDate && !done && p.dueDate < today
        return (
          <button key={p.id} className="card" onClick={() => onOpen(p.id)} aria-label={`Open ${p.title || 'Untitled project'}`}>
            <span
              className={`cbx ${done ? 'on' : ''}`}
              role="checkbox"
              aria-checked={done}
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); toggleComplete(p.id) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleComplete(p.id) }
              }}
            >
              <IconCheck />
            </span>
            <span className="card-body">
              <span className="card-title" style={done ? { textDecoration: 'line-through', color: 'var(--on-surface-variant)' } : undefined}>
                {p.title || 'Untitled project'}
              </span>
              <span className="card-row">
                <StatusBadge status={p.status} />
                <PriorityBadge priority={p.priority} />
              </span>
              <span className="card-row">
                {p.dueDate && (
                  <span className={`chip ${overdue ? 'overdue' : ''}`}><IconCalendar /> {formatDate(p.dueDate)}</span>
                )}
                {p.location.label && (
                  <span className="chip"><IconPin width={12} height={12} /> {p.location.label}</span>
                )}
                {hasCoords(p) && <WeatherChip lat={p.location.lat} lng={p.location.lng} />}
              </span>
            </span>
            <span className="card-go" aria-hidden><IconChevronRight /></span>
          </button>
        )
      })}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
