'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useFavorites } from '@/lib/favorites'
import { NAV_ITEMS, SHOP_NAV, isNavActive } from './SiteNav'
import { SearchOverlay } from './SearchOverlay'

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 text-white hover:text-white" aria-label="盆栽コレクション トップへ">
      <span className="flex h-[22px] w-[22px] items-center justify-center bg-gold font-mincho text-xs font-bold" aria-hidden="true">盆</span>
      <span className="font-mincho text-base font-bold tracking-[0.12em] lg:text-[17px]">盆栽コレクション</span>
    </Link>
  )
}

export function Header() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { ids: favorites } = useFavorites()
  const [pcOpen, setPcOpen] = useState(false)
  const [spOpen, setSpOpen] = useState(false)
  const [query, setQuery] = useState('')
  const closePc = useCallback(() => setPcOpen(false), [])
  const closeSp = useCallback(() => setSpOpen(false), [])
  const shopActive = isNavActive(pathname, SHOP_NAV.match)
  const favActive = pathname === '/favorites'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setPcOpen(false)
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-navy text-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-8 px-4 lg:px-12">
        <Logo />

        <Link
          href={SHOP_NAV.href}
          aria-current={shopActive ? 'page' : undefined}
          className={`hidden h-9 items-center border px-[18px] text-[13.5px] tracking-[0.08em] lg:flex ${
            shopActive ? 'border-white bg-white font-bold text-navy hover:text-navy' : 'border-white/60 text-white hover:bg-white/10 hover:text-white'
          }`}
        >
          {SHOP_NAV.label}
        </Link>

        {/* PC：ヘッダーの検索欄（入力すると候補を表示） */}
        <form onSubmit={submit} className="relative hidden w-[260px] focus-within:w-[360px] lg:block" role="search">
          <input
            type="search"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setPcOpen(true)
            }}
            onFocus={() => setPcOpen(true)}
            placeholder="樹種・商品名・記事を検索"
            aria-label="サイト内を検索"
            className="h-[34px] w-full border-b border-white/35 bg-transparent text-[13px] text-white outline-none placeholder:text-white/60 focus:border-white"
          />
          <SearchOverlay open={pcOpen} onClose={closePc} variant="dropdown" query={query} />
        </form>

        <nav className="ml-auto hidden items-center gap-[26px] text-[12.5px] lg:flex" aria-label="メインメニュー">
          {NAV_ITEMS.map(item => {
            const active = isNavActive(pathname, item.match)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={active ? 'font-bold text-white hover:text-white' : 'text-white/75 hover:text-white'}
              >
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/favorites"
            aria-current={favActive ? 'page' : undefined}
            className={favActive ? 'font-bold text-white hover:text-white' : 'text-white/90 hover:text-white'}
          >
            気になる{favorites.length > 0 && <span className="ml-1">{favorites.length}</span>}
          </Link>
        </nav>

        {/* スマホ：検索画面を開く */}
        <button type="button" onClick={() => setSpOpen(true)} className="ml-auto text-[13px] text-white lg:hidden">
          検索
        </button>
      </div>
      <SearchOverlay open={spOpen} onClose={closeSp} variant="sheet" />
    </header>
  )
}
