'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// 簡易認証チェック（クライアント側）
function useAuthCheck() {
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        if (!response.ok) {
          router.push('/admin/login')
        }
      } catch (error) {
        router.push('/admin/login')
      }
    }
    
    checkAuth()
  }, [router])
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 認証チェック
  useAuthCheck()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 管理画面ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                記事管理システム
              </h1>
            </div>
            <nav className="flex items-center space-x-8">
              <a 
                href="/admin/articles"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                記事一覧
              </a>
              <a 
                href="/admin/articles/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                新規作成
              </a>
              <a 
                href="/guides"
                target="_blank"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                サイトを見る
              </a>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/admin/login'
                }}
                className="text-red-500 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                ログアウト
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}