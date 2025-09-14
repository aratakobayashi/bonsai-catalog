import { cookies } from 'next/headers'

export function checkAdminAuth(): boolean {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('admin-session')
    
    if (!sessionCookie?.value) {
      return false
    }
    
    // セッショントークンをデコード
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString()
    const [user, timestamp] = decoded.split(':')
    
    if (user !== 'admin') {
      return false
    }
    
    // セッションの有効期限チェック（24時間）
    const sessionTime = parseInt(timestamp)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24時間
    
    return (now - sessionTime) < maxAge
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

export function requireAuth() {
  const isAuthenticated = checkAdminAuth()
  if (!isAuthenticated) {
    throw new Error('Authentication required')
  }
  return true
}