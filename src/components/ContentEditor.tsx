'use client'
import { useState, useEffect } from 'react'
import { Save, Loader2, Image as ImageIcon, Link, AlignLeft, Type } from 'lucide-react'
import type { ComponentRecord } from '@/lib/api'

// ── Field definitions per component type ─────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'url' | 'image'

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
    { key: 'imageUrl',         label: 'Зургийн URL',            type: 'image',    placeholder: 'https://...' },
  ],
  about: [
    { key: 'title',       label: 'Гарчиг',          type: 'text',     placeholder: 'Бидний тухай' },
    { key: 'description', label: 'Тайлбар',          type: 'textarea', placeholder: 'Компанийн товч танилцуулга...' },
    { key: 'btnText',     label: 'Товчны текст',     type: 'text',     placeholder: 'Дэлгэрэнгүй' },
    { key: 'btnUrl',      label: 'Товчны холбоос',   type: 'url',      placeholder: 'https://...' },
    { key: 'imageUrl',    label: 'Зургийн URL',      type: 'image',    placeholder: 'https://...' },
  ],
  services: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text',     placeholder: 'Манай үйлчилгээ' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Богино тайлбар...' },
  ],
  features: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text',     placeholder: 'Онцлог давуу талууд' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Богино тайлбар...' },
  ],
  products: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text', placeholder: 'Бүтээгдэхүүн' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Богино тайлбар...' },
  ],
  pricing: [
    { key: 'title',    label: 'Хэсгийн гарчиг', type: 'text',     placeholder: 'Үнийн санал' },
    { key: 'subtitle', label: 'Дэд гарчиг',      type: 'textarea', placeholder: 'Тохиромжтой багцаа сонгоно уу' },
  ],
  clients: [
    { key: 'title', label: 'Хэсгийн гарчиг', type: 'text', placeholder: 'Бидний харилцагчид' },
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
}

// ── FreeElement content editor ────────────────────────────────────────────────

interface FreeEl { id: string; type: string; label: string; value?: string; placeholder?: string }

function FreeElContent({ el, onChange }: { el: FreeEl; onChange: (patch: Partial<FreeEl>) => void }) {
  const showValue = ['text', 'button', 'badge'].includes(el.type)
  const showPlaceholder = el.type === 'input'
  const showImageUrl = el.type === 'image'

  if (!showValue && !showPlaceholder && !showImageUrl) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{el.label}</p>
      {showValue && (
        <input
          value={el.value || ''}
          onChange={e => onChange({ value: e.target.value })}
          placeholder={`${el.label} текст...`}
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      )}
      {showPlaceholder && (
        <input
          value={el.placeholder || ''}
          onChange={e => onChange({ placeholder: e.target.value })}
          placeholder="Placeholder текст..."
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      )}
      {showImageUrl && (
        <input
          value={(el as any).src || ''}
          onChange={e => onChange({ ...(el as any), src: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
        />
      )}
    </div>
  )
}

// ── Main ContentEditor ────────────────────────────────────────────────────────

export interface SavePayload {
  textFields: Record<string, string | number>
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
  const [elements, setElements] = useState<FreeEl[]>([])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const p: any = block.props || {}
    const init: Record<string, string> = {}
    for (const f of fields) init[f.key] = String(p[f.key] ?? '')
    setValues(init)
    setElements((p._elements as FreeEl[]) || [])
    setDirty(false)
  }, [block.instanceId])

  const set = (key: string, val: string) => {
    setValues(v => ({ ...v, [key]: val }))
    setDirty(true)
  }

  const updateEl = (id: string, patch: Partial<FreeEl>) => {
    setElements(els => els.map(e => e.id === id ? { ...e, ...patch } : e))
    setDirty(true)
  }

  const handleSave = async () => {
    const textFields: Record<string, string | number> = {}
    const imageFields: Record<string, string> = {}
    for (const f of fields) {
      const v = values[f.key] ?? ''
      if (!v.trim()) continue
      if (f.type === 'image') imageFields[f.key] = v
      else textFields[f.key] = v
    }
    const newProps = { ...(block.props || {}), ...textFields, ...imageFields, _elements: elements }
    await onSave(block.instanceId, { textFields, imageFields, newProps })
    setDirty(false)
  }

  const hasElements = elements.some(e => ['text','button','badge','input','image'].includes(e.type))

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
        {fields.length === 0 && !hasElements && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <AlignLeft className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm text-slate-500">Контент талбар байхгүй</p>
            <p className="text-xs mt-1 text-slate-400">Энэ бүрэлдэхүүн текст засах боломжгүй</p>
          </div>
        )}

        {/* Semantic content fields */}
        {fields.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Үндсэн контент</p>
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">{FIELD_ICONS[f.type]}</span>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{f.label}</label>
                </div>
                {f.type === 'textarea' ? (
                  <textarea
                    value={values[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                  />
                ) : (
                  <input
                    type={f.type === 'url' || f.type === 'image' ? 'url' : 'text'}
                    value={values[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={`w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${f.type === 'url' || f.type === 'image' ? 'font-mono' : ''}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Free elements content */}
        {hasElements && (
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 pt-2 border-t border-slate-100">Нэмэлт элементүүд</p>
            {elements.map(el => (
              <FreeElContent key={el.id} el={el} onChange={patch => updateEl(el.id, patch)} />
            ))}
          </div>
        )}

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
