'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, isNavActive } from './SiteNav'

// スマホの下部タブ（ホーム・探す・育て方・出かける）
export function BottomNavigation() {
  const pathname = usePathname() || '/'
  const items = [{ href: '/', label: 'ホーム', match: ['/'] as readonly string[] }, ...NAV_ITEMS]
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="メインメニュー"
    >
      <ul className="grid h-14 grid-cols-4">
        {items.map(item => {
          const active = item.href === '/' ? pathname === '/' : isNavActive(pathname, item.match)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-full items-center justify-center text-[12px] ${active ? 'font-bold text-navy' : 'text-ink-muted'}`}
              >
                {active && <span className="absolute top-0 h-[3px] w-6 rounded-b bg-gold" aria-hidden="true" />}
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
