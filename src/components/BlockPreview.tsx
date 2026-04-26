'use client'
import { Image as ImageIcon, Package } from 'lucide-react'
import type { ComponentRecord } from '@/lib/api'

function SkeletonLine({ w = '100%', h = 14, color = '#1e293b', mb = 0 }: {
  w?: string | number; h?: number; color?: string; mb?: number
}) {
  return <div style={{ width: w, height: h, background: color, opacity: 0.2, borderRadius: 4, marginBottom: mb }} />
}

interface FreeEl { id: string; type: string; label: string; value?: string; color?: string; bg?: string; radius?: number; size?: number; width?: string; height?: number; placeholder?: string; align?: string }

function FreeEls({ elements, accent }: { elements: FreeEl[]; accent: string }) {
  if (!elements?.length) return null
  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {elements.map(el => {
        if (el.type === 'text') return <div key={el.id} style={{ color: el.color || '#1e293b', fontSize: el.size || 16, textAlign: (el.align as any) || 'left', opacity: 0.85 }}>{el.value || el.label}</div>
        if (el.type === 'button') return <div key={el.id} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: el.bg || accent, color: el.color || '#fff', borderRadius: el.radius ?? 10, fontSize: el.size || 14, fontWeight: 600, padding: '10px 24px', alignSelf: 'flex-start' }}>{el.value || el.label}</div>
        if (el.type === 'input') return <div key={el.id} style={{ background: el.bg || '#f1f5f9', borderRadius: el.radius ?? 8, border: '1px solid #e2e8f0', padding: '10px 14px', fontSize: 13, color: '#94a3b8' }}>{el.placeholder || el.label}</div>
        if (el.type === 'image') return <div key={el.id} style={{ width: el.width || '100%', height: el.height || 200, background: '#e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}><ImageIcon style={{ width: 28, height: 28, opacity: 0.4, color: '#94a3b8' }} /></div>
        if (el.type === 'badge') return <div key={el.id} style={{ display: 'flex' }}><span style={{ background: el.bg || accent, color: el.color || '#fff', borderRadius: el.radius ?? 999, fontSize: el.size || 11, fontWeight: 700, padding: '3px 10px' }}>{el.value || el.label}</span></div>
        if (el.type === 'divider') return <div key={el.id} style={{ width: '100%', height: el.height || 1, background: el.color || '#e2e8f0', borderRadius: 99, margin: '4px 0' }} />
        return null
      })}
    </div>
  )
}

export function BlockPreview({ block, isSelected }: { block: ComponentRecord; isSelected: boolean }) {
  const p: any = block.props || {}
  const type = block.componentType
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#1e293b'
  const accent = p.accentColor || '#6366f1'
  const font = p.fontFamily || 'Inter'
  const px = p.paddingX ?? 48
  const py = p.paddingY ?? 60
  const border = isSelected ? '2px solid #6366f1' : '2px solid transparent'
  const elements: FreeEl[] = p._elements || []
  const wrap: React.CSSProperties = { fontFamily: font, background: bg, color: text, paddingLeft: px, paddingRight: px, paddingTop: py, paddingBottom: py, border, transition: 'border 0.15s' }
  const freeEls = <FreeEls elements={elements} accent={accent} />

  if (type === 'header') return (
    <div style={{ ...wrap, paddingTop: p.paddingY ?? 18, paddingBottom: p.paddingY ?? 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: p.borderBottom ? `1px solid ${p.borderColor || '#e2e8f0'}` : 'none', flexWrap: 'wrap', gap: 8 }}>
      {p.brandName ? <span style={{ fontWeight: 800, fontSize: 18, color: accent }}>{p.brandName}</span> : <div style={{ width: 120, height: 22, background: accent, opacity: 0.9, borderRadius: 6 }} />}
      <div style={{ display: 'flex', gap: 16 }}>{[60,50,70,90].map((w,i) => <div key={i} style={{ width: w, height: 12, background: text, opacity: 0.2, borderRadius: 3 }} />)}</div>
      {p.ctaText ? <div style={{ padding: '8px 16px', background: accent, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{p.ctaText}</div> : <div style={{ width: 90, height: 32, background: accent, borderRadius: 8, opacity: 0.85 }} />}
      {elements.length > 0 && <div style={{ width: '100%' }}>{freeEls}</div>}
    </div>
  )

  if (type === 'hero') {
    const align = p.align || 'center'
    const flexAlign = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
    return (
      <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: flexAlign, textAlign: align as any }}>
        {p.hasImage && <div style={{ width: '100%', height: 220, background: text, opacity: 0.04, borderRadius: 12, marginBottom: 28, overflow: 'hidden' }}>{p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon style={{ color: text, opacity: 0.2, width: 40, height: 40 }} /></div>}</div>}
        {p.title ? <div style={{ fontSize: p.titleSize ? p.titleSize * 0.7 : 36, fontWeight: p.titleWeight || 800, color: text, marginBottom: 12, maxWidth: 500 }}>{p.title}</div> : <SkeletonLine w={340} h={p.titleSize ? p.titleSize * 0.7 : 36} color={text} mb={12} />}
        {p.subtitle ? <div style={{ fontSize: 14, color: text, opacity: 0.6, marginBottom: 28, maxWidth: 460 }}>{p.subtitle}</div> : <><SkeletonLine w={460} h={14} color={text} mb={6} /><SkeletonLine w={380} h={14} color={text} mb={28} /></>}
        <div style={{ display: 'flex', gap: 12 }}>
          {p.primaryBtnText ? <div style={{ padding: `${p.btnPaddingY ?? 14}px ${p.btnPaddingX ?? 32}px`, background: accent, color: '#fff', borderRadius: p.btnRadius ?? 10, fontSize: 14, fontWeight: 600 }}>{p.primaryBtnText}</div> : <div style={{ width: 140, height: 46, background: accent, borderRadius: p.btnRadius ?? 10, opacity: 0.9 }} />}
          {p.secondaryBtnText ? <div style={{ padding: `${p.btnPaddingY ?? 14}px ${p.btnPaddingX ?? 32}px`, background: 'transparent', border: `2px solid ${accent}`, color: accent, borderRadius: p.btnRadius ?? 10, fontSize: 14, fontWeight: 600 }}>{p.secondaryBtnText}</div> : <div style={{ width: 120, height: 46, background: 'transparent', border: `2px solid ${accent}`, borderRadius: p.btnRadius ?? 10, opacity: 0.5 }} />}
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'about') {
    const dir = p.align === 'right' ? 'row-reverse' : 'row'
    return (
      <div style={{ ...wrap, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexDirection: dir as any }}>
          {p.hasImage && <div style={{ flex: 1, height: 260, background: text, opacity: 0.05, borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon style={{ color: text, opacity: 0.2, width: 40, height: 40 }} />}</div>}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {p.title ? <div style={{ fontSize: 28, fontWeight: 700, color: text, marginBottom: 16 }}>{p.title}</div> : <SkeletonLine w={220} h={28} color={text} mb={16} />}
            {p.description ? <div style={{ fontSize: 14, color: text, opacity: 0.65, marginBottom: 20, lineHeight: 1.6 }}>{p.description}</div> : <>{[100,95,90,80].map((w,i) => <SkeletonLine key={i} w={`${w}%`} h={11} color={text} mb={8} />)}</>}
            {p.btnText ? <div style={{ marginTop: 8, padding: '10px 24px', background: accent, color: '#fff', borderRadius: p.btnRadius ?? 10, fontSize: 14, fontWeight: 600, display: 'inline-block' }}>{p.btnText}</div> : <div style={{ marginTop: 12, width: 130, height: 40, background: accent, borderRadius: p.btnRadius ?? 10, opacity: 0.85 }} />}
          </div>
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'services' || type === 'features') {
    const cols = p.columns || 3
    return (
      <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {p.title ? <div style={{ fontSize: p.titleSize || 28, fontWeight: 700, color: text, marginBottom: 8 }}>{p.title}</div> : <SkeletonLine w={260} h={28} color={text} mb={8} />}
        {p.subtitle ? <div style={{ fontSize: 14, color: text, opacity: 0.6, marginBottom: 32 }}>{p.subtitle}</div> : <SkeletonLine w={380} h={13} color={text} mb={32} />}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 20 }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ background: p.cardBg || '#f8fafc', padding: 24, borderRadius: p.cardRadius ?? 14, display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${accent}20` }}>
              <div style={{ width: 44, height: 44, background: accent, borderRadius: 10, marginBottom: 14, opacity: 0.8 }} />
              <SkeletonLine w="65%" h={16} color={text} mb={10} />
              <SkeletonLine w="100%" h={10} color={text} mb={6} />
              <SkeletonLine w="85%" h={10} color={text} />
            </div>
          ))}
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'products') {
    const cols = p.columns || 3
    return (
      <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {p.title ? <div style={{ fontSize: p.titleSize || 28, fontWeight: 700, color: text, marginBottom: 32 }}>{p.title}</div> : <SkeletonLine w={220} h={28} color={text} mb={32} />}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16 }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ background: p.cardBg || '#fff', borderRadius: p.cardRadius ?? 14, overflow: 'hidden', border: `1px solid ${accent}15` }}>
              <div style={{ height: 160, background: text, opacity: 0.05 }} />
              <div style={{ padding: 16 }}><SkeletonLine w="70%" h={14} color={text} mb={8} /><SkeletonLine w="40%" h={18} color={accent} mb={12} /><div style={{ height: 32, background: accent, borderRadius: 8, opacity: 0.8 }} /></div>
            </div>
          ))}
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'pricing') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {p.title ? <div style={{ fontSize: 28, fontWeight: 700, color: text, marginBottom: 8 }}>{p.title}</div> : <SkeletonLine w={280} h={28} color={text} mb={8} />}
      {p.subtitle ? <div style={{ fontSize: 14, color: text, opacity: 0.6, marginBottom: 36 }}>{p.subtitle}</div> : <SkeletonLine w={400} h={13} color={text} mb={36} />}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {[false,true,false].map((f, i) => <div key={i} style={{ background: f ? accent : (p.cardBg || '#f8fafc'), borderRadius: p.cardRadius ?? 16, padding: 28, border: f ? 'none' : `1px solid ${accent}20`, transform: f ? 'scale(1.04)' : 'none' }}><SkeletonLine w="50%" h={16} color={f ? '#fff' : text} mb={8} /><SkeletonLine w="60%" h={32} color={f ? '#fff' : accent} mb={16} />{[1,2,3].map(j => <SkeletonLine key={j} w="85%" h={10} color={f ? '#fff' : text} mb={8} />)}<div style={{ height: 40, background: f ? '#fff' : accent, borderRadius: 10, marginTop: 16, opacity: 0.9 }} /></div>)}
      </div>
      {freeEls}
    </div>
  )

  if (type === 'clients') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {p.title ? <div style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 32 }}>{p.title}</div> : <SkeletonLine w={240} h={26} color={text} mb={32} />}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 60, background: p.cardBg || '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 80, height: 24, background: text, opacity: 0.15, borderRadius: 4 }} /></div>)}
      </div>
      {freeEls}
    </div>
  )

  if (type === 'promo') return (
    <div style={{ ...wrap, background: accent, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {p.title ? <div style={{ fontSize: p.titleSize || 36, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{p.title}</div> : <SkeletonLine w={320} h={32} color="#fff" mb={8} />}
      {p.subtitle ? <div style={{ fontSize: 14, color: '#fff', opacity: 0.8, marginBottom: 28 }}>{p.subtitle}</div> : <SkeletonLine w={440} h={14} color="#fff" mb={28} />}
      {p.btnText ? <div style={{ padding: '14px 36px', background: '#fff', color: accent, borderRadius: p.btnRadius ?? 12, fontSize: 14, fontWeight: 700 }}>{p.btnText}</div> : <div style={{ width: 160, height: 50, background: '#fff', borderRadius: p.btnRadius ?? 12, opacity: 0.9 }} />}
      {freeEls}
    </div>
  )

  if (type === 'contact') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {p.title ? <div style={{ fontSize: 26, fontWeight: 700, color: text, marginBottom: 32 }}>{p.title}</div> : <SkeletonLine w={240} h={26} color={text} mb={32} />}
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 46, background: p.cardBg || '#f1f5f9', borderRadius: 10, border: `1px solid ${accent}20` }} />)}
        <div style={{ height: 100, background: p.cardBg || '#f1f5f9', borderRadius: 10, border: `1px solid ${accent}20` }} />
        <div style={{ height: 48, background: accent, borderRadius: 12, opacity: 0.85 }} />
      </div>
      {freeEls}
    </div>
  )

  if (type === 'footer') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: p.align === 'left' ? 'flex-start' : 'center', gap: 12 }}>
      {p.brandName ? <span style={{ fontWeight: 800, fontSize: 18, color: accent }}>{p.brandName}</span> : <div style={{ width: 120, height: 24, background: accent, opacity: 0.8, borderRadius: 6 }} />}
      <div style={{ display: 'flex', gap: 24 }}>{[80,70,90,65].map((w,i) => <SkeletonLine key={i} w={w} h={11} color={text} />)}</div>
      {p.copyright ? <div style={{ fontSize: 12, color: text, opacity: 0.5 }}>{p.copyright}</div> : <SkeletonLine w={220} h={10} color={text} />}
      {freeEls}
    </div>
  )

  return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Package style={{ color: text, opacity: 0.2, width: 36, height: 36, marginBottom: 12 }} />
      <SkeletonLine w={150} h={14} color={text} />
      {freeEls}
    </div>
  )
}
