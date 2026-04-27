/** SuperAdmin builder: draggable zone positions (% of block preview). */

export type CanvasZonePos = { l: number; t: number }

export type CanvasZones = Record<string, CanvasZonePos>

/** Section types that support `blockCanvas` / `blockCanvasZones` in the builder preview. */
export const BUILDER_BLOCK_CANVAS_TYPES = [
  'hero',
  'about',
  'services',
  'features',
  'products',
  'pricing',
  'clients',
  'promo',
  'contact',
  'footer',
] as const

export type BuilderBlockCanvasType = (typeof BUILDER_BLOCK_CANVAS_TYPES)[number]

export function isBuilderBlockCanvasType(t: string): t is BuilderBlockCanvasType {
  return (BUILDER_BLOCK_CANVAS_TYPES as readonly string[]).includes(t)
}

export function clampCanvasZone(l: number, t: number): CanvasZonePos {
  return { l: Math.min(100, Math.max(0, l)), t: Math.min(100, Math.max(0, t)) }
}

/** Default % positions per block kind (preview-only until saved in props). */
export const BLOCK_CANVAS_DEFAULTS: Record<BuilderBlockCanvasType, CanvasZones> = {
  hero: {
    media: { l: 8, t: 6 },
    title: { l: 8, t: 40 },
    subtitle: { l: 8, t: 54 },
    cta: { l: 8, t: 72 },
  },
  about: {
    image: { l: 4, t: 10 },
    content: { l: 48, t: 12 },
  },
  services: {
    title: { l: 10, t: 6 },
    grid: { l: 6, t: 26 },
  },
  features: {
    title: { l: 10, t: 6 },
    grid: { l: 6, t: 26 },
  },
  products: {
    title: { l: 10, t: 5 },
    grid: { l: 5, t: 24 },
  },
  pricing: {
    title: { l: 10, t: 6 },
    grid: { l: 4, t: 24 },
  },
  clients: {
    title: { l: 10, t: 8 },
    grid: { l: 6, t: 30 },
  },
  promo: {
    title: { l: 12, t: 26 },
    cta: { l: 12, t: 58 },
  },
  contact: {
    title: { l: 10, t: 5 },
    form: { l: 10, t: 22 },
  },
  footer: {
    brand: { l: 8, t: 8 },
    links: { l: 32, t: 10 },
    copy: { l: 8, t: 58 },
  },
}

export function mergeBlockCanvasZones(
  componentType: string,
  input?: Partial<Record<string, Partial<CanvasZonePos> | undefined>> | null,
): CanvasZones {
  const base = BLOCK_CANVAS_DEFAULTS[componentType as BuilderBlockCanvasType]
  if (!base) {
    return { main: { l: 8, t: 10 }, ...((input || {}) as CanvasZones) }
  }
  const out: CanvasZones = {}
  for (const k of Object.keys(base)) {
    out[k] = { ...base[k], ...(input?.[k] as CanvasZonePos | undefined) }
  }
  if (input) {
    for (const k of Object.keys(input)) {
      if (!out[k] && typeof input[k] === 'object') {
        out[k] = input[k] as CanvasZonePos
      }
    }
  }
  return out
}

export function defaultBlockCanvasHeight(componentType: string): number {
  const map: Record<string, number> = {
    hero: 320,
    about: 280,
    services: 260,
    features: 260,
    products: 300,
    pricing: 280,
    clients: 200,
    promo: 220,
    contact: 340,
    footer: 200,
  }
  return map[componentType] ?? 240
}
