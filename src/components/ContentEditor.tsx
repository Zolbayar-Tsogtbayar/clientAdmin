'use client'
import { useState, useEffect } from 'react'
import { Save, Loader2, Image as ImageIcon, Link, AlignLeft, Type, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
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
  const showPlaceholder = el.type === 'input'
  const showImageUrl = el.type === 'image'
  const showDims = ['image', 'card', 'section', 'divider'].includes(el.type)
  const showBg = ['button', 'badge', 'card', 'section', 'input'].includes(el.type)
  const showRadius = ['button', 'badge', 'card', 'section', 'input'].includes(el.type)
  const showAlign = el.type === 'text' || el.type === 'menu'
  const showHref = ['text', 'button', 'image', 'card', 'badge'].includes(el.type)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm leading-none">{ELEMENT_ICONS[el.type as FreeElType] ?? '·'}</span>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-1">{el.label}</p>
        <span className="text-[9px] text-slate-400 font-mono">{el.type}</span>
      </div>
      <input
        value={el.label}
        onChange={e => onChange({ label: e.target.value })}
        placeholder="Нэр"
        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
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
          value={el.src || ''}
          onChange={e => onChange({ src: e.target.value })}
          placeholder="Зургийн URL (src)"
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
        />
      )}
      {showBg && (
        <label className="text-[9px] text-slate-500 block">
          Арын өнгө
          <input
            type="text"
            value={el.bg || ''}
            onChange={e => onChange({ bg: e.target.value })}
            className="mt-0.5 w-full text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-mono"
          />
        </label>
      )}
      {(showValue || el.type === 'divider' || el.type === 'menu') && (
        <label className="text-[9px] text-slate-500 block">
          Өнгө
          <input
            type="text"
            value={el.color || ''}
            onChange={e => onChange({ color: e.target.value })}
            className="mt-0.5 w-full text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-mono"
          />
        </label>
      )}
      {showRadius && (
        <label className="text-[9px] text-slate-500 block">
          Радиус (px)
          <input
            type="number"
            value={el.radius ?? ''}
            onChange={e => onChange({ radius: e.target.value === '' ? undefined : Number(e.target.value) })}
            className="mt-0.5 w-full text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
          />
        </label>
      )}
      {(showValue || el.type === 'menu') && (
        <label className="text-[9px] text-slate-500 block">
          Фонтын хэмжээ
          <input
            type="number"
            value={el.size ?? ''}
            onChange={e => onChange({ size: e.target.value === '' ? undefined : Number(e.target.value) })}
            className="mt-0.5 w-full text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
          />
        </label>
      )}
      {showDims && (
        <label className="text-[9px] text-slate-500 block">
          Өндөр (px) / өргөн
          <div className="flex gap-1 mt-0.5">
            <input
              type="number"
              value={el.height ?? ''}
              onChange={e => onChange({ height: e.target.value === '' ? undefined : Number(e.target.value) })}
              className="w-1/2 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
              placeholder="h"
            />
            <input
              type="text"
              value={el.width || ''}
              onChange={e => onChange({ width: e.target.value })}
              className="w-1/2 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-mono"
              placeholder="100%"
            />
          </div>
        </label>
      )}
      {showAlign && (
        <label className="text-[9px] text-slate-500 block">
          Тэгшитгэл
          <select
            value={el.align || 'left'}
            onChange={e => onChange({ align: e.target.value })}
            className="mt-0.5 w-full text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
          >
            <option value="left">Зүүн</option>
            <option value="center">Төв</option>
            <option value="right">Баруун</option>
          </select>
        </label>
      )}
      {showHref && (
        <input
          value={el.href || ''}
          onChange={e => onChange({ href: e.target.value })}
          placeholder="/about эсвэл https://…"
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-mono"
        />
      )}
      {el.type === 'menu' && (
        <p className="text-[9px] text-slate-400 leading-snug">
          Цэсийн холбоосуудыг Superadmin Inspector-оос нэмж тохируулна. Энд зөвхөн хэмжээ/өнгө.
        </p>
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
  const [showPicker, setShowPicker] = useState(false)

  const add = (t: FreeElType) => {
    const base = ELEMENT_DEFAULTS[t]
    const id = `el-${Date.now()}`
    const el: FreeEl = { id, type: t, ...base, label: String(base.label || t) }
    onChange([...elements, el])
    setShowPicker(false)
  }

  const move = (index: number, dir: 'up' | 'down') => {
    const j = dir === 'up' ? index - 1 : index + 1
    if (j < 0 || j >= elements.length) return
    const next = [...elements]
    ;[next[index], next[j]] = [next[j], next[index]]
    onChange(next)
  }

  const remove = (id: string) => onChange(elements.filter(e => e.id !== id))

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Нэмэлт элементүүд</p>
      {elements.map((el, i) => (
        <div key={el.id} className="space-y-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Дээш"
              onClick={() => move(i, 'up')}
              disabled={i === 0}
              className="p-1 rounded border border-slate-200 text-slate-500 disabled:opacity-30"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              title="Доош"
              onClick={() => move(i, 'down')}
              disabled={i === elements.length - 1}
              className="p-1 rounded border border-slate-200 text-slate-500 disabled:opacity-30"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              title="Устгах"
              onClick={() => remove(el.id)}
              className="p-1 rounded border border-red-100 text-red-500 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <FreeElContent el={el} onChange={patch => onChange(elements.map(e => (e.id === el.id ? { ...e, ...patch } : e)))} />
        </div>
      ))}

      {showPicker ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-2 px-1">Элемент нэмэх</p>
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
            {ELEMENT_TYPES.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => add(type)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-700 transition-colors"
              >
                <span className="text-base leading-none">{ELEMENT_ICONS[type]}</span>
                <span className="text-[9px] font-bold text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="mt-1.5 w-full text-[10px] text-slate-500 hover:text-slate-700"
          >
            Хаах
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Элемент нэмэх
        </button>
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
