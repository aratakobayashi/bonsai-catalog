import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // 環境変数からパスワードを確認
    const adminPassword = process.env.ADMIN_PASSWORD || 'bonsai-admin-2025'
    
    if (password === adminPassword) {
      // セッションクッキーを設定（24時間有効）
      const cookieStore = cookies()
      const sessionToken = Buffer.from(`admin:${Date.now()}`).toString('base64')
      
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24時間
        path: '/',
      })
      
      return response
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}