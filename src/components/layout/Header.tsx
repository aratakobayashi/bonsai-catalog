'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { NAV_ITEMS, isNavActive } from './SiteNav'
import { SearchOverlay } from './SearchOverlay'

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 text-white" aria-label="盆栽コレクション トップへ">
      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-gold font-mincho text-base font-bold">盆</span>
      <span className="font-mincho text-[17px] font-bold tracking-[0.06em] lg:text-[19px]">盆栽コレクション</span>
    </Link>
  )
}

export function Header() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [pcOpen, setPcOpen] = useState(false)
  const [spOpen, setSpOpen] = useState(false)
  const [query, setQuery] = useState('')
  const closePc = useCallback(() => setPcOpen(false), [])
  const closeSp = useCallback(() => setSpOpen(false), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setPcOpen(false)
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-7 px-4 lg:h-16 lg:px-10">
        <Logo />

        {/* PC：ヘッダーの検索欄（押すと候補を表示） */}
        <form onSubmit={submit} className="relative hidden max-w-[420px] flex-1 lg:block" role="search">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setPcOpen(true)}
            placeholder="樹種・商品名・記事を検索"
            aria-label="サイト内を検索"
            className="h-[38px] w-full rounded-lg bg-white/[0.12] px-3.5 text-[13.5px] text-white placeholder:text-white/75 outline-none focus:bg-white/20"
          />
          <SearchOverlay open={pcOpen} onClose={closePc} variant="dropdown" />
        </form>

        <nav className="ml-auto hidden items-center gap-6 text-sm lg:flex" aria-label="メインメニュー">
          {NAV_ITEMS.map(item => {
            const active = isNavActive(pathname, item.match)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={active ? 'border-b-2 border-gold pb-[3px] font-bold' : 'pb-[5px] hover:text-gold-light'}
              >
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/about"
            aria-current={pathname === '/about' ? 'page' : undefined}
            className={pathname === '/about' ? 'border-b-2 border-gold pb-[3px] font-bold' : 'pb-[5px] hover:text-gold-light'}
          >
            このサイトについて
          </Link>
        </nav>

        {/* スマホ：検索画面を開く */}
        <button type="button" onClick={() => setSpOpen(true)} className="ml-auto text-[13px] text-gold-light lg:hidden">
          検索
        </button>
      </div>
      <SearchOverlay open={spOpen} onClose={closeSp} variant="sheet" />
    </header>
  )
}
