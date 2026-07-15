import { useStore, type ThemePref } from '../store'
import { IconBell, IconHelp, IconMenu, IconSearch, IconSun } from './icons'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const query = useStore((s) => s.filters.query)
  const setFilter = useStore((s) => s.setFilter)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const cycle = () => {
    const order: ThemePref[] = ['system', 'light', 'dark']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }

  return (
    <header className="topbar">
      <button className="iconbtn menu-btn" onClick={onMenu} aria-label="Open menu">
        <IconMenu />
      </button>
      <div className="topbar-search">
        <span className="i"><IconSearch /></span>
        <input
          type="search"
          placeholder="Search projects by title or location…"
          aria-label="Search projects"
          data-search-input
          value={query}
          onChange={(e) => setFilter('query', e.target.value)}
        />
      </div>
      <div className="spacer" />
      <button className="iconbtn desktop-only" aria-label="Notifications">
        <IconBell />
        <span className="badge-dot" />
      </button>
      <button className="iconbtn desktop-only" aria-label="Help"><IconHelp /></button>
      <div className="topbar-div desktop-only" />
      <button className="iconbtn" onClick={cycle} title={`Appearance: ${theme}`} aria-label="Toggle appearance">
        <IconSun />
      </button>
    </header>
  )
}
