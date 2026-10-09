'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, SHOP_NAV, isNavActive } from './SiteNav'

// スマホの下部タブ（ホーム・盆栽を探す・育て方・盆栽園・イベント）
export function BottomNavigation() {
  const pathname = usePathname() || '/'
  const items = [{ href: '/', label: 'ホーム', match: ['/'] as readonly string[] }, SHOP_NAV, ...NAV_ITEMS]
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="下部メニュー"
    >
      <ul className="grid h-14 grid-cols-[1fr_1.45fr_1fr_1fr_1fr]">
        {items.map(item => {
          const active = item.href === '/' ? pathname === '/' : isNavActive(pathname, item.match)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-full items-center justify-center text-[11.5px] ${
                  active ? 'bg-navy font-bold text-white hover:text-white' : 'text-ink-soft'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
