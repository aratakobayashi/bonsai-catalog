import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const isAuthenticated = await verifySessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  )

  return NextResponse.json(
    { authenticated: isAuthenticated },
    { status: isAuthenticated ? 200 : 401 }
  )
}
