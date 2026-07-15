import { useCallback, useEffect, useState } from 'react'
import { selectVisible, useStore } from './store'
import { useEffectiveTheme, useIsMobile } from './theme'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { Toolbar, type ViewMode } from './components/Toolbar'
import { ProjectTable } from './components/ProjectTable'
import { ProjectCards } from './components/ProjectCards'
import { ProjectMap } from './components/ProjectMap'
import { ProjectEditor } from './components/ProjectEditor'
import { ProjectDetail } from './components/ProjectDetail'

export default function App() {
  const projects = useStore((s) => s.projects)
  const visible = useStore(selectVisible)
  const select = useStore((s) => s.select)
  const themePref = useStore((s) => s.theme)
  const effective = useEffectiveTheme(themePref)
  const isMobile = useIsMobile()

  const [view, setView] = useState<ViewMode>('list')
  const [navOpen, setNavOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editor, setEditor] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
  }, [effective])

  const openDetail = useCallback(
    (id: string) => {
      select(id)
      setDetailId(id)
    },
    [select],
  )
  const openNew = useCallback(() => {
    setDetailId(null)
    setEditor({ open: true, id: null })
  }, [])
  const openEdit = useCallback((id: string) => {
    setDetailId(null)
    setEditor({ open: true, id })
  }, [])
  const closeEditor = useCallback(() => setEditor({ open: false, id: null }), [])

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

  const byId = (id: string | null) =>
    id ? (projects.find((p) => p.id === id) ?? null) : null
  const editingProject = editor.open ? byId(editor.id) : null
  const detailProject = byId(detailId)

  return (
    <div className="app">
      <TitleBar count={projects.length} onMenu={() => setNavOpen(true)} />
      <div className="body">
        {isMobile && navOpen && (
          <div className="nav-scrim" onClick={() => setNavOpen(false)} />
        )}
        <Sidebar projects={projects} open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="main">
          <Toolbar view={view} onView={setView} onNew={openNew} />
          <div className="content">
            {view === 'map' ? (
              <ProjectMap projects={visible} theme={effective} onEdit={openDetail} />
            ) : isMobile ? (
              <ProjectCards projects={visible} onOpen={openDetail} />
            ) : (
              <ProjectTable projects={visible} onOpen={openDetail} onEdit={openEdit} />
            )}
          </div>
        </main>
      </div>

      {detailProject && !editor.open && (
        <ProjectDetail
          project={detailProject}
          onEdit={openEdit}
          onClose={() => setDetailId(null)}
        />
      )}

      {editor.open && <ProjectEditor project={editingProject} onClose={closeEditor} />}
    </div>
  )
}
