import { NextRequest } from 'next/server'

const TARGET_ORIGIN = process.env.API_PROXY_TARGET || 'http://202.179.6.77:4000'

const hopByHopHeaders = new Set([
  'host', 'connection', 'keep-alive', 'proxy-authenticate',
  'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-length',
])

async function proxy(request: NextRequest, params: { path: string[] }) {
  const targetPath = params.path.join('/')
  const incomingUrl = new URL(request.url)
  const targetUrl = new URL(`/${targetPath}`, TARGET_ORIGIN)
  targetUrl.search = incomingUrl.search

  const upstreamHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) upstreamHeaders.set(key, value)
  })

  const init: RequestInit = { method: request.method, headers: upstreamHeaders, redirect: 'follow' }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  const res = await fetch(targetUrl.toString(), init)
  const responseHeaders = new Headers()
  res.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) responseHeaders.set(key, value)
  })
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: responseHeaders })
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
