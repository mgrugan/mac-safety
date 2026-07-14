import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cryptoId, emptyProject, type Project, type Status, type Priority } from './types'

export type SortKey = 'title' | 'status' | 'priority' | 'dueDate' | 'updatedAt'
export type ThemePref = 'system' | 'light' | 'dark'

interface Filters {
  query: string
  status: Status | 'all'
  priority: Priority | 'all'
  hideDone: boolean
}

interface FieldbaseState {
  projects: Project[]
  selectedId: string | null
  filters: Filters
  sort: { key: SortKey; dir: 'asc' | 'desc' }
  theme: ThemePref

  select: (id: string | null) => void
  addProject: (partial?: Partial<Project>) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  toggleComplete: (id: string) => void
  duplicateProject: (id: string) => void

  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  setSort: (key: SortKey) => void
  setTheme: (theme: ThemePref) => void
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
const STATUS_RANK: Record<Status, number> = { active: 0, blocked: 1, planned: 2, done: 3 }

export const useStore = create<FieldbaseState>()(
  persist(
    (set, get) => ({
      projects: seedProjects(),
      selectedId: null,
      filters: { query: '', status: 'all', priority: 'all', hideDone: false },
      sort: { key: 'updatedAt', dir: 'desc' },
      theme: 'system',

      select: (id) => set({ selectedId: id }),

      addProject: (partial) => {
        const base = emptyProject()
        const project: Project = {
          ...base,
          ...partial,
          location: { ...base.location, ...(partial?.location ?? {}) },
        }
        set((s) => ({ projects: [project, ...s.projects], selectedId: project.id }))
        return project.id
      },

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  location: { ...p.location, ...(patch.location ?? {}) },
                  updatedAt: Date.now(),
                }
              : p,
          ),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      toggleComplete: (id) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== id) return p
            const done = p.status === 'done'
            return {
              ...p,
              status: done ? 'active' : 'done',
              completedAt: done ? null : Date.now(),
              updatedAt: Date.now(),
            }
          }),
        })),

      duplicateProject: (id) => {
        const src = get().projects.find((p) => p.id === id)
        if (!src) return
        const copy: Project = {
          ...src,
          id: cryptoId(),
          title: `${src.title} (copy)`,
          status: 'planned',
          completedAt: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((s) => ({ projects: [copy, ...s.projects], selectedId: copy.id }))
      },

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      setSort: (key) =>
        set((s) => ({
          sort:
            s.sort.key === key
              ? { key, dir: s.sort.dir === 'asc' ? 'desc' : 'asc' }
              : { key, dir: key === 'title' ? 'asc' : 'desc' },
        })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'fieldbase.v1',
      partialize: (s) => ({
        projects: s.projects,
        filters: s.filters,
        sort: s.sort,
        theme: s.theme,
      }),
    },
  ),
)

/** Derived selector: filtered + sorted projects. */
export function selectVisible(s: FieldbaseState): Project[] {
  const { query, status, priority, hideDone } = s.filters
  const q = query.trim().toLowerCase()
  let out = s.projects.filter((p) => {
    if (status !== 'all' && p.status !== status) return false
    if (priority !== 'all' && p.priority !== priority) return false
    if (hideDone && p.status === 'done') return false
    if (q) {
      const hay = `${p.title} ${p.notes} ${p.location.label}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const { key, dir } = s.sort
  const mul = dir === 'asc' ? 1 : -1
  out = [...out].sort((a, b) => {
    switch (key) {
      case 'title':
        return a.title.localeCompare(b.title) * mul
      case 'priority':
        return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * mul
      case 'status':
        return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * mul
      case 'dueDate': {
        const av = a.dueDate || '9999-12-31'
        const bv = b.dueDate || '9999-12-31'
        return av.localeCompare(bv) * mul
      }
      case 'updatedAt':
      default:
        return (a.updatedAt - b.updatedAt) * mul
    }
  })
  return out
}

function seedProjects(): Project[] {
  const now = Date.now()
  const day = 86_400_000
  const iso = (offsetDays: number) =>
    new Date(now + offsetDays * day).toISOString().slice(0, 10)
  const mk = (p: Partial<Project>): Project => ({
    ...emptyProject(),
    ...p,
    location: { label: '', lat: null, lng: null, ...(p.location ?? {}) },
  })

  return [
    mk({
      title: 'Bridge deck inspection — Route 9',
      status: 'active',
      priority: 'high',
      notes: 'Quarterly structural survey. Bring the drone and the moisture meter.',
      dueDate: iso(3),
      location: { label: 'Poughkeepsie, NY', lat: 41.7004, lng: -73.9209 },
      updatedAt: now - day,
    }),
    mk({
      title: 'Solar array commissioning',
      status: 'planned',
      priority: 'medium',
      notes: 'Verify inverter firmware and string voltages before grid tie-in.',
      dueDate: iso(12),
      location: { label: 'Boulder, CO', lat: 40.015, lng: -105.2705 },
      updatedAt: now - 2 * day,
    }),
    mk({
      title: 'Culvert erosion repair',
      status: 'blocked',
      priority: 'high',
      notes: 'Waiting on riprap delivery. Access road washed out after last storm.',
      dueDate: iso(-1),
      location: { label: 'Asheville, NC', lat: 35.5951, lng: -82.5515 },
      updatedAt: now - 4 * day,
    }),
    mk({
      title: 'Wellhead pressure logging',
      status: 'active',
      priority: 'low',
      notes: 'Swap data loggers, download last 30 days, reseal the enclosure.',
      dueDate: iso(6),
      location: { label: 'Midland, TX', lat: 31.9973, lng: -102.0779 },
      updatedAt: now - 5 * day,
    }),
    mk({
      title: 'Trail bridge load test',
      status: 'done',
      priority: 'medium',
      notes: 'Passed at 1.5× rated load. Report filed with the county.',
      dueDate: iso(-8),
      completedAt: now - 6 * day,
      location: { label: 'Bend, OR', lat: 44.0582, lng: -121.3153 },
      updatedAt: now - 6 * day,
    }),
  ]
}
