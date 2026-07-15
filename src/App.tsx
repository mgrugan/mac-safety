import { useCallback, useEffect, useState } from 'react'
import { selectVisible, useStore } from './store'
import { useEffectiveTheme, useIsMobile } from './theme'
import { Nav } from './components/Nav'
import { TopBar } from './components/TopBar'
import { ListView } from './components/ListView'
import { ProjectMap } from './components/ProjectMap'
import { ProjectDetail } from './components/ProjectDetail'
import { ProjectEditor } from './components/ProjectEditor'

export type ViewMode = 'list' | 'map'

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
  const [editor, setEditor] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
  }, [effective])

  const openDetail = useCallback((id: string) => { select(id); setDetailId(id) }, [select])
  const openNew = useCallback(() => { setDetailId(null); setEditor({ open: true, id: null }) }, [])
  const openEdit = useCallback((id: string) => { setDetailId(null); setEditor({ open: true, id }) }, [])
  const closeEditor = useCallback(() => setEditor({ open: false, id: null }), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'n') { e.preventDefault(); openNew() }
      else if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openNew])

  const byId = (id: string | null) => (id ? projects.find((p) => p.id === id) ?? null : null)
  const editingProject = editor.open ? byId(editor.id) : null
  const detailProject = byId(detailId)

  return (
    <div className="app">
      {isMobile && navOpen && <div className="nav-scrim" onClick={() => setNavOpen(false)} />}
      <Nav view={view} onView={setView} onNew={openNew} open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="main">
        <TopBar onMenu={() => setNavOpen(true)} onOpenProject={openDetail} effective={effective} />
        <div className="content">
          {view === 'map' ? (
            <ProjectMap projects={visible} theme={effective} onOpen={openDetail} />
          ) : (
            <ListView visible={visible} all={projects} isMobile={isMobile} onOpen={openDetail} onEdit={openEdit} />
          )}
        </div>
      </div>

      {detailProject && !editor.open && (
        <ProjectDetail project={detailProject} theme={effective} onEdit={openEdit} onClose={() => setDetailId(null)} />
      )}
      {editor.open && <ProjectEditor project={editingProject} theme={effective} onClose={closeEditor} />}
    </div>
  )
}
