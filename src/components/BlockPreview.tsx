'use client'
import { useState, useRef, useCallback, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { BlockSection } from './templates'
import { Image as ImageIcon, Package, Copy, Trash2, MoveVertical, ArrowUp, ArrowDown, Move } from 'lucide-react'
import { HeaderCanvasPreview } from './HeaderCanvasPreview'
import { ZoneCanvasPreview } from './ZoneCanvasPreview'
import { defaultBlockCanvasHeight, isBuilderBlockCanvasType } from './sectionCanvasDefaults'
import { resolveDisplayImageUrl } from '@/lib/resolveDisplayImageUrl'

function pxFromSizeProp(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonLine({ w = '100%', h = 14, color = '#1e293b', mb = 0 }: {
  w?: string | number; h?: number; color?: string; mb?: number
}) {
  return <div style={{ width: w, height: h, background: color, opacity: 0.2, borderRadius: 4, marginBottom: mb }} />
}

// ─── Free elements renderer ───────────────────────────────────────────────────

interface FreeElement {
  id: string; type: string; label: string; value?: string
  color?: string; bg?: string; radius?: number; size?: number
  width?: string; height?: number; placeholder?: string; align?: string
  src?: string
  links?: unknown; href?: string; isExternal?: boolean
  x?: number; y?: number
}

function wrapLink(el: FreeElement, child: React.ReactNode) {
  if (!el.href) return child
  return (
    <a href={el.href} target={el.isExternal ? '_blank' : undefined} rel={el.isExternal ? 'noopener noreferrer' : undefined} style={{ textDecoration: 'none' }}>
      {child}
    </a>
  )
}

export function renderFreeElement(el: FreeElement, accentColor: string, textColor: string) {
  switch (el.type) {
    case 'text':
      return wrapLink(el,
        <p style={{
          fontSize: el.size || 16,
          color: el.color || textColor,
          margin: '4px 0',
          lineHeight: 1.6,
          textAlign: (el.align as any) || 'left',
        }}>
          {el.value || el.label || ''}
        </p>
      )

    case 'button':
      return wrapLink(el,
        <span style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: el.bg || accentColor,
          color: '#fff',
          borderRadius: el.radius ?? 10,
          fontWeight: 700,
          fontSize: el.size || 14,
          cursor: 'pointer',
          textDecoration: 'none',
          lineHeight: 1,
        }}>
          {el.label || el.value || 'Button'}
        </span>
      )

    case 'input':
      return (
        <input
          type="text"
          placeholder={el.placeholder || el.label || ''}
          style={{
            width: el.width || '100%',
            height: el.height || 46,
            padding: '0 14px',
            borderRadius: el.radius ?? 8,
            border: `1px solid ${textColor}33`,
            fontSize: el.size || 14,
            background: el.bg || '#fff',
            color: textColor,
            boxSizing: 'border-box',
          }}
          disabled
        />
      )

    case 'image': {
      const displaySrc = el.src ? resolveDisplayImageUrl(el.src) : ''
      if (displaySrc) {
        return wrapLink(el,
          <img
            src={displaySrc}
            alt={el.label || ''}
            referrerPolicy="no-referrer"
            style={{
              width: (el.width as string | number | undefined) || '100%',
              maxWidth: '100%',
              maxHeight: el.height || 320,
              height: 'auto',
              objectFit: 'cover',
              borderRadius: el.radius ?? 12,
              display: 'block',
            }}
          />,
        )
      }
      return <div style={{ width: 120, height: 40, border: `1px dashed ${textColor}44`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>No Image</div>
    }

    case 'card':
      return wrapLink(el,
        <div style={{
          width: el.width || '100%',
          minHeight: el.height || 120,
          background: el.bg || '#ffffff',
          borderRadius: el.radius ?? 12,
          border: `1px solid ${textColor}15`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: 24,
        }}>
          {el.value && <p style={{ color: textColor, opacity: 0.8, fontSize: 15 }}>{el.value}</p>}
        </div>
      )

    case 'section':
      return (
        <div style={{
          width: el.width || '100%',
          minHeight: el.height || 80,
          background: el.bg || 'transparent',
          borderRadius: 8,
        }}>
          {el.value && <p style={{ color: textColor, opacity: 0.8 }}>{el.value}</p>}
        </div>
      )

    case 'divider':
      return (
        <hr style={{
          width: el.width || '100%',
          height: el.height || 1,
          background: el.color || textColor,
          opacity: 0.15,
          border: 'none',
          borderRadius: 99,
          margin: '12px 0',
        }} />
      )

    case 'badge':
      return wrapLink(el,
        <span style={{
          display: 'inline-block',
          padding: '3px 12px',
          background: el.bg || accentColor,
          color: '#fff',
          borderRadius: el.radius ?? 999,
          fontSize: el.size || 12,
          fontWeight: 600,
          opacity: 0.9,
        }}>
          {el.label || el.value || ''}
        </span>
      )

    case 'menu': {
      const navLinks = Array.isArray(el.links) ? el.links : []
      if (navLinks.length === 0) return null
      return (
        <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: (el.align as any) || 'center' }}>
          {navLinks.map((link: any, i: number) => (
            <div
              key={i}
              style={{
                width: 48,
                height: el.size ? el.size * 0.7 : 12,
                background: el.color || textColor,
                opacity: 0.2,
                borderRadius: 4,
              }}
            />
          ))}
        </nav>
      )
    }

    default:
      return null
  }
}

// ─── Interactive Free Elements Renderer (Read-only in clientAdmin by default) ───

function FreeElementsRenderer({ elements, accentColor, textColor, onPatchElements }: {
  elements: FreeElement[]; accentColor: string; textColor: string
  onPatchElements?: (newElements: FreeElement[]) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (!elements || elements.length === 0) return null

  return (
    <div
      style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
      onClick={e => { e.stopPropagation(); setSelectedId(null) }}
    >
      {elements.map((el, i) => (
        <div
          key={el.id}
          style={{
            position: (el.x !== undefined || el.y !== undefined) ? 'absolute' : 'relative',
            left: el.x,
            top: el.y,
            zIndex: (el.x !== undefined || el.y !== undefined) ? 10 : 1,
            width: el.width || (el.type === 'button' ? '140px' : el.type === 'input' ? '200px' : el.type === 'badge' ? '60px' : el.type === 'text' ? '80%' : undefined),
          }}
        >
          {renderFreeElement(el, accentColor, textColor)}
        </div>
      ))}
    </div>
  )
}

// ─── BlockPreview ──────────────────────────────────────────────────────────────

export function BlockPreview({ block, isSelected, onPatchProps }: { block: any; isSelected: boolean; onPatchProps?: (patch: Record<string, unknown>) => void }) {
  const p = block.props || {}
  const animationClass = p.animation && p.animation !== 'none' ? `animate-${p.animation}` : ''
  return (
    <div className={animationClass} style={{ width: '100%' }}>
      <BlockPreviewContent block={block} isSelected={isSelected} onPatchProps={onPatchProps} />
    </div>
  )
}

// ─── Default elements generator (minimal version for clientAdmin) ───

export function getDefaultElements(type: string, accent: string): FreeElement[] {
  return []
}

function BlockPreviewContent({ block, isSelected, onPatchProps }: { block: any; isSelected: boolean; onPatchProps?: (patch: Record<string, unknown>) => void }) {
  const { componentType: type, props: p = {} } = block
  const bg     = p.bgColor     || '#ffffff'
  const text   = p.textColor   || '#1e293b'
  const accent = p.accentColor || '#6366f1'
  const font   = p.fontFamily  || 'Inter'
  const px     = p.paddingX    ?? 48
  const py     = p.paddingY    ?? 60
  const border = isSelected ? '2px solid #6366f1' : '2px solid transparent'

  const rawElements: FreeElement[] = p._elements || []
  const elements: FreeElement[] = rawElements

  const wrapStyle: CSSProperties = {
    fontFamily: font, background: bg, color: text,
    paddingLeft: px, paddingRight: px, paddingTop: py, paddingBottom: py,
    border, transition: 'border 0.15s',
  }

  const handlePatchElements = useCallback((newEls: FreeElement[]) => {
    if (onPatchProps) onPatchProps({ _elements: newEls })
  }, [onPatchProps])

  const freeEls = <FreeElementsRenderer elements={elements} accentColor={accent} textColor={text} onPatchElements={onPatchProps ? handlePatchElements : undefined} />
  
  const freeParts: Record<string, ReactNode> = {}
  elements.forEach((el) => {
    freeParts[`free_${el.id}`] = renderFreeElement(el, accent, text)
  })

  if (elements.length > 0 && type !== 'header' && (!p.title && !p.subtitle && !p.imageUrl && !p.hasImage)) {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: (p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start'), gap: 4 }}>
        {freeEls}
      </div>
    )
  }

  function tryBlockCanvas(
    blockType: string,
    wrap: CSSProperties,
    zoneParts: Record<string, ReactNode>,
    after?: ReactNode,
  ): ReactNode | null {
    if (!p.blockCanvas || !isBuilderBlockCanvasType(blockType)) return null
    const minH =
      typeof p.blockCanvasHeight === 'number' && p.blockCanvasHeight > 0
        ? p.blockCanvasHeight
        : defaultBlockCanvasHeight(blockType)
    return (
      <>
        <div style={{ width: '100%' }}>
          <ZoneCanvasPreview
            componentType={blockType}
            p={p}
            wrapStyle={wrap}
            isSelected={!!isSelected}
            onPatch={onPatchProps}
            minH={minH}
            parts={{ ...zoneParts, ...freeParts }}
          />
        </div>
        {after}
      </>
    )
  }

  if (type === 'header') {
    const navLinks = Array.isArray(p.links) ? p.links : []
    const titlePx = pxFromSizeProp(p.fontSize, 20)
    const navPx = pxFromSizeProp(p.navFontSize, 14)
    const headerWrap: CSSProperties = {
      ...wrapStyle,
      paddingTop: p.paddingY ?? 18,
      paddingBottom: p.paddingY ?? 18,
    }
    if (p.headerCanvas) {
      const navEls = navLinks.length === 0 ? (
        <span style={{ fontSize: 11, color: text, opacity: 0.35, fontStyle: 'italic' }}>Цэс хоосон</span>
      ) : (
        navLinks.map((link: { label?: string; href?: string }, i: number) => (
          <span
            key={i}
            style={{
              fontSize: navPx,
              fontWeight: 600,
              color: text,
              opacity: 0.88,
              paddingBottom: 2,
              borderBottom: `2px solid ${accent}55`,
            }}
          >
            {String(link.label || link.href || 'Link')}
          </span>
        ))
      )
      const titleBlock = (
        <div
          style={{
            fontWeight: 800,
            fontSize: titlePx,
            color: text,
            letterSpacing: '-0.02em',
            maxWidth: 280,
          }}
        >
          {String(p.title || p.brandName || '')}
        </div>
      )
      const ctaSep = p.ctaWithNav === false
      const ctaBlock = p.button || p.ctaText ? <div style={{ padding: '8px 20px', background: accent, borderRadius: p.btnRadius ?? 8, color: '#fff', fontSize: 13, fontWeight: 700 }}>{p.ctaText || 'Action'}</div> : null
      return (
        <div style={{ width: '100%' }}>
          <HeaderCanvasPreview
            p={p}
            wrapBase={headerWrap}
            borderBottom={p.borderBottom ? `1px solid ${p.borderColor || '#e2e8f0'}` : 'none'}
            isSelected={isSelected}
            onPatch={onPatchProps}
            titleBlock={titleBlock}
            navEls={navEls}
            ctaBlock={ctaBlock}
            ctaSep={ctaSep}
            hasCta={!!(p.button || p.ctaText)}
            minH={typeof p.headerCanvasHeight === 'number' && p.headerCanvasHeight > 0 ? p.headerCanvasHeight : 88}
            freeParts={freeParts}
          />
        </div>
      )
    }
    const jMap: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end',
      between: 'space-between', around: 'space-around', evenly: 'space-evenly',
    }
    const iMap: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end', baseline: 'baseline', stretch: 'stretch',
    }
    const rowJust = jMap[String(p.rowJustify || 'between')] || 'space-between'
    const rowIt = iMap[String(p.rowItems || 'center')] || 'center'
    const isStack = p.headerLayout === 'stack'
    const ctaSep = p.ctaWithNav === false
    const brStack =
      p.stackBrandAlign === 'end' ? 'flex-end' : p.stackBrandAlign === 'start' ? 'flex-start' : 'center'
    const navStack = jMap[String(p.stackNavJustify || 'center')] || 'center'
    const gap = typeof p.contentGap === 'number' && p.contentGap > 0 ? p.contentGap : 8
    const navEls = navLinks.length === 0 ? (
      <span style={{ fontSize: 11, color: text, opacity: 0.35, fontStyle: 'italic' }}>Цэс хоосон</span>
    ) : (
      navLinks.map((link: { label?: string; href?: string }, i: number) => (
        <span
          key={i}
          style={{
            fontSize: navPx,
            fontWeight: 600,
            color: text,
            opacity: 0.88,
            paddingBottom: 2,
            borderBottom: `2px solid ${accent}55`,
          }}
        >
          {String(link.label || link.href || 'Link')}
        </span>
      ))
    )
    const ctaBlock = <div style={{ padding: '8px 20px', background: accent, borderRadius: p.btnRadius ?? 8, color: '#fff', fontSize: 13, fontWeight: 700 }}>{p.ctaText || 'Action'}</div>
    const titleBlock = (
      <div
        style={{
          fontWeight: 800,
          fontSize: titlePx,
          color: text,
          letterSpacing: '-0.02em',
          maxWidth: ctaSep ? '38%' : '42%',
        }}
      >
        {String(p.title || p.brandName || '')}
      </div>
    )
    if (isStack) {
      return (
        <div
          style={{
            ...wrapStyle,
            paddingTop: p.paddingY ?? 18,
            paddingBottom: p.paddingY ?? 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            borderBottom: p.borderBottom ? `1px solid ${p.borderColor || '#e2e8f0'}` : 'none',
            gap: Math.max(gap, 6),
          }}
        >
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: brStack, width: '100%' }}>{titleBlock}</div>
            <div style={{ width: 48, height: 28, borderRadius: 8, border: `1px solid ${text}30`, flexShrink: 0 }} />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: p.rowReverse ? 'row-reverse' as const : 'row' as const,
              flexWrap: 'wrap' as const,
              justifyContent: navStack,
              alignItems: rowIt as 'center',
              gap,
              minHeight: 32,
            }}
          >
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', flex: ctaSep ? 1 : undefined }}>
              {navEls}
              {!ctaSep && ctaBlock}
            </div>
            {ctaSep && ctaBlock}
          </div>
          {elements.length > 0 && <div style={{ width: '100%' }}>{freeEls}</div>}
        </div>
      )
    }
    return (
      <div
        style={{
          ...wrapStyle,
          paddingTop: p.paddingY ?? 18,
          paddingBottom: p.paddingY ?? 18,
          display: 'flex',
          flexDirection: p.rowReverse ? 'row-reverse' as const : 'row' as const,
          justifyContent: rowJust as 'space-between',
          alignItems: rowIt as 'center',
          borderBottom: p.borderBottom ? `1px solid ${p.borderColor || '#e2e8f0'}` : 'none',
          flexWrap: 'wrap' as const,
          gap,
        }}
      >
        {titleBlock}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: 'center', flex: ctaSep ? 1 : undefined, minWidth: 0 }}>
          {navEls}
          {!ctaSep && ctaBlock}
        </div>
        {ctaSep && ctaBlock}
        {elements.length > 0 && <div style={{ width: '100%' }}>{freeEls}</div>}
      </div>
    )
  }

  if (type === 'hero') {
    const align = p.align || 'center'
    const flexAlign = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
    const displayImg = p.imageUrl || (p.src ? resolveDisplayImageUrl(p.src) : '')
    const mediaEl = (p.hasImage || displayImg) ? (
      <div style={{ width: '100%', maxWidth: 420, height: displayImg ? 'auto' : 160, background: displayImg ? 'transparent' : text, opacity: displayImg ? 1 : 0.06, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {displayImg ? <img src={displayImg} style={{ width: '100%', borderRadius: 12 }} /> : <ImageIcon style={{ color: text, opacity: 0.25, width: 36, height: 36 }} />}
      </div>
    ) : (
      <div style={{ width: 120, height: 36, borderRadius: 8, border: `1px dashed ${text}22` }} />
    )

    const zoneParts: Record<string, ReactNode> = {
      media: mediaEl,
      title: <div style={{ fontSize: p.titleSize || 48, fontWeight: p.titleWeight || '800', color: text, maxWidth: 600 }}>{p.title || 'Гарчиг энд байна'}</div>,
      subtitle: <div style={{ fontSize: p.subtitleSize || 18, color: text, opacity: 0.7, maxWidth: 500 }}>{p.subtitle || 'Дэд гарчиг энд бичигдэнэ'}</div>,
      cta: <div style={{ width: p.btnPaddingX ? p.btnPaddingX * 4 : 140, height: p.btnPaddingY ? p.btnPaddingY * 3 : 46, background: p.btnBg || accent, borderRadius: p.btnRadius ?? 10, opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>{p.primaryBtnText || p.btnText || ''}</div>,
    }

    const canvas = tryBlockCanvas('hero', wrapStyle, zoneParts)
    if (canvas) return canvas

    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: flexAlign, textAlign: align as any, gap: 20 }}>
        {zoneParts.title}
        {zoneParts.subtitle}
        {mediaEl}
        {(p.primaryBtnText || p.btnText) && zoneParts.cta}
        {freeEls}
      </div>
    )
  }

  if (type === 'about') {
    const align = p.align || 'left'
    const flexAlign = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
    const displayImg = p.imageUrl || (p.src ? resolveDisplayImageUrl(p.src) : '')

    const zoneParts: Record<string, ReactNode> = {
      image: (
        <div style={{ width: '100%', maxWidth: 480, height: displayImg ? 'auto' : 240, background: displayImg ? 'transparent' : text, opacity: displayImg ? 1 : 0.06, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {displayImg ? <img src={displayImg} style={{ width: '100%', borderRadius: 16 }} /> : <ImageIcon style={{ color: text, opacity: 0.25, width: 48, height: 48 }} />}
        </div>
      ),
      content: (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: flexAlign }}>
          <div style={{ fontSize: p.titleSize || 34, fontWeight: '700', color: text }}>{p.title || 'Бидний тухай'}</div>
          {p.description ? <div style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6 }}>{p.description}</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <SkeletonLine w="100%" color={text} />
              <SkeletonLine w="95%" color={text} />
              <SkeletonLine w="90%" color={text} />
              <SkeletonLine w="40%" color={text} />
            </div>
          )}
          {(p.btnText || p.primaryBtnText) && <div style={{ width: 120, height: 40, background: accent, borderRadius: p.btnRadius ?? 8, opacity: 0.8, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>{p.btnText || p.primaryBtnText}</div>}
        </div>
      )
    }

    const canvas = tryBlockCanvas('about', wrapStyle, zoneParts)
    if (canvas) return canvas

    const isLeft = align === 'left'
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        {zoneParts.image}
        {zoneParts.content}
        {freeEls}
      </div>
    )
  }

  if (['services', 'features', 'products', 'pricing', 'clients'].includes(type)) {
    const cols = p.columns || 3
    const cardBg = p.cardBg || (bg === '#ffffff' ? '#f8fafc' : `${bg}15`)
    const items = Array.isArray(p.items) ? p.items : []
    
    const zoneParts: Record<string, ReactNode> = {
      title: <div style={{ fontSize: p.titleSize || 34, fontWeight: '700', color: text, marginBottom: 32 }}>{p.title || (type === 'services' ? 'Үйлчилгээ' : type === 'features' ? 'Онцлог' : type === 'products' ? 'Бүтээгдэхүүн' : type === 'pricing' ? 'Үнийн санал' : 'Харилцагчид')}</div>,
      grid: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', 1fr)', gap: 20, width: '100%' }}>
          {items.length > 0 ? items.map((item: any, i: number) => (
             <div key={i} style={{ background: cardBg, borderRadius: p.cardRadius ?? 16, padding: 24, boxShadow: p.cardShadow === 'none' ? 'none' : '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {item.imageUrl && <img src={item.imageUrl} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />}
                <div style={{ fontWeight: 700, fontSize: 18 }}>{item.title}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{item.description}</div>
                {item.price && <div style={{ fontWeight: 800, color: accent }}>{item.price}</div>}
             </div>
          )) : [1, 2, 3, 4, 5, 6].slice(0, Math.max(cols, 3)).map((i: number) => (
            <div key={i} style={{ background: cardBg, borderRadius: p.cardRadius ?? 16, padding: 24, boxShadow: p.cardShadow === 'none' ? 'none' : '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: accent, opacity: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package style={{ width: 24, height: 24, color: accent }} />
              </div>
              <SkeletonLine w="70%" color={text} h={16} />
              <SkeletonLine w="100%" color={text} h={10} />
              <SkeletonLine w="90%" color={text} h={10} />
            </div>
          ))}
        </div>
      )
    }

    const canvas = tryBlockCanvas(type, wrapStyle, zoneParts)
    if (canvas) return canvas

    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {zoneParts.title}
        {zoneParts.grid}
        {freeEls}
      </div>
    )
  }

  if (type === 'slider') {
    const items = Array.isArray(p.items) ? p.items : []
    return (
      <div style={{ ...wrapStyle, padding: 0, position: 'relative', height: 320, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {items.length > 0 ? (
          <>
            <img src={items[0].imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20, color: '#fff', textAlign: 'center' }}>
               <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{items[0].title}</h2>
               <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>{items[0].description}</p>
            </div>
          </>
        ) : (
          <div style={{ color: '#fff', fontSize: 12 }}>Slider (No Items)</div>
        )}
      </div>
    )
  }

  if (type === 'promo') {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
        <div style={{ fontSize: p.titleSize || 36, fontWeight: '800', color: text }}>{p.title || 'Урамшуулал ба Онцлох'}</div>
        {p.subtitle ? <div style={{ fontSize: 18, opacity: 0.8 }}>{p.subtitle}</div> : <SkeletonLine w="60%" color={text} />}
        <div style={{ padding: '12px 32px', background: p.btnBg || accent, borderRadius: p.btnRadius ?? 12, color: '#fff', fontWeight: 700, marginTop: 10 }}>{p.btnText || 'Дэлгэрэнгүй'}</div>
        {freeEls}
      </div>
    )
  }

  if (type === 'contact') {
    const zoneParts: Record<string, ReactNode> = {
      title: <div style={{ fontSize: p.titleSize || 34, fontWeight: '700', color: text }}>{p.title || 'Холбоо барих'}</div>,
      form: (
        <div style={{ width: '100%', maxWidth: 500, background: p.cardBg || '#ffffff', borderRadius: p.cardRadius ?? 16, padding: 32, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 42, borderRadius: 8, background: text, opacity: 0.05 }} />
          <div style={{ height: 42, borderRadius: 8, background: text, opacity: 0.05 }} />
          <div style={{ height: 100, borderRadius: 8, background: text, opacity: 0.05 }} />
          <div style={{ height: 46, borderRadius: 8, background: accent, opacity: 0.9 }} />
        </div>
      )
    }

    const canvas = tryBlockCanvas('contact', wrapStyle, zoneParts)
    if (canvas) return canvas

    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {zoneParts.title}
        {zoneParts.form}
        {freeEls}
      </div>
    )
  }

  if (type === 'footer') {
    return (
      <div style={{ ...wrapStyle, borderTop: '1px solid ' + text + '15', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ fontWeight: '800', fontSize: 20, color: text }}>{p.title || p.brandName || 'Брэнд нэр'}</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <SkeletonLine w={60} color={text} />
          <SkeletonLine w={60} color={text} />
          <SkeletonLine w={60} color={text} />
        </div>
        <div style={{ fontSize: 12, color: text, opacity: 0.5, marginTop: 20 }}>
          © {new Date().getFullYear()} {p.copyright || 'Бүх эрх хуулиар хамгаалагдсан.'}
        </div>
        {freeEls}
      </div>
    )
  }

  return (
    <div style={{ 
      ...wrapStyle, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: (p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start'),
      minHeight: 120 
    }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', opacity: 0.2, marginBottom: 8, textTransform: 'uppercase' }}>{type} preview</div>
      {p.title ? <div style={{ fontSize: 24, fontWeight: 700 }}>{p.title}</div> : <SkeletonLine w="80%" color={text} mb={8} />}
      {p.subtitle ? <div style={{ fontSize: 16, opacity: 0.7 }}>{p.subtitle}</div> : <SkeletonLine w="60%" color={text} mb={16} />}
      {freeEls}
    </div>
  )
}
