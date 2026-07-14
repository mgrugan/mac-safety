export type Status = 'planned' | 'active' | 'blocked' | 'done'
export type Priority = 'low' | 'medium' | 'high'

export interface Project {
  id: string
  title: string
  status: Status
  priority: Priority
  notes: string
  /** ISO date string (yyyy-mm-dd) or empty */
  dueDate: string
  location: {
    label: string
    lat: number | null
    lng: number | null
  }
  createdAt: number
  updatedAt: number
  completedAt: number | null
}

export const STATUSES: { value: Status; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function emptyProject(): Project {
  const now = Date.now()
  return {
    id: cryptoId(),
    title: '',
    status: 'planned',
    priority: 'medium',
    notes: '',
    dueDate: '',
    location: { label: '', lat: null, lng: null },
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }
}

export function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function hasCoords(p: Project): p is Project & {
  location: { label: string; lat: number; lng: number }
} {
  return typeof p.location.lat === 'number' && typeof p.location.lng === 'number'
}
