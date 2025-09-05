'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const Header = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'ホーム' },
    { href: '/products', label: '商品一覧' },
    { href: '/gardens', label: '盆栽園紹介' },
  ]

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-bonsai-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">盆</span>
            </div>
            <span className="text-xl font-bold text-bonsai-green-800">
              盆栽コレクション
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-bonsai-green-600',
                  pathname === href
                    ? 'text-bonsai-green-600'
                    : 'text-gray-600'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-bonsai-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export { Header }