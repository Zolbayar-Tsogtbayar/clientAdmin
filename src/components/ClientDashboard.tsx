'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Layers, FileText, ChevronDown, MousePointer2,
  LogOut, RefreshCw, Loader2, Monitor, Tablet, Smartphone,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { api, type ComponentRecord, type ProjectSummary } from '@/lib/api'
import { BlockPreview } from './BlockPreview'
import { ContentEditor, type SavePayload } from './ContentEditor'

type ViewMode = 'desktop' | 'tablet' | 'mobile'
const VIEW_WIDTHS: Record<ViewMode, string> = { desktop: '100%', tablet: '768px', mobile: '390px' }

const COMPONENT_LABELS: Record<string, string> = {
  header: 'Толгой', footer: 'Хөл', hero: 'Нүүр секц', about: 'Тухай',
  services: 'Үйлчилгээ', features: 'Онцлог', products: 'Бүтээгдэхүүн',
  pricing: 'Үнийн санал', clients: 'Харилцагчид', promo: 'Промо банер', contact: 'Холбоо барих',
}

export default function ClientDashboard() {
  const { accessToken, user, clearSession } = useAuthStore()
  const { selectedProject, setSelectedProject } = useProjectStore()

  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [pages, setPages] = useState<{ route: string; title?: string }[]>([])
  const [activePage, setActivePage] = useState('/')
  const [blocks, setBlocks] = useState<ComponentRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showProjectMenu, setShowProjectMenu] = useState(false)

  const selectedBlock = blocks.find(b => b.instanceId === selectedId) ?? null

  // ── Load projects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return
    api.listProjects(accessToken)
      .then(r => setProjects(r.projects ?? []))
      .catch(() => {})
  }, [accessToken])

  // ── Load design (pages) when project changes ──────────────────────────────
  useEffect(() => {
    if (!selectedProject) return
    api.getDesign(selectedProject)
      .then(r => {
        const pg = r.design?.pages ?? []
        setPages(pg)
        if (pg.length > 0) setActivePage(pg[0].route)
      })
      .catch(() => setPages([{ route: '/' }]))
  }, [selectedProject])

  // ── Load blocks when project or page changes ──────────────────────────────
  const loadBlocks = useCallback(async () => {
    if (!accessToken || !selectedProject) return
    setIsLoading(true)
    try {
      const res = await api.listBlocks(accessToken, selectedProject, activePage)
      const sorted = [...(res.components ?? [])].sort((a, b) => a.order - b.order)
      setBlocks(sorted)
      setSelectedId(null)
    } catch {
      toast.error('Блок ачааллахад алдаа гарлаа')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, selectedProject, activePage])

  useEffect(() => { loadBlocks() }, [loadBlocks])

  // ── Save content ──────────────────────────────────────────────────────────
  const handleSave = async (instanceId: string, { textFields, imageFields, newProps }: SavePayload) => {
    if (!accessToken || !selectedProject) return
    setIsSaving(true)
    try {
      const ops: Promise<unknown>[] = []

      if (Object.keys(textFields).length > 0) {
        ops.push(api.saveBlockText(accessToken, selectedProject, instanceId, textFields))
      }

      // Each single-image prop (e.g. imageUrl) is sent as a one-item replace to /images
      for (const [, url] of Object.entries(imageFields)) {
        if (url) ops.push(api.saveBlockImages(accessToken, selectedProject, instanceId, [{ url }], 'replace'))
      }

      await Promise.all(ops)
      setBlocks(prev => prev.map(b => b.instanceId === instanceId ? { ...b, props: newProps } : b))
      toast.success('Контент хадгалагдлаа!')
    } catch (e: any) {
      toast.error(`Хадгалахад алдаа: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    if (!accessToken) return
    try { await api.logout(accessToken, useAuthStore.getState().refreshToken) } catch {}
    clearSession()
  }

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] text-slate-900 overflow-hidden">

      {/* ── Topbar ── */}
      <div className="h-14 flex items-center justify-between px-4 shrink-0 bg-white border-b border-slate-200 shadow-sm z-20">
        {/* Brand + Project selector */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xs font-black text-white">C</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-slate-800">Клиент Админ</h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 text-slate-400">Content CMS</p>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Project picker */}
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              {selectedProject ?? 'Төсөл сонгох'}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showProjectMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                {projects.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">Төсөл олдсонгүй</p>
                ) : (
                  projects.map(p => (
                    <button
                      key={p.name}
                      onClick={() => { setSelectedProject(p.name); setShowProjectMenu(false) }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${selectedProject === p.name ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'}`}
                    >
                      {p.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Viewport */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
          {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === mode ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-2">
          {user && <span className="text-xs text-slate-500 hidden sm:block">{user.email}</span>}
          <button
            onClick={loadBlocks}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Дахин ачаалах"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 text-xs font-bold transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Гарах
          </button>
        </div>
      </div>

      {/* ── Main 3-panel ── */}
      {!selectedProject ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Layers className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-700">Төсөл сонгоогүй байна</h2>
            <p className="mt-2 text-slate-500 text-sm">Дээрх цэснээс төслөө сонгоно уу.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left sidebar: pages ── */}
          <div className="w-52 flex flex-col shrink-0 bg-white border-r border-slate-200 z-10">
            <div className="p-3 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Хуудсууд</p>
              <div className="space-y-0.5">
                {(pages.length > 0 ? pages : [{ route: '/', title: 'Нүүр' }]).map(pg => (
                  <button
                    key={pg.route}
                    onClick={() => { setActivePage(pg.route); setSelectedId(null) }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${activePage === pg.route ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{pg.title || pg.route}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Block list */}
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Блокууд</p>
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
              ) : blocks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Блок байхгүй</p>
              ) : (
                <div className="space-y-0.5">
                  {blocks.map(b => (
                    <button
                      key={b.instanceId}
                      onClick={() => setSelectedId(b.instanceId)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${selectedId === b.instanceId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${selectedId === b.instanceId ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                      <span className="truncate">{COMPONENT_LABELS[b.componentType] ?? b.componentType}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Canvas ── */}
          <div
            className="flex-1 overflow-auto p-6 bg-[#e8edf3]"
            onClick={() => setSelectedId(null)}
          >
            <div className="flex justify-center mb-3">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm bg-white border-slate-200 text-slate-400">
                {viewMode === 'desktop' ? 'Компьютер — Бүтэн өргөн' : viewMode === 'tablet' ? 'Таблет — 768px' : 'Гар утас — 390px'}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium">Ачааллаж байна...</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto transition-all duration-300" style={{ maxWidth: VIEW_WIDTHS[viewMode] }} onClick={e => e.stopPropagation()}>
                <div className="bg-white min-h-[600px] shadow-xl ring-1 ring-black/5 rounded-sm overflow-hidden">
                  {blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-slate-300">
                      <MousePointer2 className="w-12 h-12 mb-4 opacity-40" />
                      <p className="font-semibold text-lg text-slate-400">Хуудас хоосон байна</p>
                      <p className="text-sm mt-1 text-slate-400">Super Admin-аар загвар эхлээд тохируулна уу</p>
                    </div>
                  ) : (
                    blocks.map(block => (
                      <div
                        key={block.instanceId}
                        className="relative group cursor-pointer"
                        onClick={e => { e.stopPropagation(); setSelectedId(block.instanceId) }}
                      >
                        <BlockPreview block={block} isSelected={selectedId === block.instanceId} />

                        {/* Hover label */}
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white pointer-events-none transition-opacity ${selectedId === block.instanceId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {COMPONENT_LABELS[block.componentType] ?? block.componentType}
                        </div>

                        {/* Edit hint */}
                        <div className={`absolute inset-0 border-2 transition-all pointer-events-none ${selectedId === block.instanceId ? 'border-indigo-500' : 'border-transparent group-hover:border-indigo-200'}`} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar: ContentEditor ── */}
          <div className="w-72 flex flex-col shrink-0 bg-white border-l border-slate-200 z-10">
            {selectedBlock ? (
              <ContentEditor
                block={selectedBlock}
                onSave={(id, payload) => handleSave(id, payload)}
                isSaving={isSaving}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                <MousePointer2 className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm font-medium text-slate-500">Блок сонгоно уу</p>
                <p className="text-xs mt-1 text-slate-400">Canvas дээрх блок дарж контентийг засна уу</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
