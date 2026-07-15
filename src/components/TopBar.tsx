import { useState } from 'react'
import { useStore } from '../store'
import type { Effective } from '../theme'
import type { Project } from '../types'
import { STATUS_COLOR } from './Badges'
import { IconBell, IconCalendar, IconMenu, IconMoon, IconSearch, IconSun, IconWarning } from './icons'

interface Alert {
  project: Project
  reason: string
  color: string
  score: number
}

function computeAlerts(projects: Project[]): Alert[] {
  const today = new Date().toISOString().slice(0, 10)
  const dayMs = 86_400_000
  const daysBetween = (a: string, b: string) =>
    Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / dayMs)

  const out: Alert[] = []
  for (const p of projects) {
    if (p.status === 'done') continue
    if (p.dueDate && p.dueDate < today) {
      const d = daysBetween(p.dueDate, today)
      out.push({ project: p, reason: `Overdue by ${d} day${d === 1 ? '' : 's'}`, color: 'var(--error)', score: 200 + d })
    } else if (p.status === 'blocked') {
      out.push({ project: p, reason: 'Blocked — needs attention', color: STATUS_COLOR.blocked, score: 120 })
    } else if (p.dueDate && daysBetween(today, p.dueDate) <= 3) {
      const d = daysBetween(today, p.dueDate)
      out.push({ project: p, reason: d === 0 ? 'Due today' : `Due in ${d} day${d === 1 ? '' : 's'}`, color: 'var(--prio-med)', score: 90 - d })
    } else if (p.priority === 'high' && p.status === 'active') {
      out.push({ project: p, reason: 'High priority · active', color: STATUS_COLOR.active, score: 60 })
    }
  }
  return out.sort((a, b) => b.score - a.score)
}

export function TopBar({
  onMenu,
  onOpenProject,
  effective,
}: {
  onMenu: () => void
  onOpenProject: (id: string) => void
  effective: Effective
}) {
  const query = useStore((s) => s.filters.query)
  const setFilter = useStore((s) => s.setFilter)
  const projects = useStore((s) => s.projects)
  const setTheme = useStore((s) => s.setTheme)
  const [bellOpen, setBellOpen] = useState(false)

  // One click flips between the two visible themes (no silent "system" step).
  const isDark = effective === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  const alerts = computeAlerts(projects)

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

      <div className="notif-wrap">
        <button
          className="iconbtn"
          aria-label={`Notifications: ${alerts.length} need attention`}
          aria-expanded={bellOpen}
          onClick={() => setBellOpen((o) => !o)}
        >
          <IconBell />
          {alerts.length > 0 && <span className="badge-dot" />}
        </button>
        {bellOpen && (
          <>
            <div className="notif-backdrop" onClick={() => setBellOpen(false)} />
            <div className="notif-pop" role="dialog" aria-label="Notifications">
              <div className="nh">
                <h4>Needs attention</h4>
                {alerts.length > 0 && <span className="cnt">{alerts.length}</span>}
              </div>
              {alerts.length === 0 ? (
                <div className="notif-empty">
                  <span className="big" aria-hidden>✅</span>
                  You're all caught up — nothing overdue or blocked.
                </div>
              ) : (
                <div className="notif-list">
                  {alerts.slice(0, 6).map((a) => (
                    <button
                      key={a.project.id}
                      className="notif-item"
                      onClick={() => { onOpenProject(a.project.id); setBellOpen(false) }}
                    >
                      <span className="nd" style={{ background: a.color }} />
                      <span>
                        <span className="nt">{a.project.title || 'Untitled project'}</span>
                        <span className="ns">
                          <IconWarning width={12} height={12} /> {a.reason}
                          {a.project.dueDate && (
                            <>
                              {' · '}
                              <IconCalendar width={12} height={12} /> {formatDate(a.project.dueDate)}
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="topbar-div desktop-only" />
      <button
        className="iconbtn"
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <IconSun /> : <IconMoon />}
      </button>
    </header>
  )
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
