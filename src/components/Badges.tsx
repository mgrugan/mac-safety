import type { Priority, Status } from '../types'

const STATUS_LABEL: Record<Status, string> = {
  planned: 'Draft',
  active: 'Active',
  blocked: 'Blocked',
  done: 'Completed',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`pill status-${status}`}>
      <span className="d" />
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
      <span className="d" />
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

/** Raw hex per status for map pins (theme-independent). */
export const STATUS_COLOR: Record<Status, string> = {
  planned: '#64748b',
  active: '#3525cd',
  blocked: '#ba1a1a',
  done: '#16803c',
}
