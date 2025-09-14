import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'

export async function GET() {
  try {
    const isAuthenticated = checkAdminAuth()
    
    if (isAuthenticated) {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}