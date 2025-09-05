'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Package, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    label: 'ホーム',
    icon: Home,
  },
  {
    href: '/products',
    label: '商品一覧',
    icon: Package,
  },
  {
    href: '/gardens',
    label: '盆栽園',
    icon: User,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* 背景とぼかし効果 */}
      <div className="bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-luxury">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
              
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex flex-col items-center justify-center space-y-1 py-2 px-3 rounded-lg',
                    'transition-all duration-200 ease-luxury',
                    'active:scale-95 hover:bg-neutral-50',
                    'focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2',
                    isActive 
                      ? 'text-accent-600 bg-accent-50' 
                      : 'text-neutral-600 hover:text-primary-700'
                  )}
                  aria-label={`${label}ページに移動`}
                >
                  <div className="relative">
                    <Icon 
                      className={cn(
                        'h-5 w-5 transition-all duration-200',
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      )} 
                    />
                    {/* アクティブ時のパルス効果 */}
                    {isActive && (
                      <div className="absolute inset-0 animate-pulse-glow">
                        <Icon className="h-5 w-5 text-accent-400 opacity-50" />
                      </div>
                    )}
                  </div>
                  <span 
                    className={cn(
                      'text-xs font-medium transition-all duration-200',
                      isActive ? 'text-accent-700' : 'text-neutral-500'
                    )}
                  >
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Safe area for iPhone home indicator */}
      <div 
        className="bg-white/95 backdrop-blur-md border-t border-neutral-200" 
        style={{ height: 'env(safe-area-inset-bottom)' }}
      />
    </nav>
  )
}