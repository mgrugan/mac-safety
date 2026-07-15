import type { ViewMode } from '../App'
import { IconFolder, IconLayers, IconMap, IconAdd } from './icons'

export function Nav({
  view,
  onView,
  onNew,
  open,
  onClose,
}: {
  view: ViewMode
  onView: (v: ViewMode) => void
  onNew: () => void
  open: boolean
  onClose: () => void
}) {
  const go = (v: ViewMode) => {
    onView(v)
    onClose()
  }

  return (
    <nav className={`nav${open ? ' open' : ''}`} aria-label="Primary">
      <div className="nav-brand">
        <span className="nav-logo" aria-hidden>
          <IconLayers />
        </span>
        <div>
          <h1>Mac Safety Take Home</h1>
          <p>Field Operations</p>
        </div>
      </div>

      <div className="nav-items">
        <button className="nav-item" aria-current={view === 'list'} onClick={() => go('list')}>
          <IconFolder /> Projects
        </button>
        <button className="nav-item" aria-current={view === 'map'} onClick={() => go('map')}>
          <IconMap /> Map
        </button>
      </div>

      <div className="nav-foot">
        <button className="nav-new" onClick={onNew}>
          <IconAdd width={18} height={18} /> New Project
        </button>
        <div className="nav-user">
          <span className="nav-avatar" aria-hidden>MS</span>
          <div>
            <div className="u-name">Field User</div>
            <div className="u-role">Local workspace</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
