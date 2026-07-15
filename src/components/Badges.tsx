import type { Priority, Status } from '../types'

const STATUS_LABEL: Record<Status, string> = {
  planned: 'Planned',
  active: 'Active',
  blocked: 'Blocked',
  done: 'Done',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`badge status-${status}`}>
      <span className="dot" />
      {STATUS_LABEL[status]}
    </span>
  )
}

const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`prio ${priority}`} title={`${PRIORITY_LABEL[priority]} priority`}>
      <span className="bars" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

/** Status color as a raw hex-ish var, for the map pins. */
export const STATUS_COLOR: Record<Status, string> = {
  planned: 'var(--ink-3)',
  active: 'var(--primary)',
  blocked: 'var(--danger)',
  done: 'var(--success)',
}
