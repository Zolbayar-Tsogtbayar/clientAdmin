const baseKey = (project: string) => `clientAdmin:liveSiteBase:${project}`
const dynKey = (project: string) => `clientAdmin:useDynamicProject:${project}`
const tokenKey = (project: string) => `clientAdmin:cmsPreviewToken:${project}`
const iframeLiveKey = (project: string) => `clientAdmin:iframeLiveEdit:${project}`

export function readLiveSiteBaseOverride(project: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(baseKey(project)) ?? ''
  } catch {
    return ''
  }
}

export function writeLiveSiteBaseOverride(project: string, value: string) {
  try {
    if (!value.trim()) localStorage.removeItem(baseKey(project))
    else localStorage.setItem(baseKey(project), value.trim())
  } catch {
    /* ignore */
  }
}

/** `null` = never set; use env default. */
export function readUseDynamicProject(project: string): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(dynKey(project))
    if (v === null) return null
    return v === 'true'
  } catch {
    return null
  }
}

export function writeUseDynamicProject(project: string, value: boolean) {
  try {
    localStorage.setItem(dynKey(project), value ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}

export function readPreviewToken(project: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(tokenKey(project)) ?? ''
  } catch {
    return ''
  }
}

export function writePreviewToken(project: string, value: string) {
  try {
    if (!value.trim()) localStorage.removeItem(tokenKey(project))
    else localStorage.setItem(tokenKey(project), value.trim())
  } catch {
    /* ignore */
  }
}

export function readIframeLiveEdit(project: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(iframeLiveKey(project)) === 'true'
  } catch {
    return false
  }
}

export function writeIframeLiveEdit(project: string, value: boolean) {
  try {
    localStorage.setItem(iframeLiveKey(project), value ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}
