import { useCallback, useEffect, useState } from 'react'
import { selectVisible, useStore } from './store'
import { useEffectiveTheme } from './theme'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { Toolbar, type ViewMode } from './components/Toolbar'
import { ProjectTable } from './components/ProjectTable'
import { ProjectMap } from './components/ProjectMap'
import { ProjectEditor } from './components/ProjectEditor'

export default function App() {
  const projects = useStore((s) => s.projects)
  const visible = useStore(selectVisible)
  const themePref = useStore((s) => s.theme)
  const effective = useEffectiveTheme(themePref)

  const [view, setView] = useState<ViewMode>('list')
  const [editor, setEditor] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  // apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
  }, [effective])

  const openNew = useCallback(() => setEditor({ open: true, id: null }), [])
  const openEdit = useCallback((id: string) => setEditor({ open: true, id }), [])
  const closeEditor = useCallback(() => setEditor({ open: false, id: null }), [])

  // keyboard: ⌘N new, ⌘F focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        openNew()
      } else if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openNew])

  const editingProject =
    editor.open && editor.id
      ? (projects.find((p) => p.id === editor.id) ?? null)
      : null

  return (
    <div className="app">
      <TitleBar count={projects.length} />
      <div className="body">
        <Sidebar projects={projects} />
        <main className="main">
          <Toolbar view={view} onView={setView} onNew={openNew} />
          <div className="content">
            {view === 'list' ? (
              <ProjectTable projects={visible} onEdit={openEdit} />
            ) : (
              <ProjectMap projects={visible} theme={effective} onEdit={openEdit} />
            )}
          </div>
        </main>
      </div>

      {editor.open && (
        <ProjectEditor project={editingProject} onClose={closeEditor} />
      )}
    </div>
  )
}
