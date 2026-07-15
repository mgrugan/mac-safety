import { useStore, type ThemePref } from '../store'
import { IconSun } from './icons'

export function TitleBar({ count }: { count: number }) {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const cycle = () => {
    const order: ThemePref[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  return (
    <header className="titlebar">
      <div className="traffic" aria-hidden>
        <i className="c" />
        <i className="m" />
        <i className="x" />
      </div>
      <span className="app-name">Mac Take Home</span>
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
