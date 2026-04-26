/** Normalize a public site origin (e.g. https://example.com or http://localhost:3000). */
export function normalizeLiveSiteBase(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  const s = raw.trim().replace(/\/$/, '')
  if (!/^https?:\/\//i.test(s)) return null
  return s
}

export function buildLivePreviewSrc(
  baseUrl: string,
  pageRoute: string,
  opts: {
    project: string
    useDynamicProject: boolean
    previewToken?: string
    /** Double-click inline edit in iframe → postMessage to admin. */
    iframeLiveEdit?: { enabled: boolean; parentOrigin: string }
  },
): string {
  const path =
    pageRoute === '/' || !pageRoute
      ? '/'
      : pageRoute.startsWith('/')
        ? pageRoute
        : `/${pageRoute}`
  const u = new URL(path, `${baseUrl.replace(/\/$/, '')}/`)
  if (opts.useDynamicProject && opts.project) {
    u.searchParams.set('project', opts.project)
  }
  if (opts.previewToken) {
    u.searchParams.set('cmsPreviewToken', opts.previewToken)
  }
  if (opts.iframeLiveEdit?.enabled && opts.iframeLiveEdit.parentOrigin) {
    u.searchParams.set('cmsLiveEdit', '1')
    u.searchParams.set('parentOrigin', opts.iframeLiveEdit.parentOrigin)
  }
  return u.toString()
}
