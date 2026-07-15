import type { Project } from '../types'
import { IconAdd, IconTrendingUp, IconWarning } from './icons'

export function StatsBento({ projects }: { projects: Project[] }) {
  const total = projects.length || 1
  const active = projects.filter((p) => p.status === 'active').length
  const today = new Date().toISOString().slice(0, 10)
  const overdue = projects.filter(
    (p) => p.dueDate && p.status !== 'done' && p.dueDate < today,
  ).length
  const mapped = projects.filter((p) => p.location.lat != null && p.location.lng != null).length
  const mappedPct = Math.round((mapped / total) * 100)
  const activePct = Math.round((active / total) * 100)

  return (
    <div className="bento">
      <div className="stat">
        <div className="top">
          <span className="lbl">Active Operations</span>
          <IconTrendingUp width={18} height={18} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="row">
          <span className="big">{String(active).padStart(2, '0')}</span>
          <span className="delta"><IconTrendingUp /> {activePct}%</span>
        </div>
        <div className="bar"><span style={{ width: `${activePct}%` }} /></div>
      </div>

      <div className="stat">
        <div className="top">
          <span className="lbl">Overdue / Attention</span>
          <IconWarning style={{ color: overdue ? 'var(--error)' : 'var(--on-surface-variant)' }} />
        </div>
        <div className="row">
          <span className="big" style={{ color: overdue ? 'var(--error)' : undefined }}>
            {String(overdue).padStart(2, '0')}
          </span>
          <span className="lbl">{overdue ? 'Needs review' : 'All on track'}</span>
        </div>
        <div className="segbar">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < overdue ? 'on' : ''} />
          ))}
        </div>
      </div>

      <div className="stat">
        <div className="top">
          <span className="lbl">Mapped Coverage</span>
          <IconAdd width={18} height={18} style={{ color: 'var(--secondary)' }} />
        </div>
        <div className="row">
          <span className="big">{mapped}<span style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>/{projects.length}</span></span>
        </div>
        <div className="bar"><span style={{ width: `${mappedPct}%`, background: 'var(--secondary)' }} /></div>
      </div>
    </div>
  )
}
