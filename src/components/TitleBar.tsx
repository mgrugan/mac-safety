import { useStore, type ThemePref } from '../store'
import { IconMenu, IconSun } from './icons'

export function TitleBar({ count, onMenu }: { count: number; onMenu: () => void }) {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const cycle = () => {
    const order: ThemePref[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  return (
    <header className="titlebar">
      <button
        className="iconbtn mobile-only"
        onClick={onMenu}
        aria-label="Open filters"
        title="Filters"
      >
        <IconMenu />
      </button>
      <span className="app-name">Mac Safety Take Home</span>
      <span className="app-sub">
        {count} {count === 1 ? 'project' : 'projects'}
      </span>
      <div className="spacer" />
      <button
        className="iconbtn"
        onClick={cycle}
        title={`Appearance: ${theme} (click to change)`}
        aria-label={`Appearance: ${theme}`}
      >
        <IconSun />
      </button>
    </header>
  )
}
