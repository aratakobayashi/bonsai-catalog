'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Search, Menu, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const Header = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'ホーム' },
    { href: '/products', label: '商品一覧' },
    { href: '/guides', label: '記事ガイド' },
    { href: '/gardens', label: '盆栽園紹介' },
    { href: '/events', label: 'イベント' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-gradient-primary shadow-luxury backdrop-blur-md border-b border-primary-700/20">
      <div className="container mx-auto px-4">
        <div className="flex h-18 items-center justify-between">
          {/* ロゴセクション */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-accent flex items-center justify-center shadow-luxury group-hover:shadow-hover transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">盆</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-accent rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white group-hover:text-accent-100 transition-colors duration-200">
                盆栽コレクション
              </span>
              <span className="text-xs text-primary-200 font-medium hidden sm:block">
                BONSAI COLLECTION
              </span>
            </div>
          </Link>

          {/* 検索バー（デスクトップ） */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="商品名で検索..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                  pathname === href
                    ? 'text-accent-200 bg-white/10 shadow-md'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* 右側アクション */}
          <div className="flex items-center space-x-4">
            {/* 検索ボタン（モバイル） */}
            <button className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <Search className="h-5 w-5" />
            </button>

            {/* ショッピングバッグ（将来の機能拡張用） */}
            <button className="hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </button>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-primary-700/20 bg-primary-800/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* モバイル検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="商品名で検索..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/20 rounded-lg text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
              />
            </div>

            {/* モバイルナビゲーション */}
            <nav className="space-y-2">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                    pathname === href
                      ? 'text-accent-200 bg-white/10'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* モバイル専用アクション */}
            <div className="pt-4 border-t border-primary-700/20">
              <Button variant="secondary" size="md" className="w-full justify-center">
                <ShoppingBag className="h-4 w-4 mr-2" />
                ショッピングカート (0)
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export { Header }