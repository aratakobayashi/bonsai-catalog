import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

const CANONICAL_HOST = 'www.bonsai-collection.com'

// 正規ドメイン（www）以外で公開されているホスト。プレビュー用の *.vercel.app は対象外
const REDIRECT_HOSTS = new Set(['bonsai-collection.com', 'bonsai-catalog.vercel.app'])

// 書き込み系・管理用の API。GET 以外は管理者のみ
const PROTECTED_API_PREFIXES = ['/api/articles', '/api/upload']

function isProtectedApi(pathname: string, method: string): boolean {
  if (pathname.startsWith('/api/upload') || pathname.startsWith('/api/admin')) return true
  return method !== 'GET' && method !== 'HEAD' &&
    PROTECTED_API_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = (request.headers.get('host') || '').toLowerCase()

  if (REDIRECT_HOSTS.has(host)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https'
    url.host = CANONICAL_HOST
    url.port = ''
    return NextResponse.redirect(url, 308)
  }

  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const needsAuth = isAdminPage || isProtectedApi(pathname, request.method)
  if (!needsAuth) return NextResponse.next()

  const authenticated = await verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
  if (authenticated) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  if (isAdminPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
