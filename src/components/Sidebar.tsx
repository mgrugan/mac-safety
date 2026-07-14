import { useStore } from '../store'
import type { Project, Status } from '../types'
import { STATUS_COLOR } from './Badges'

const STATUS_FILTERS: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]

export function Sidebar({ projects }: { projects: Project[] }) {
  const current = useStore((s) => s.filters.status)
  const setFilter = useStore((s) => s.setFilter)

  const counts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})
  const total = projects.length
  const withCoords = projects.filter(
    (p) => p.location.lat != null && p.location.lng != null,
  ).length
  const overdue = projects.filter(
    (p) => p.dueDate && p.status !== 'done' && p.dueDate < todayISO(),
  ).length

  return (
    <nav className="sidebar" aria-label="Filters and summary">
      <div className="side-group">
        <h3>Library</h3>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className="side-item"
            aria-current={current === f.value}
            onClick={() => setFilter('status', f.value)}
          >
            <span
              className="dot"
              style={{
                background:
                  f.value === 'all'
                    ? 'var(--ink-3)'
                    : STATUS_COLOR[f.value as Status],
              }}
            />
            {f.label}
            <span className="count">
              {f.value === 'all' ? total : (counts[f.value] ?? 0)}
            </span>
          </button>
        ))}
      </div>

      <div className="side-group">
        <h3>Overview</h3>
        <div className="side-stat">
          <span>Mapped</span>
          <b>
            {withCoords}/{total}
          </b>
        </div>
        <div className="side-stat">
          <span>Overdue</span>
          <b style={{ color: overdue ? 'var(--danger)' : undefined }}>{overdue}</b>
        </div>
        <div className="side-stat">
          <span>Completed</span>
          <b>{counts['done'] ?? 0}</b>
        </div>
      </div>

      <div className="spacer" style={{ flex: 1 }} />
      <div className="side-group">
        <div className="side-stat" style={{ color: 'var(--ink-3)' }}>
          <span>
            New project <span className="kbd">⌘N</span>
          </span>
        </div>
      </div>
    </nav>
  )
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
