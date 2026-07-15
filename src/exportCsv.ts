import type { Project } from './types'

function esc(v: string | number | null): string {
  const s = v == null ? '' : String(v)
  // Always quote; double any embedded quotes (RFC 4180).
  return `"${s.replace(/"/g, '""')}"`
}

const COLUMNS: { header: string; get: (p: Project) => string | number | null }[] = [
  { header: 'ID', get: (p) => '#MS-' + p.id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase() },
  { header: 'Title', get: (p) => p.title || 'Untitled project' },
  { header: 'Status', get: (p) => p.status },
  { header: 'Priority', get: (p) => p.priority },
  { header: 'Due Date', get: (p) => p.dueDate || '' },
  { header: 'Location', get: (p) => p.location.label || '' },
  { header: 'Latitude', get: (p) => (p.location.lat ?? '') as number | '' },
  { header: 'Longitude', get: (p) => (p.location.lng ?? '') as number | '' },
  { header: 'Notes', get: (p) => p.notes || '' },
  { header: 'Created', get: (p) => new Date(p.createdAt).toISOString() },
  { header: 'Updated', get: (p) => new Date(p.updatedAt).toISOString() },
  { header: 'Completed', get: (p) => (p.completedAt ? new Date(p.completedAt).toISOString() : '') },
]

export function projectsToCsv(projects: Project[]): string {
  const head = COLUMNS.map((c) => esc(c.header)).join(',')
  const rows = projects.map((p) => COLUMNS.map((c) => esc(c.get(p))).join(','))
  // Prepend BOM so Excel reads UTF-8 correctly.
  return '﻿' + [head, ...rows].join('\r\n')
}

export function downloadProjectsCsv(projects: Project[]): void {
  const csv = projectsToCsv(projects)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `mac-safety-projects-${stamp}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
