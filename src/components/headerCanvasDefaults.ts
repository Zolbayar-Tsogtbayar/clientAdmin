/** Keep in sync with `cmsBuilder/src/components/headerCanvasUtils.ts` (percent 0–100, l = left, t = top). */

export type HeaderZoneKey = 'brand' | 'nav' | 'cta' | 'mobileMenu' | string

export type HeaderZonePos = { l: number; t: number }

export type HeaderZones = Record<HeaderZoneKey, HeaderZonePos>

export const DEFAULT_HEADER_ZONES: HeaderZones = {
  brand: { l: 3, t: 22 },
  nav: { l: 28, t: 20 },
  cta: { l: 78, t: 18 },
  mobileMenu: { l: 90, t: 24 },
}

export function mergeHeaderZones(
  input?: Partial<Record<HeaderZoneKey, Partial<HeaderZonePos> | undefined>> | null,
): HeaderZones {
  const out = {
    brand: { ...DEFAULT_HEADER_ZONES.brand, ...input?.brand },
    nav: { ...DEFAULT_HEADER_ZONES.nav, ...input?.nav },
    cta: { ...DEFAULT_HEADER_ZONES.cta, ...input?.cta },
    mobileMenu: { ...DEFAULT_HEADER_ZONES.mobileMenu, ...input?.mobileMenu },
  } as HeaderZones
  if (input) {
    for (const k of Object.keys(input)) {
      if (!out[k] && typeof input[k] === 'object') {
        out[k] = input[k] as HeaderZonePos
      }
    }
  }
  return out
}

export function clampHeaderZone(l: number, t: number): HeaderZonePos {
  return { l: Math.min(100, Math.max(0, l)), t: Math.min(100, Math.max(0, t)) }
}
