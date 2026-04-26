'use client'

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { mergeHeaderZones, clampHeaderZone, type HeaderZoneKey, type HeaderZones } from './headerCanvasDefaults'

type Props = {
  p: Record<string, unknown>
  wrapBase: React.CSSProperties
  borderBottom: string | undefined
  isSelected: boolean
  onPatch?: (patch: Record<string, unknown>) => void
  titleBlock: ReactNode
  navEls: ReactNode
  ctaBlock: ReactNode | null
  ctaSep: boolean
  hasCta: boolean
  minH: number
  freeEls: ReactNode
}

type DragState = {
  part: HeaderZoneKey
  startL: number
  startT: number
  originX: number
  originY: number
}

export function HeaderCanvasPreview({
  p,
  wrapBase,
  borderBottom,
  isSelected,
  onPatch,
  titleBlock,
  navEls,
  ctaBlock,
  ctaSep,
  hasCta,
  minH,
  freeEls,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  const merged = mergeHeaderZones(
    p.headerZones as Partial<Record<HeaderZoneKey, Partial<{ l: number; t: number }> | undefined>> | undefined,
  )
  const [live, setLive] = useState<HeaderZones>(merged)
  useEffect(() => {
    setLive(
      mergeHeaderZones(
        p.headerZones as Partial<Record<HeaderZoneKey, Partial<{ l: number; t: number }> | undefined>> | undefined,
      ),
    )
  }, [p.headerZones])

  const commitZones = useCallback(
    (next: HeaderZones) => {
      setLive(next)
      onPatch?.({ headerZones: next })
    },
    [onPatch],
  )

  const onPointerDown = (part: HeaderZoneKey, e: React.PointerEvent) => {
    if (!isSelected || !onPatch) return
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation?.()
    e.preventDefault()
    const z = live[part]
    setDrag({
      part,
      startL: z.l,
      startT: z.t,
      originX: e.clientX,
      originY: e.clientY,
    })
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || !rootRef.current) return
      const r = rootRef.current.getBoundingClientRect()
      const w = Math.max(1, r.width)
      const h = Math.max(1, r.height)
      const dL = ((e.clientX - drag.originX) / w) * 100
      const dT = ((e.clientY - drag.originY) / h) * 100
      const c = clampHeaderZone(drag.startL + dL, drag.startT + dT)
      setLive((prev) => ({ ...prev, [drag.part]: c }))
    },
    [drag],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return
      if (!rootRef.current) {
        setDrag(null)
        return
      }
      const r = rootRef.current.getBoundingClientRect()
      const w = Math.max(1, r.width)
      const h = Math.max(1, r.height)
      const dL = ((e.clientX - drag.originX) / w) * 100
      const dT = ((e.clientY - drag.originY) / h) * 100
      const c = clampHeaderZone(drag.startL + dL, drag.startT + dT)
      const next = {
        ...mergeHeaderZones(
          p.headerZones as Partial<Record<HeaderZoneKey, Partial<{ l: number; t: number }> | undefined>> | undefined,
        ),
        [drag.part]: c,
      }
      commitZones(next)
      setDrag(null)
    },
    [drag, p.headerZones, commitZones],
  )

  const z = live

  const partStyle = (k: HeaderZoneKey, zi: number): React.CSSProperties => ({
    position: 'absolute' as const,
    left: `${z[k].l}%`,
    top: `${z[k].t}%`,
    zIndex: zi,
  })

  const showCta = hasCta && ctaBlock && ctaSep
  const navWrap = ctaSep ? (hasCta ? 55 : 65) : 60

  const stageStyle: React.CSSProperties = {
    position: 'relative' as const,
    minHeight: minH,
    borderBottom: borderBottom ?? 'none',
    userSelect: drag ? 'none' : undefined,
    ...(!isSelected
      ? {}
      : {
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.06) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }),
  }

  return (
    <div style={wrapBase}>
      <div
        ref={rootRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={stageStyle}
      >
        {isSelected && onPatch && (
          <div className="absolute top-1 right-1 z-[20] text-[9px] font-bold uppercase text-indigo-500 bg-indigo-50/95 px-1.5 py-0.5 rounded border border-indigo-100 pointer-events-none">
            Canvas
          </div>
        )}

        <div
          style={partStyle('brand', 2)}
          onPointerDown={(e) => onPointerDown('brand', e)}
          className={isSelected && onPatch ? 'cursor-grab active:cursor-grabbing' : undefined}
        >
          <div className={isSelected && onPatch ? 'ring-1 ring-indigo-400/50 rounded' : undefined}>
            {titleBlock}
          </div>
        </div>

        <div
          style={{
            ...partStyle('nav', 5),
            maxWidth: `${navWrap}%`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: typeof p.contentGap === 'number' && p.contentGap > 0 ? p.contentGap : 8,
          }}
          onPointerDown={(e) => onPointerDown('nav', e)}
          className={isSelected && onPatch ? 'cursor-grab active:cursor-grabbing' : undefined}
        >
          <div className={isSelected && onPatch ? 'ring-1 ring-indigo-400/50 rounded px-1' : undefined}>
            {navEls}
            {!ctaSep && ctaBlock}
          </div>
        </div>

        {showCta && (
          <div
            style={partStyle('cta', 8)}
            onPointerDown={(e) => onPointerDown('cta', e)}
            className={isSelected && onPatch ? 'cursor-grab active:cursor-grabbing' : undefined}
          >
            <div className={isSelected && onPatch ? 'ring-1 ring-indigo-400/50 rounded' : undefined}>{ctaBlock}</div>
          </div>
        )}

        <div
          style={partStyle('mobileMenu', 10)}
          onPointerDown={(e) => onPointerDown('mobileMenu', e)}
          className={isSelected && onPatch ? 'cursor-grab active:cursor-grabbing' : undefined}
        >
          <div
            className={isSelected && onPatch ? 'ring-1 ring-amber-400/60 rounded px-0.5' : undefined}
            style={{ width: 48, height: 28, borderRadius: 8, border: '1px solid #64748b55' }}
            title="Mobile menu"
          />
        </div>

        {freeEls}
      </div>
    </div>
  )
}
