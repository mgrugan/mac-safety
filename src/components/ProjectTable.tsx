import { useStore, type SortKey } from '../store'
import { hasCoords, type Project } from '../types'
import { PriorityBadge, StatusBadge } from './Badges'
import { WeatherChip } from './WeatherChip'
import { IconCheck, IconEdit, IconMoreVert, IconPin, IconSort } from './icons'

const COLS: { key: SortKey | null; label: string; sortable: boolean }[] = [
  { key: null, label: '', sortable: false },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true },
  { key: null, label: 'Coordinates', sortable: false },
  { key: null, label: 'Conditions', sortable: false },
  { key: null, label: 'Actions', sortable: false },
]

export function shortId(id: string): string {
  return '#MS-' + id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()
}

export function ProjectTable({
  projects,
  onOpen,
  onEdit,
}: {
  projects: Project[]
  onOpen: (id: string) => void
  onEdit: (id: string) => void
}) {
  const sort = useStore((s) => s.sort)
  const setSort = useStore((s) => s.setSort)
  const selectedId = useStore((s) => s.selectedId)
  const toggleComplete = useStore((s) => s.toggleComplete)

  if (projects.length === 0) {
    return (
      <div className="grid-card">
        <div className="empty" style={{ height: 280 }}>
          <h3>No projects match</h3>
          <p>Adjust your filters or search, or create a new field project.</p>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="grid-card">
      <div className="grid-scroll">
        <table className="grid">
          <thead>
            <tr>
              {COLS.map((c, i) => (
                <th
                  key={i}
                  className={c.sortable ? 'sortable' : undefined}
                  style={i === COLS.length - 1 ? { textAlign: 'right' } : undefined}
                  onClick={c.sortable && c.key ? () => setSort(c.key!) : undefined}
                  aria-sort={
                    c.key && sort.key === c.key
                      ? sort.dir === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <span className="sortwrap">
                    {c.label}
                    {c.sortable && (
                      <IconSort style={{ opacity: sort.key === c.key ? 1 : 0.4, color: sort.key === c.key ? 'var(--primary)' : undefined }} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const done = p.status === 'done'
              const overdue = p.dueDate && !done && p.dueDate < today
              return (
                <tr
                  key={p.id}
                  aria-selected={selectedId === p.id}
                  onClick={() => onOpen(p.id)}
                  onDoubleClick={() => onEdit(p.id)}
                >
                  <td onClick={(e) => e.stopPropagation()} style={{ width: 48 }}>
                    <button
                      className={`cbx ${done ? 'on' : ''}`}
                      onClick={() => toggleComplete(p.id)}
                      aria-pressed={done}
                      title={done ? 'Mark as active' : 'Mark complete'}
                    >
                      <IconCheck />
                    </button>
                  </td>
                  <td>
                    <span className="cell-title">
                      <span className={`t ${done ? 'done' : ''}`}>{p.title || 'Untitled project'}</span>
                      <span className="id">{shortId(p.id)}</span>
                    </span>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><PriorityBadge priority={p.priority} /></td>
                  <td>
                    {p.dueDate ? (
                      <span className={`cell-due ${overdue ? 'overdue' : ''}`}>{formatDate(p.dueDate)}</span>
                    ) : (
                      <span style={{ color: 'var(--on-surface-variant)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {hasCoords(p) ? (
                      <span className="cell-coords">{fmtCoord(p.location.lat!, true)}, {fmtCoord(p.location.lng!, false)}</span>
                    ) : (
                      <span className="cell-coords" style={{ opacity: 0.6 }}>—</span>
                    )}
                  </td>
                  <td>
                    {hasCoords(p) ? (
                      <WeatherChip lat={p.location.lat} lng={p.location.lng} />
                    ) : (
                      <span style={{ color: 'var(--on-surface-variant)' }}>—</span>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'right' }}>
                    <span className="row-actions">
                      <button className="mini-icon" title="Edit" onClick={() => onEdit(p.id)}>
                        <IconEdit width={18} height={18} />
                      </button>
                      <button className="mini-icon" title="Details" onClick={() => onOpen(p.id)}>
                        <IconMoreVert width={18} height={18} />
                      </button>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="grid-foot">
        <span>Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <IconPin width={13} height={13} />
          {projects.filter(hasCoords).length} mapped
        </span>
      </div>
    </div>
  )
}

function fmtCoord(v: number, isLat: boolean): string {
  const dir = isLat ? (v >= 0 ? 'N' : 'S') : v >= 0 ? 'E' : 'W'
  return `${Math.abs(v).toFixed(4)}° ${dir}`
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}
