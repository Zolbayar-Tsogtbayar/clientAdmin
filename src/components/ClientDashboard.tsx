'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Layers, FileText, ChevronDown, MousePointer2,
  LogOut, RefreshCw, Loader2, Monitor, Tablet, Smartphone,
  LayoutTemplate, Globe, Braces,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { api, type ComponentRecord, type ProjectSummary } from '@/lib/api'
import { normalizeLiveSiteBase } from '@/lib/livePreviewUrl'
import {
  readLiveSiteBaseOverride,
  writeLiveSiteBaseOverride,
  readUseDynamicProject,
  writeUseDynamicProject,
  readPreviewToken,
  writePreviewToken,
  readIframeLiveEdit,
  writeIframeLiveEdit,
} from '@/lib/livePreviewPrefs'
import { BlockPreview } from './BlockPreview'
import { ContentEditor, type SavePayload } from './ContentEditor'
import { LiveSitePreview } from './LiveSitePreview'

type ViewMode = 'desktop' | 'tablet' | 'mobile'
type CenterTab = 'canvas' | 'live' | 'json'
const VIEW_WIDTHS: Record<ViewMode, string> = { desktop: '100%', tablet: '768px', mobile: '390px' }

const COMPONENT_LABELS: Record<string, string> = {
  header: 'Толгой', footer: 'Хөл', hero: 'Нүүр секц', about: 'Тухай',
  services: 'Үйлчилгээ', features: 'Онцлог', products: 'Бүтээгдэхүүн',
  pricing: 'Үнийн санал', clients: 'Харилцагчид', promo: 'Промо банер', contact: 'Холбоо барих',
}

const CMS_LIVE_EDIT_SELECT = 'cms-live-edit-select'
const CMS_LIVE_EDIT_TEXT = 'cms-live-edit-text'

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
  const [centerTab, setCenterTab] = useState<CenterTab>('canvas')
  const [liveBaseFromDesign, setLiveBaseFromDesign] = useState<string | null>(null)
  const [liveReloadToken, setLiveReloadToken] = useState(0)
  /** User-editable origin; persisted per project. Falls back to env / design when empty. */
  const [liveBaseManual, setLiveBaseManual] = useState('')
  const [useDynamicProject, setUseDynamicProject] = useState(false)
  const [previewTokenInput, setPreviewTokenInput] = useState('')
  const [iframeLiveEdit, setIframeLiveEdit] = useState(false)

  const projectsRef = useRef(projects)
  projectsRef.current = projects

  const selectedBlock = blocks.find(b => b.instanceId === selectedId) ?? null

  const effectiveLiveBase = useMemo(
    () =>
      normalizeLiveSiteBase(liveBaseManual) ??
      normalizeLiveSiteBase(process.env.NEXT_PUBLIC_LIVE_SITE_BASE_URL) ??
      normalizeLiveSiteBase(liveBaseFromDesign),
    [liveBaseManual, liveBaseFromDesign],
  )

  const liveUrlPlaceholder = useMemo(() => {
    const envB = normalizeLiveSiteBase(process.env.NEXT_PUBLIC_LIVE_SITE_BASE_URL)
    const domB = normalizeLiveSiteBase(liveBaseFromDesign)
    if (envB) return envB
    if (domB) return domB
    const proj = projects.find(p => p.name === selectedProject)
    const raw = proj?.port
    const port =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? parseInt(raw, 10)
          : NaN
    if (selectedProject && Number.isFinite(port) && port > 0) {
      return `http://127.0.0.1:${port}`
    }
    return 'http://localhost:3000'
  }, [projects, selectedProject, liveBaseFromDesign])

  // ── Load projects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return
    api.listProjects(accessToken)
      .then(r => setProjects(r.projects ?? []))
      .catch(() => {})
  }, [accessToken])

  // ── Live preview prefs + design (pages) when project changes ─────────────
  useEffect(() => {
    if (!selectedProject) return
    setLiveBaseFromDesign(null)
    setLiveBaseManual(readLiveSiteBaseOverride(selectedProject))
    const dyn = readUseDynamicProject(selectedProject)
    setUseDynamicProject(
      dyn !== null
        ? dyn
        : process.env.NEXT_PUBLIC_CMS_TEMPLATE_DYNAMIC_PROJECT === 'true',
    )
    setPreviewTokenInput(readPreviewToken(selectedProject))
    setIframeLiveEdit(readIframeLiveEdit(selectedProject))

    const projectName = selectedProject
    api.getDesign(projectName)
      .then(r => {
        const pg = r.design?.pages ?? []
        setPages(pg)
        if (pg.length > 0) setActivePage(pg[0].route)
        const dom = r.design?.domain
        const asUrl =
          typeof dom === 'string' && /^https?:\/\//i.test(dom.trim())
            ? dom.trim()
            : null
        setLiveBaseFromDesign(asUrl)

        const saved = readLiveSiteBaseOverride(projectName)
        if (saved.trim()) return
        if (normalizeLiveSiteBase(process.env.NEXT_PUBLIC_LIVE_SITE_BASE_URL)) return
        if (normalizeLiveSiteBase(asUrl)) return

        const proj = projectsRef.current.find(p => p.name === projectName)
        const raw = proj?.port
        const port =
          typeof raw === 'number'
            ? raw
            : typeof raw === 'string'
              ? parseInt(raw, 10)
              : NaN
        if (!Number.isFinite(port) || port <= 0) return
        const guess = `http://127.0.0.1:${port}`
        setLiveBaseManual(guess)
        writeLiveSiteBaseOverride(projectName, guess)
      })
      .catch(() => {
        setPages([{ route: '/' }])
        setLiveBaseFromDesign(null)
      })
  }, [selectedProject])

  // ── If /projects arrived after design: still apply port-based URL guess ────
  useEffect(() => {
    if (!selectedProject) return
    if (readLiveSiteBaseOverride(selectedProject).trim()) return
    if (liveBaseManual.trim()) return
    if (normalizeLiveSiteBase(process.env.NEXT_PUBLIC_LIVE_SITE_BASE_URL)) return
    if (normalizeLiveSiteBase(liveBaseFromDesign)) return
    const proj = projects.find(p => p.name === selectedProject)
    const raw = proj?.port
    const port =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? parseInt(raw, 10)
          : NaN
    if (!Number.isFinite(port) || port <= 0) return
    const guess = `http://127.0.0.1:${port}`
    setLiveBaseManual(guess)
    writeLiveSiteBaseOverride(selectedProject, guess)
  }, [selectedProject, projects, liveBaseFromDesign, liveBaseManual])

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

  // ── postMessage from template iframe (inline text edit) ───────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (centerTab !== 'live' || !iframeLiveEdit || !effectiveLiveBase) return
    let templateOrigin: string
    try {
      templateOrigin = new URL(effectiveLiveBase).origin
    } catch {
      return
    }

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== templateOrigin) return
      const d = e.data as { type?: string; instanceId?: string; field?: string; value?: string }
      if (!d || typeof d !== 'object' || typeof d.type !== 'string') return

      if (d.type === CMS_LIVE_EDIT_SELECT && typeof d.instanceId === 'string') {
        setSelectedId(d.instanceId)
        return
      }

      if (
        d.type === CMS_LIVE_EDIT_TEXT &&
        typeof d.instanceId === 'string' &&
        typeof d.field === 'string' &&
        typeof d.value === 'string'
      ) {
        const token = useAuthStore.getState().accessToken
        const project = useProjectStore.getState().selectedProject
        if (!token || !project) {
          toast.error('Нэвтрээгүй эсвэл төсөл сонгоогүй')
          return
        }
        void api
          .saveBlockText(token, project, d.instanceId, { [d.field]: d.value })
          .then(() => {
            setBlocks(prev =>
              prev.map(b =>
                b.instanceId === d.instanceId
                  ? { ...b, props: { ...b.props, [d.field!]: d.value } }
                  : b,
              ),
            )
            setLiveReloadToken(t => t + 1)
            toast.success('Хадгалагдлаа')
          })
          .catch((err: Error) => toast.error(err.message || 'Хадгалахад алдаа'))
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [centerTab, iframeLiveEdit, effectiveLiveBase])

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
      setLiveReloadToken(t => t + 1)
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

        {/* Canvas / live / JSON + viewport */}
        <div className="flex flex-1 items-center justify-center gap-2 min-w-0 px-2">
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0">
            {(
              [
                ['canvas', LayoutTemplate, 'Загвар'],
                ['live', Globe, 'Сайт'],
                ['json', Braces, 'JSON'],
              ] as const
            ).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCenterTab(id)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${centerTab === id ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 shrink-0">
            {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === mode ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
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

          {/* ── Canvas / live site / JSON ── */}
          <div
            className="flex flex-1 flex-col overflow-hidden bg-[#e8edf3]"
            onClick={() => centerTab === 'canvas' && setSelectedId(null)}
          >
            <div className="flex shrink-0 justify-center px-6 pt-4 pb-2">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm bg-white border-slate-200 text-slate-400">
                {centerTab === 'json'
                  ? `Өгөгдөл — ${activePage}`
                  : viewMode === 'desktop'
                    ? 'Компьютер — Бүтэн өргөн'
                    : viewMode === 'tablet'
                      ? 'Таблет — 768px'
                      : 'Гар утас — 390px'}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-6 pt-2">
              {centerTab === 'live' && selectedProject && (
                <div className="mx-auto mb-3 max-w-3xl space-y-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Сайтын URL (clientCmsTemplate)
                    </span>
                    <input
                      type="url"
                      inputMode="url"
                      value={liveBaseManual}
                      onChange={e => setLiveBaseManual(e.target.value)}
                      onBlur={() => writeLiveSiteBaseOverride(selectedProject, liveBaseManual)}
                      placeholder={liveUrlPlaceholder}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-[11px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                    />
                    <span className="mt-1 block text-[10px] text-slate-400">
                      Хоосон үлдээвэл: таны оруулалт → env → загварын domain дараалал.
                      {liveBaseManual.trim() ? '' : ` Одоо: ${effectiveLiveBase ?? '—'}`}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={useDynamicProject}
                      onChange={e => {
                        const v = e.target.checked
                        setUseDynamicProject(v)
                        writeUseDynamicProject(selectedProject, v)
                      }}
                    />
                    <span>
                      <span className="font-semibold">Төслийг URL-д дамжуулах</span>
                      <span className="block text-[10px] font-normal text-slate-500">
                        ?project={selectedProject} — template дээр CMS_DYNAMIC_PROJECT=true. Нэг суурь, олон
                        төсөл.
                      </span>
                    </span>
                  </label>
                  {useDynamicProject && (
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Preview token (сонголттой)
                      </span>
                      <input
                        type="password"
                        autoComplete="off"
                        value={previewTokenInput}
                        onChange={e => setPreviewTokenInput(e.target.value)}
                        onBlur={() => writePreviewToken(selectedProject, previewTokenInput)}
                        placeholder="CMS_PREVIEW_TOKEN-тай ижил бол template-д"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-[11px] focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      />
                    </label>
                  )}
                  {!useDynamicProject && (
                    <p className="text-[10px] leading-snug text-slate-500">
                      Идэвхгүй бол template-ийн NEXT_PUBLIC_PROJECT_NAME сонгосон төсөлтэй таарах ёстой.
                    </p>
                  )}
                  <label className="flex cursor-pointer items-start gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={iframeLiveEdit}
                      onChange={e => {
                        const v = e.target.checked
                        setIframeLiveEdit(v)
                        writeIframeLiveEdit(selectedProject, v)
                      }}
                    />
                    <span>
                      <span className="font-semibold">Iframe-д шууд засах</span>
                      <span className="block text-[10px] font-normal text-slate-500">
                        Нэг даралт: блок сонгогдоно (баруун тал). Давхар даралт: текст засаж blur хийхэд
                        хадгална. Template: cmsLiveEdit=1 + parentOrigin (автомат), CMS_PREVIEW_TOKEN тааруулна.
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {centerTab === 'json' ? (
                <div
                  className="mx-auto max-w-4xl rounded-sm border border-slate-200 bg-slate-900 p-4 shadow-xl ring-1 ring-black/5"
                  onClick={e => e.stopPropagation()}
                >
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Хуудасны блокууд ({activePage})
                  </p>
                  <pre className="max-h-[calc(100vh-220px)] overflow-auto text-[11px] leading-relaxed text-emerald-100/95">
                    {isLoading ? '…' : JSON.stringify(blocks, null, 2)}
                  </pre>
                </div>
              ) : centerTab === 'live' ? (
                <div
                  className="mx-auto flex min-h-0 max-w-full flex-col transition-all duration-300"
                  style={{ maxWidth: VIEW_WIDTHS[viewMode] }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="min-h-0 flex-1 rounded-sm bg-white p-3 shadow-xl ring-1 ring-black/5">
                    <LiveSitePreview
                      baseUrl={effectiveLiveBase}
                      pageRoute={activePage}
                      projectName={selectedProject}
                      viewWidth="100%"
                      reloadToken={liveReloadToken}
                      useDynamicProject={useDynamicProject}
                      previewToken={previewTokenInput}
                      iframeLiveEdit={iframeLiveEdit}
                    />
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium">Ачааллаж байна...</p>
                  </div>
                </div>
              ) : (
                <div
                  className="mx-auto transition-all duration-300"
                  style={{ maxWidth: VIEW_WIDTHS[viewMode] }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="min-h-[600px] overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-black/5">
                    {blocks.length === 0 ? (
                      <div className="flex h-96 flex-col items-center justify-center text-slate-300">
                        <MousePointer2 className="mb-4 h-12 w-12 opacity-40" />
                        <p className="text-lg font-semibold text-slate-400">Хуудас хоосон байна</p>
                        <p className="mt-1 text-sm text-slate-400">Super Admin-аар загвар эхлээд тохируулна уу</p>
                      </div>
                    ) : (
                      blocks.map(block => (
                        <div
                          key={block.instanceId}
                          className="group relative cursor-pointer"
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedId(block.instanceId)
                          }}
                        >
                          <BlockPreview block={block} isSelected={selectedId === block.instanceId} />

                          <div
                            className={`pointer-events-none absolute left-2 top-2 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white transition-opacity ${selectedId === block.instanceId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          >
                            {COMPONENT_LABELS[block.componentType] ?? block.componentType}
                          </div>

                          <div
                            className={`pointer-events-none absolute inset-0 border-2 transition-all ${selectedId === block.instanceId ? 'border-indigo-500' : 'border-transparent group-hover:border-indigo-200'}`}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
