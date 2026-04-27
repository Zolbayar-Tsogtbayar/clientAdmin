'use client'

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  clampCanvasZone,
  mergeBlockCanvasZones,
  type CanvasZones,
} from './sectionCanvasDefaults'

type Props = {
  componentType: string
  p: Record<string, any>
  wrapStyle: React.CSSProperties
  isSelected: boolean
  onPatch?: (patch: Record<string, unknown>) => void
  minH: number
  /** Zone key → preview node (keys must match defaults for this componentType) */
  parts: Record<string, ReactNode>
}

type DragState = { part: string; startL: number; startT: number; originX: number; originY: number }

export function ZoneCanvasPreview({
  componentType,
  p,
  wrapStyle,
  isSelected,
  onPatch,
  minH,
  parts,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  const merged = mergeBlockCanvasZones(componentType, p.blockCanvasZones)
  const [live, setLive] = useState<CanvasZones>(merged)

  useEffect(() => {
    setLive(mergeBlockCanvasZones(componentType, p.blockCanvasZones))
  }, [componentType, p.blockCanvasZones])

  const commitZones = useCallback(
    (next: CanvasZones) => {
      setLive(next)
      onPatch?.({ blockCanvasZones: next })
    },
    [onPatch],
  )

  const onPointerDown = (part: string, e: React.PointerEvent) => {
    if (!isSelected || !onPatch) return
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation?.()
    e.preventDefault()
    const z = live[part]
    if (!z) return
    setDrag({
      part,
      startL: z.l,
      startT: z.t,
      originX: e.clientX,
      originY: e.clientY,
    })
    const target = e.target as HTMLElement
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId)
    }
  }

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || !rootRef.current) return
      const r = rootRef.current.getBoundingClientRect()
      const w = Math.max(1, r.width)
      const h = Math.max(1, r.height)
      const dL = ((e.clientX - drag.originX) / w) * 100
      const dT = ((e.clientY - drag.originY) / h) * 100
      const c = clampCanvasZone(drag.startL + dL, drag.startT + dT)
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
      const c = clampCanvasZone(drag.startL + dL, drag.startT + dT)
      const next = { ...mergeBlockCanvasZones(componentType, p.blockCanvasZones), [drag.part]: c }
      commitZones(next)
      setDrag(null)
    },
    [drag, p.blockCanvasZones, componentType, commitZones],
  )

  const z = live
  const keys = Object.keys(parts)

  const partStyle = (k: string, zi: number): React.CSSProperties => {
    const pos = z[k] || { l: 10, t: 10 }
    return {
      position: 'absolute' as const,
      left: `${pos.l}%`,
      top: `${pos.t}%`,
      zIndex: zi,
      transform: 'translate(0, 0)',
    }
  }

  const stageStyle: React.CSSProperties = {
    position: 'relative' as const,
    minHeight: minH,
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
    <div style={wrapStyle}>
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
        {keys.map((k, i) => (
          <div
            key={k}
            style={partStyle(k, 2 + i * 2)}
            onPointerDown={(e) => onPointerDown(k, e)}
            className={isSelected && onPatch ? 'cursor-grab active:cursor-grabbing' : undefined}
          >
            <div className={isSelected && onPatch ? 'ring-1 ring-indigo-400/40 rounded' : undefined}>{parts[k]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
