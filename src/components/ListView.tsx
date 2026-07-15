import { useStore } from '../store'
import { PRIORITIES, STATUSES, type Project } from '../types'
import { downloadProjectsCsv } from '../exportCsv'
import { ProjectTable } from './ProjectTable'
import { ProjectCards } from './ProjectCards'
import { StatsBento } from './StatsBento'
import { IconDownload, IconSearch } from './icons'

export function ListView({
  visible,
  all,
  isMobile,
  onOpen,
  onEdit,
}: {
  visible: Project[]
  all: Project[]
  isMobile: boolean
  onOpen: (id: string) => void
  onEdit: (id: string) => void
}) {
  const filters = useStore((s) => s.filters)
  const setFilter = useStore((s) => s.setFilter)

  return (
    <div className="listview">
      <div className="list-head">
        <div>
          <h2>All Projects</h2>
          <p>Manage and track {all.length} field {all.length === 1 ? 'operation' : 'operations'} across all sites.</p>
        </div>
        <div className="head-actions">
          <button
            className="btn"
            title={`Export ${visible.length} project(s) as CSV`}
            disabled={visible.length === 0}
            onClick={() => downloadProjectsCsv(visible)}
          >
            <IconDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="controls">
        <div className="search">
          <span className="i"><IconSearch /></span>
          <input
            type="search"
            placeholder="Filter by title, notes or location…"
            aria-label="Filter projects"
            value={filters.query}
            onChange={(e) => setFilter('query', e.target.value)}
          />
        </div>
        <div className="filters">
          <span className="lbl">Filter by</span>
          <select
            className="control"
            aria-label="Status"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value as typeof filters.status)}
          >
            <option value="all">Status: All</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>Status: {s.label}</option>
            ))}
          </select>
          <select
            className="control"
            aria-label="Priority"
            value={filters.priority}
            onChange={(e) => setFilter('priority', e.target.value as typeof filters.priority)}
          >
            <option value="all">Priority: All</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>Priority: {p.label}</option>
            ))}
          </select>
          <label className="chk-inline">
            <input type="checkbox" checked={filters.hideDone} onChange={(e) => setFilter('hideDone', e.target.checked)} />
            Hide done
          </label>
        </div>
      </div>

      {isMobile ? (
        <ProjectCards projects={visible} onOpen={onOpen} />
      ) : (
        <ProjectTable projects={visible} onOpen={onOpen} onEdit={onEdit} />
      )}

      <StatsBento projects={all} />
    </div>
  )
}
