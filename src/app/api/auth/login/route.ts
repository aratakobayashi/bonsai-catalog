import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // ADMIN_PASSWORD が未設定の環境ではログイン自体を無効にする
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Admin login is disabled' },
        { status: 503 }
      )
    }

    const { password } = await request.json()

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
