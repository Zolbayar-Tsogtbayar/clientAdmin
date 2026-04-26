'use client'

import { useMemo, useState, useEffect, useCallback, type RefObject } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { buildLivePreviewSrc, normalizeLiveSiteBase } from '@/lib/livePreviewUrl'
import { CMS_LIVE_EDIT_HIGHLIGHT } from '@/lib/liveEditMessages'

type Props = {
  /** Resolved preview origin (template deployment). */
  baseUrl: string | null
  pageRoute: string
  projectName: string
  viewWidth: string
  /** Bump to reload iframe after saves. */
  reloadToken: number
  /** When true, append ?project=… (template needs CMS_DYNAMIC_PROJECT). */
  useDynamicProject: boolean
  /** Optional; also falls back to NEXT_PUBLIC_CMS_PREVIEW_TOKEN if set at build time. */
  previewToken?: string | null
  /** Inline edit in iframe (double-click text); adds cmsLiveEdit + parentOrigin. */
  iframeLiveEdit: boolean
  /** Set on the iframe so the parent can verify postMessage source. */
  iframeRef?: RefObject<HTMLIFrameElement | null>
  /** Syncs with admin selected block — same highlight idea as the Загвар tab. */
  selectionInstanceId?: string | null
}

export function LiveSitePreview({
  baseUrl,
  pageRoute,
  projectName,
  viewWidth,
  reloadToken,
  useDynamicProject,
  previewToken,
  iframeLiveEdit,
  iframeRef,
  selectionInstanceId = null,
}: Props) {
  const [nonce, setNonce] = useState(0)
  /** Set after mount so preview URL always includes parentOrigin (SSR had no window). */
  const [adminOrigin, setAdminOrigin] = useState('')

  const templateOrigin = useMemo(() => {
    const b = baseUrl ? normalizeLiveSiteBase(baseUrl) : null
    if (!b) return ''
    try {
      return new URL(b).origin
    } catch {
      return ''
    }
  }, [baseUrl])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setAdminOrigin(window.location.origin)
  }, [])

  const src = useMemo(() => {
    const b = baseUrl ? normalizeLiveSiteBase(baseUrl) : null
    if (!b) return ''
    const token =
      (previewToken?.trim() || process.env.NEXT_PUBLIC_CMS_PREVIEW_TOKEN?.trim()) ||
      undefined
    const parentOrigin = iframeLiveEdit && adminOrigin ? adminOrigin : ''
    return buildLivePreviewSrc(b, pageRoute, {
      project: projectName,
      useDynamicProject,
      previewToken: token,
      iframeLiveEdit:
        iframeLiveEdit && parentOrigin
          ? { enabled: true, parentOrigin }
          : undefined,
    })
  }, [
    baseUrl,
    pageRoute,
    projectName,
    reloadToken,
    nonce,
    useDynamicProject,
    previewToken,
    iframeLiveEdit,
    adminOrigin,
  ])

  const postSelectionHighlight = useCallback(() => {
    if (!iframeLiveEdit || !templateOrigin) return
    const w = iframeRef?.current?.contentWindow
    if (!w) return
    try {
      w.postMessage(
        { type: CMS_LIVE_EDIT_HIGHLIGHT, instanceId: selectionInstanceId },
        templateOrigin,
      )
    } catch {
      /* ignore */
    }
  }, [iframeLiveEdit, templateOrigin, selectionInstanceId, iframeRef])

  useEffect(() => {
    if (!iframeLiveEdit || !src) return
    const t = window.setTimeout(() => postSelectionHighlight(), 0)
    return () => window.clearTimeout(t)
  }, [iframeLiveEdit, src, postSelectionHighlight, reloadToken, nonce])

  if (!baseUrl || !normalizeLiveSiteBase(baseUrl)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] rounded-sm border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-slate-600">Жинхэнэ сайтын суурь URL тохируулаагүй байна</p>
        <p className="mt-2 max-w-md text-xs text-slate-500 leading-relaxed">
          Доорх &quot;Сайтын URL&quot; талбарт оруулна уу, эсвэл загварын domain / env-аас автоматаар
          сонгогдоно.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-h-0 flex-1">
      <div className="flex items-center justify-between gap-2 px-1 shrink-0">
        <p className="text-[10px] text-slate-500 truncate font-mono" title={src}>
          {src}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setNonce(n => n + 1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            title="Дахин ачаалах"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
            title="Шинэ табд нээх"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <div
        className="mx-auto w-full min-h-0 flex-1 rounded-sm border border-slate-200 bg-slate-100 shadow-inner overflow-hidden"
        style={{ maxWidth: viewWidth }}
      >
        <iframe
          ref={iframeRef as RefObject<HTMLIFrameElement> | undefined}
          key={`${src}-${reloadToken}-${nonce}`}
          title="Live site preview"
          src={src}
          onLoad={() => {
            requestAnimationFrame(() => postSelectionHighlight())
          }}
          className="h-[min(720px,calc(100vh-200px))] w-full min-h-[480px] bg-white"
        />
      </div>
    </div>
  )
}
