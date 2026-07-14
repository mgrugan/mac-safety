import { useStore, type SortKey } from '../store'
import { hasCoords, type Project } from '../types'
import { PriorityBadge, StatusBadge } from './Badges'
import { WeatherChip } from './WeatherChip'
import { IconCheck, IconCopy, IconEdit, IconPin, IconTrash } from './icons'

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
  { key: null, label: '', sortable: false },
  { key: 'title', label: 'Project', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'dueDate', label: 'Due', sortable: true },
  { key: null, label: 'Location', sortable: false },
  { key: null, label: 'Conditions', sortable: false },
  { key: null, label: '', sortable: false },
]

export function ProjectTable({
  projects,
  onEdit,
}: {
  projects: Project[]
  onEdit: (id: string) => void
}) {
  const sort = useStore((s) => s.sort)
  const setSort = useStore((s) => s.setSort)
  const selectedId = useStore((s) => s.selectedId)
  const select = useStore((s) => s.select)
  const toggleComplete = useStore((s) => s.toggleComplete)
  const duplicate = useStore((s) => s.duplicateProject)
  const remove = useStore((s) => s.deleteProject)

  if (projects.length === 0) return <TableEmpty />

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="table-wrap">
      <table className="projects">
        <thead>
          <tr>
            {COLUMNS.map((c, i) => (
              <th
                key={i}
                className={c.sortable ? 'sortable' : undefined}
                onClick={c.sortable && c.key ? () => setSort(c.key!) : undefined}
                aria-sort={
                  c.key && sort.key === c.key
                    ? sort.dir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                {c.label}
                {c.key && sort.key === c.key && (
                  <span className="arrow" aria-hidden>
                    {sort.dir === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const overdue = p.dueDate && p.status !== 'done' && p.dueDate < today
            const done = p.status === 'done'
            return (
              <tr
                key={p.id}
                aria-selected={selectedId === p.id}
                onClick={() => select(p.id)}
                onDoubleClick={() => onEdit(p.id)}
                style={{ cursor: 'default' }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`check ${done ? 'on' : ''}`}
                    onClick={() => toggleComplete(p.id)}
                    aria-pressed={done}
                    title={done ? 'Mark as active' : 'Mark complete'}
                  >
                    <IconCheck />
                  </button>
                </td>
                <td>
                  <span
                    className="cell-title"
                    style={
                      done
                        ? { textDecoration: 'line-through', color: 'var(--ink-3)' }
                        : undefined
                    }
                  >
                    {p.title || 'Untitled project'}
                    {p.notes && <span className="muted">{truncate(p.notes, 64)}</span>}
                  </span>
                </td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td>
                  <PriorityBadge priority={p.priority} />
                </td>
                <td>
                  {p.dueDate ? (
                    <span className={`due ${overdue ? 'overdue' : ''}`}>
                      {formatDate(p.dueDate)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--ink-3)' }}>—</span>
                  )}
                </td>
                <td>
                  {p.location.label || hasCoords(p) ? (
                    <span className="cell-loc">
                      <IconPin />
                      <span>
                        {p.location.label || '—'}
                        {hasCoords(p) && (
                          <span className="cell-coords">
                            {' '}
                            {p.location.lat!.toFixed(3)}, {p.location.lng!.toFixed(3)}
                          </span>
                        )}
                      </span>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--ink-3)' }}>No location</span>
                  )}
                </td>
                <td>
                  {hasCoords(p) ? (
                    <WeatherChip lat={p.location.lat} lng={p.location.lng} />
                  ) : (
                    <span style={{ color: 'var(--ink-3)' }}>—</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <span className="rowtools">
                    <button
                      className="iconbtn"
                      title="Edit"
                      onClick={() => onEdit(p.id)}
                    >
                      <IconEdit width={15} height={15} />
                    </button>
                    <button
                      className="iconbtn"
                      title="Duplicate"
                      onClick={() => duplicate(p.id)}
                    >
                      <IconCopy width={15} height={15} />
                    </button>
                    <button
                      className="iconbtn"
                      title="Delete"
                      onClick={() => {
                        if (confirm(`Delete "${p.title || 'Untitled project'}"?`))
                          remove(p.id)
                      }}
                    >
                      <IconTrash width={15} height={15} />
                    </button>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TableEmpty() {
  return (
    <div className="empty">
      <h2>No projects match</h2>
      <p>Adjust your filters or search, or create a new field project to get started.</p>
    </div>
  )
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
