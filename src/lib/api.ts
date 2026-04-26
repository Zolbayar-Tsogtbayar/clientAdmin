function getBase(): string {
  if (typeof window !== 'undefined') return '/api/proxy/api/v2'
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://202.179.6.77:4000/api/v2'
}

function parseEnvelope<T>(json: unknown): T {
  if (!json || typeof json !== 'object') throw new Error('Invalid API response')
  const o = json as Record<string, unknown>
  return ('data' in o ? o.data : o) as T
}

async function req<T>(path: string, opts: RequestInit & { token?: string | null; project?: string | null } = {}): Promise<T> {
  const { token, project, headers: h, ...rest } = opts
  const headers = new Headers(h as HeadersInit)
  if (!headers.has('Content-Type') && rest.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (project) headers.set('x-project-id', project)

  const url = `${getBase()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, { ...rest, headers })
  const text = await res.text()
  let json: unknown
  try { json = text ? JSON.parse(text) : null } catch { throw new Error(`Non-JSON response (${res.status})`) }
  if (!res.ok) {
    const e = json as { error?: string; message?: string }
    throw new Error(e.error || e.message || `Request failed (${res.status})`)
  }
  return parseEnvelope<T>(json)
}

export type LoginResult = { success: boolean; accessToken: string; refreshToken: string; user?: { email: string; role: string } }
export type MeResult = { success: boolean; user: { email: string; role: string; projects: Array<{ projectName: string; roles: string[] }> } }
export type ProjectSummary = { name: string; port?: number; status?: string; [k: string]: unknown }
export type ComponentRecord = {
  instanceId: string; projectName: string; pageRoute: string; componentType: string
  parentId: string | null; slot: string | null; order: number; props: Record<string, unknown>; updatedAt?: string
}
export type DesignRecord = {
  projectName: string; domain?: string
  theme: { primaryColor: string; secondaryColor: string; fontFamily: string; darkMode: boolean }
  pages: Array<{ route: string; title?: string }>; updatedAt?: string
}

export type ComponentTypeRecord = { type: string; category: string }
export type ImageItem = { url: string; alt?: string }

export const api = {
  login: (email: string, password: string) =>
    req<LoginResult>('/core/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: (token: string) =>
    req<MeResult>('/core/auth/me', { token }),

  logout: (token: string, refreshToken: string | null) =>
    req<{ success: boolean }>('/core/auth/logout', { method: 'POST', token, body: JSON.stringify(refreshToken ? { refreshToken } : {}) }),

  listProjects: (token: string) =>
    req<{ success: boolean; projects: ProjectSummary[] }>('/core/projects', { token }),

  getDesign: (name: string) =>
    req<{ success: boolean; design: DesignRecord }>(`/core/designs/${encodeURIComponent(name)}`),

  /** List supported component types */
  getComponentTypes: (token: string, project: string) =>
    req<{ success: boolean; components: ComponentTypeRecord[] }>('/content-admin/component-types', { token, project }),

  /** List all blocks for a project/page */
  listBlocks: (token: string, project: string, pageRoute?: string) => {
    const q = pageRoute ? `?pageRoute=${encodeURIComponent(pageRoute)}` : ''
    return req<{ success: boolean; components: ComponentRecord[] }>(`/content-admin/blocks${q}`, { token, project })
  },

  /** Nested tree for a specific page (pageRoute required) */
  getBlocksTree: (token: string, project: string, pageRoute: string) =>
    req<{ success: boolean; components: ComponentRecord[] }>(
      `/content-admin/blocks/tree?pageRoute=${encodeURIComponent(pageRoute)}`,
      { token, project },
    ),

  /** Update whitelisted text/scalar fields for a block */
  saveBlockText: (token: string, project: string, instanceId: string, fields: Record<string, string | number>) =>
    req<{ success: boolean; component: ComponentRecord }>(
      `/content-admin/blocks/${encodeURIComponent(instanceId)}/text`,
      { method: 'POST', token, project, body: JSON.stringify({ fields }) },
    ),

  /** Replace or append image URLs on a block */
  saveBlockImages: (token: string, project: string, instanceId: string, images: ImageItem[], mode: 'replace' | 'append' = 'replace') =>
    req<{ success: boolean; component: ComponentRecord }>(
      `/content-admin/blocks/${encodeURIComponent(instanceId)}/images`,
      { method: 'POST', token, project, body: JSON.stringify({ images, mode }) },
    ),

  /** Replace or append media items on a block */
  saveBlockMedia: (token: string, project: string, instanceId: string, items: ({ kind: 'image'; url: string; alt?: string })[], mode: 'replace' | 'append' = 'replace') =>
    req<{ success: boolean; component: ComponentRecord }>(
      `/content-admin/blocks/${encodeURIComponent(instanceId)}/media`,
      { method: 'POST', token, project, body: JSON.stringify({ items, mode }) },
    ),
}
