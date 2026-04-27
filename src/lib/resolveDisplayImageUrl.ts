/**
 * Normalize user-pasted image URLs for <img> / CSS background-image.
 *
 * Unsplash **photo pages** (https://unsplash.com/photos/...) are HTML, not bytes;
 * browsers will not render them as images. We rewrite to the official `/download`
 * endpoint (302 → CDN JPEG/WEBP), which works in img/background without an API key.
 *
 * **plus.unsplash.com** / **images.unsplash.com** are CDN URLs — force HTTPS, pass through.
 */
export function resolveDisplayImageUrl(raw: string | undefined | null): string {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return ''

  try {
    const u = new URL(s)
    const host = u.hostname.replace(/^www\./i, '').toLowerCase()

    if (host === 'plus.unsplash.com' || host === 'images.unsplash.com') {
      u.protocol = 'https:'
      return u.toString()
    }

    if (host !== 'unsplash.com') return s
    if (!u.pathname.startsWith('/photos/')) return s

    const path = u.pathname.replace(/\/$/, '')
    if (path.endsWith('/download')) {
      if (!u.searchParams.has('force')) u.searchParams.set('force', 'true')
      if (!u.searchParams.has('w')) u.searchParams.set('w', '1920')
      return u.toString()
    }

    return `https://unsplash.com${path}/download?force=true&w=1920&q=80`
  } catch {
    return s
  }
}
