import { useStore } from '../store'
import { PRIORITIES } from '../types'
import { IconList, IconMap, IconPlus, IconSearch } from './icons'

export type ViewMode = 'list' | 'map'

export function Toolbar({
  view,
  onView,
  onNew,
}: {
  view: ViewMode
  onView: (v: ViewMode) => void
  onNew: () => void
}) {
  const filters = useStore((s) => s.filters)
  const setFilter = useStore((s) => s.setFilter)

  return (
    <div className="toolbar">
      <div className="seg" role="tablist" aria-label="View">
        <button
          role="tab"
          aria-pressed={view === 'list'}
          aria-selected={view === 'list'}
          onClick={() => onView('list')}
        >
          <IconList /> List
        </button>
        <button
          role="tab"
          aria-pressed={view === 'map'}
          aria-selected={view === 'map'}
          onClick={() => onView('map')}
        >
          <IconMap /> Map
        </button>
      </div>

      <div className="search">
        <span className="ico">
          <IconSearch />
        </span>
        <input
          type="search"
          placeholder="Search projects…"
          aria-label="Search projects"
          value={filters.query}
          data-search-input
          onChange={(e) => setFilter('query', e.target.value)}
        />
      </div>

      <select
        className="control"
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(e) =>
          setFilter('priority', e.target.value as typeof filters.priority)
        }
      >
        <option value="all">Any priority</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <label
        className="btn ghost"
        style={{ gap: 8, userSelect: 'none' }}
        title="Hide completed projects"
      >
        <input
          type="checkbox"
          checked={filters.hideDone}
          onChange={(e) => setFilter('hideDone', e.target.checked)}
        />
        Hide done
      </label>

      <div className="spacer" />

      <button className="btn primary" onClick={onNew} title="New project (⌘N)">
        <IconPlus /> New Project
      </button>
    </div>
  )
}
