'use client'
import { useState, useEffect } from 'react'
import { Save, Loader2, Image as ImageIcon, Link, AlignLeft, Type, Plus, Trash2, ChevronUp, ChevronDown, Upload } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { api, type ComponentRecord } from '@/lib/api'

// ── Field definitions per component type ─────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'url' | 'image' | 'items'

interface FieldDef {
  key: string
  label: string
  type: FieldType
  placeholder?: string
}

const CONTENT_FIELDS: Record<string, FieldDef[]> = {
  header: [
    { key: 'brandName',  label: 'Брэнд / Лого нэр',     type: 'text',    placeholder: 'MyBrand' },
    { key: 'ctaText',    label: 'CTA товчны текст',       type: 'text',    placeholder: 'Холбоо барих' },
    { key: 'ctaUrl',     label: 'CTA товчны холбоос',     type: 'url',     placeholder: 'https://...' },
  ],
  hero: [
    { key: 'title',            label: 'Гарчиг',                 type: 'text',     placeholder: 'Баатарлаг гарчиг бичнэ' },
    { key: 'subtitle',         label: 'Дэд гарчиг / Тайлбар',  type: 'textarea', placeholder: 'Богино тайлбар...' },
    { key: 'primaryBtnText',   label: 'Үндсэн товч',            type: 'text',     placeholder: 'Эхлэх' },
    { key: 'primaryBtnUrl',    label: 'Үндсэн товч холбоос',    type: 'url',      placeholder: 'https://...' },
    { key: 'secondaryBtnText', label: 'Хоёрдогч товч',          type: 'text',     placeholder: 'Дэлгэрэнгүй' },
    { key: 'secondaryBtnUrl',  label: 'Хоёрдогч товч холбоос',  type: 'url',      placeholder: 'https://...' },
    { key: 'imageUrl',         label: 'Зургийн URL',            type: 'image',    placeholder: '.jpg/.png эсвэл unsplash.com/photos/... (шууд зураг биш хуудас)' },
  ],
  about: [
    { key: 'title',       label: 'Гарчиг',          type: 'text',     placeholder: 'Бидний тухай' },
    { key: 'description', label: 'Тайлбар',          type: 'textarea', placeholder: 'Компанийн товч танилцуулга...' },
    { key: 'btnText',     label: 'Товчны текст',     type: 'text',     placeholder: 'Дэлгэрэнгүй' },
    { key: 'btnUrl',      label: 'Товчны холбоос',   type: 'url',      placeholder: 'https://...' },
    { key: 'imageUrl',    label: 'Зургийн URL',      type: 'image',    placeholder: '.jpg/.png эсвэл unsplash.com/photos/...' },
  ],
  services: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text',     placeholder: 'Манай үйлчилгээ' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Богино тайлбар...' },
    { key: 'items',    label: 'Үйлчилгээний жагсаалт (Картууд)', type: 'items' },
  ],
  features: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text',     placeholder: 'Онцлог давуу талууд' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Богино тайлбар...' },
    { key: 'items',    label: 'Онцлох жагсаалт', type: 'items' },
  ],
  products: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text', placeholder: 'Бүтээгдэхүүн' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Богино тайлбар...' },
    { key: 'items',    label: 'Бүтээгдэхүүний жагсаалт', type: 'items' },
  ],
  pricing: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text',     placeholder: 'Үнийн санал' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Тохиромжтой багцаа сонгоно уу' },
    { key: 'items',    label: 'Багцууд', type: 'items' },
  ],
  clients: [
    { key: 'title', label: 'Хэсгийн гарчиг', type: 'text', placeholder: 'Бидний харилцагчид' },
    { key: 'items', label: 'Харилцагчдын жагсаалт', type: 'items' },
  ],
  promo: [
    { key: 'title',   label: 'Гарчиг',         type: 'text',     placeholder: 'Промо мессеж' },
    { key: 'subtitle',label: 'Дэд гарчиг',     type: 'textarea', placeholder: 'Нэмэлт тайлбар...' },
    { key: 'btnText', label: 'Товчны текст',    type: 'text',     placeholder: 'Одоо авах' },
    { key: 'btnUrl',  label: 'Товчны холбоос',  type: 'url',      placeholder: 'https://...' },
  ],
  contact: [
    { key: 'title',   label: 'Хэсгийн гарчиг', type: 'text',     placeholder: 'Холбоо барих' },
    { key: 'email',   label: 'И-мэйл хаяг',    type: 'text',     placeholder: 'info@company.mn' },
    { key: 'phone',   label: 'Утасны дугаар',   type: 'text',     placeholder: '+976 9900 0000' },
    { key: 'address', label: 'Хаяг',            type: 'textarea', placeholder: 'Улаанбаатар хот...' },
  ],
  footer: [
    { key: 'brandName',  label: 'Брэнд / Лого нэр', type: 'text',     placeholder: 'MyBrand' },
    { key: 'copyright',  label: 'Copyright текст',   type: 'text',     placeholder: '© 2025 MyBrand. All rights reserved.' },
  ],
}

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  text:     <Type className="w-3 h-3" />,
  textarea: <AlignLeft className="w-3 h-3" />,
  url:      <Link className="w-3 h-3" />,
  image:    <ImageIcon className="w-3 h-3" />,
  items:    <AlignLeft className="w-3 h-3" />,
}

// ── Free elements (Superadmin Inspector parity) ───────────────────────────────

type FreeElType =
  | 'text'
  | 'button'
  | 'image'
  | 'section'
  | 'card'
  | 'input'
  | 'divider'
  | 'badge'
  | 'menu'

interface FreeEl {
  id: string
  type: string
  label: string
  value?: string
  placeholder?: string
  src?: string
  color?: string
  bg?: string
  radius?: number
  size?: number
  width?: string
  height?: number
  align?: string
  href?: string
}

const ELEMENT_TYPES: { type: FreeElType; label: string }[] = [
  { type: 'text', label: 'Текст' },
  { type: 'button', label: 'Товч' },
  { type: 'input', label: 'Оруулах' },
  { type: 'image', label: 'Зураг' },
  { type: 'card', label: 'Карт' },
  { type: 'section', label: 'Секц' },
  { type: 'divider', label: 'Зааглагч' },
  { type: 'badge', label: 'Таг' },
  { type: 'menu', label: 'Цэс' },
]

const ELEMENT_ICONS: Record<FreeElType, string> = {
  text: 'T',
  button: '⬜',
  image: '🖼',
  section: '▤',
  card: '🃏',
  input: '✏',
  divider: '─',
  badge: '🏷',
  menu: '☰',
}

const ELEMENT_DEFAULTS: Record<FreeElType, Partial<FreeEl>> = {
  text: { label: 'Текст', value: 'Текст энд...', color: '#1e293b', size: 16, align: 'left' },
  button: { label: 'Товч', value: 'Товч', color: '#ffffff', bg: '#6366f1', radius: 10, size: 14 },
  image: { label: 'Зураг', width: '100%', height: 200 },
  section: { label: 'Секц', bg: '#f8fafc', height: 120 },
  card: { label: 'Карт', bg: '#ffffff', radius: 12, height: 160 },
  input: { label: 'Оруулах талбар', placeholder: 'Энд бичнэ...', bg: '#f1f5f9', radius: 8 },
  divider: { label: 'Зааглагч', color: '#e2e8f0', height: 1 },
  badge: { label: 'Таг', value: 'Шинэ', color: '#ffffff', bg: '#6366f1', radius: 999, size: 11 },
  menu: { label: 'Цэс', size: 14, align: 'center', color: '#1e293b' },
}

function FreeElContent({ el, onChange }: { el: FreeEl; onChange: (patch: Partial<FreeEl>) => void }) {
  const showValue = ['text', 'button', 'badge'].includes(el.type)
  const showImageUrl = el.type === 'image'
  const showHref = ['text', 'button', 'image', 'card', 'badge'].includes(el.type)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm leading-none">{ELEMENT_ICONS[el.type as FreeElType] ?? '·'}</span>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-1">{el.label}</p>
        <span className="text-[9px] text-slate-400 font-mono">{el.type}</span>
      </div>
      {showValue && (
        <input
          value={el.value || ''}
          onChange={e => onChange({ value: e.target.value })}
          placeholder={`${el.label} текст...`}
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      )}
      {showImageUrl && (
        <input
          value={el.src || ''}
          onChange={e => onChange({ src: e.target.value })}
          placeholder="Зургийн URL (src)"
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
        />
      )}
      {showHref && (
        <input
          value={el.href || ''}
          onChange={e => onChange({ href: e.target.value })}
          placeholder="/about эсвэл https://…"
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-mono"
        />
      )}
    </div>
  )
}

function ImageUploadField({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  const [uploading, setUploading] = useState(false)
  const { accessToken } = useAuthStore()
  const { selectedProject } = useProjectStore()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !accessToken || !selectedProject) return

    setUploading(true)
    try {
      const data = await api.uploadImage(accessToken, selectedProject, file)
      if (data.url) {
        onChange(data.url)
      } else {
        alert('Upload failed')
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Upload error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <ImageIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'https://...'}
          className="w-full pl-9 pr-20 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
        />
        <label className="absolute right-1 top-1 bottom-1 px-3 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors text-[10px] font-bold uppercase tracking-wider">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          <span>{uploading ? '...' : 'Upload'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      {value && (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button 
            onClick={() => onChange('')}
            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-red-500 rounded-md shadow-sm transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

function FreeElementsPanel({
  elements,
  onChange,
}: {
  elements: FreeEl[]
  onChange: (els: FreeEl[]) => void
}) {
  if (elements.length === 0) return null

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Нэмэлт элементүүд (Засварлах)</p>
      {elements.map((el) => (
        <FreeElContent 
          key={el.id} 
          el={el} 
          onChange={patch => onChange(elements.map(e => (e.id === el.id ? { ...e, ...patch } : e)))} 
        />
      ))}
    </div>
  )
}

// ── Main ContentEditor ────────────────────────────────────────────────────────

export interface SavePayload {
  textFields: Record<string, any>
  imageFields: Record<string, string>   // key → URL (single-image props like imageUrl)
  newProps: Record<string, unknown>
}

interface Props {
  block: ComponentRecord
  onSave: (instanceId: string, payload: SavePayload) => Promise<void>
  isSaving: boolean
}

export function ContentEditor({ block, onSave, isSaving }: Props) {
  const type = block.componentType
  const fields = CONTENT_FIELDS[type] ?? []
  const [values, setValues] = useState<Record<string, string>>({})
  const [itemArrays, setItemArrays] = useState<Record<string, any[]>>({})
  const [elements, setElements] = useState<FreeEl[]>([])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const p: any = block.props || {}
    const init: Record<string, string> = {}
    const arrays: Record<string, any[]> = {}
    for (const f of fields) {
      if (f.type === 'items') {
        arrays[f.key] = Array.isArray(p[f.key]) ? p[f.key] : []
      } else {
        init[f.key] = String(p[f.key] ?? '')
      }
    }
    setValues(init)
    setItemArrays(arrays)
    setElements((p._elements as FreeEl[]) || [])
    setDirty(false)
  }, [block.instanceId])

  const set = (key: string, val: string) => {
    setValues(v => ({ ...v, [key]: val }))
    setDirty(true)
  }

  const setItemArray = (key: string, arr: any[]) => {
    setItemArrays(v => ({ ...v, [key]: arr }))
    setDirty(true)
  }

  const updateEl = (id: string, patch: Partial<FreeEl>) => {
    setElements(els => els.map(e => e.id === id ? { ...e, ...patch } : e))
    setDirty(true)
  }

  const handleSave = async () => {
    const textFields: Record<string, any> = {}
    const imageFields: Record<string, string> = {}
    for (const f of fields) {
      if (f.type === 'items') {
        textFields[f.key] = itemArrays[f.key] || []
      } else {
        const v = values[f.key] ?? ''
        if (!v.trim()) continue
        textFields[f.key] = v
      }
    }
    const newProps = { ...(block.props || {}), ...textFields, ...imageFields, _elements: elements }
    await onSave(block.instanceId, { textFields, imageFields, newProps })
    setDirty(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 shrink-0 bg-slate-50">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-indigo-600">{type}</p>
          <p className="text-[10px] text-slate-400 truncate">{block.pageRoute}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !dirty}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold transition-all disabled:opacity-40 hover:bg-indigo-700"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Хадгалах
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {fields.length === 0 && elements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <AlignLeft className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm text-slate-500">Үндсэн талбар байхгүй</p>
            <p className="text-xs mt-1 text-slate-400 text-center px-2">Доороос &quot;Элемент нэмэх&quot; эсвэл Superadmin-аас загвар оруулна уу</p>
          </div>
        )}

        {/* Semantic content fields */}
        {fields.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Үндсэн контент</p>
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-0.5">
                  <span className="text-indigo-400">{FIELD_ICONS[f.type] || <Type className="w-3.5 h-3.5" />}</span>
                  {f.label}
                </label>
                {f.type === 'items' ? (
                  <div className="space-y-2 border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
                    {(itemArrays[f.key] || []).map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-2 shadow-sm relative group">
                        <button
                          onClick={() => {
                            const arr = [...(itemArrays[f.key] || [])]; arr.splice(idx, 1); setItemArray(f.key, arr)
                          }}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <input
                          value={item.title || ''}
                          onChange={e => {
                            const arr = [...(itemArrays[f.key] || [])]; arr[idx] = {...arr[idx], title: e.target.value}; setItemArray(f.key, arr)
                          }}
                          placeholder="Гарчиг"
                          className="w-full border-b border-slate-100 pb-1 focus:border-indigo-400 focus:outline-none placeholder:text-slate-300 font-bold"
                        />
                        <textarea
                          value={item.description || ''}
                          onChange={e => {
                            const arr = [...(itemArrays[f.key] || [])]; arr[idx] = {...arr[idx], description: e.target.value}; setItemArray(f.key, arr)
                          }}
                          placeholder="Тайлбар..."
                          rows={2}
                          className="w-full resize-none pt-1 focus:outline-none placeholder:text-slate-300"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const arr = [...(itemArrays[f.key] || []), { title: '', description: '' }]; setItemArray(f.key, arr)
                      }}
                      className="flex items-center justify-center gap-1 w-full py-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-lg border border-indigo-100 border-dashed"
                    >
                      <Plus className="w-3 h-3" /> Карт нэмэх
                    </button>
                  </div>
                ) : f.type === 'image' ? (
                  <ImageUploadField 
                    value={values[f.key] ?? ''} 
                    onChange={val => set(f.key, val)} 
                    placeholder={f.placeholder}
                  />
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={values[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                  />
                ) : (
                  <input
                    type={f.type === 'url' ? 'url' : 'text'}
                    value={values[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={`w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${f.type === 'url' ? 'font-mono' : ''}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <FreeElementsPanel
          elements={elements}
          onChange={els => {
            setElements(els)
            setDirty(true)
          }}
        />

        {dirty && (
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
