'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const RECENT_KEY = 'bonsai-recent-searches'
const POPULAR = ['五葉松', 'もみじ', '黒松', '真柏', 'ミニ盆栽', '盆栽鉢']
const PURPOSES = [
  { label: '室内で楽しむ', href: '/selection/indoor-bonsai' },
  { label: 'はじめての一鉢', href: '/selection/beginner-mini-bonsai' },
  { label: '贈り物に', href: '/selection/bonsai-gift' },
  { label: '正月に飾る', href: '/selection/new-year-bonsai' },
  { label: '3,000円以下', href: '/selection/bonsai-under-3000' },
  { label: '鉢・土・道具', href: '/selection/starter-tools' },
]
const BUDGETS = [
  { label: '〜3,000円', href: '/products?max=3000' },
  { label: '〜5,000円', href: '/products?max=5000' },
  { label: '〜10,000円', href: '/products?max=10000' },
  { label: '10,000円〜', href: '/products?min=10000' },
]

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 5)
  } catch {
    return []
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)))
  } catch {
    // 保存できない環境（プライベートモードなど）では履歴を残さない
  }
}

// 検索画面（スマホは全画面、PCはヘッダーの検索欄の下に表示）
export function SearchOverlay({ open, onClose, variant }: { open: boolean; onClose: () => void; variant: 'sheet' | 'dropdown' }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setRecent(readRecent())
    if (variant === 'sheet') inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, variant])

  const search = (term: string) => {
    const q = term.trim()
    if (!q) return
    writeRecent([q, ...readRecent().filter(r => r !== q)])
    onClose()
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }

  const removeRecent = (term: string) => {
    const next = recent.filter(r => r !== term)
    setRecent(next)
    writeRecent(next)
  }

  if (!open) return null

  const body = (
    <div className="space-y-6 px-4 py-5 lg:px-5">
      {query.trim() && (
        <div className="space-y-2 text-sm">
          <button type="button" onClick={() => search(query)} className="block w-full text-left text-navy hover:text-gold-dark">
            「{query.trim()}」の商品を探す →
          </button>
          <Link href={`/guides?search=${encodeURIComponent(query.trim())}`} onClick={onClose} className="block text-navy hover:text-gold-dark">
            「{query.trim()}」の記事を探す →
          </Link>
        </div>
      )}
      {recent.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-ink-soft">最近の検索</h2>
          <ul className="mt-2 divide-y divide-line">
            {recent.map(term => (
              <li key={term} className="flex items-center justify-between py-2.5">
                <button type="button" onClick={() => search(term)} className="text-[15px] text-ink">{term}</button>
                <button type="button" onClick={() => removeRecent(term)} aria-label={`${term}を履歴から削除`} className="px-2 text-ink-muted">×</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2 className="text-xs font-bold text-ink-soft">よく探されている</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {POPULAR.map(term => (
            <button key={term} type="button" onClick={() => search(term)} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink hover:border-gold">
              {term}
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-bold text-ink-soft">目的から</h2>
          <Link href="/selection" onClick={onClose} className="text-xs text-navy underline">特集をすべて見る</Link>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {PURPOSES.map(p => (
            <Link key={p.href} href={p.href} onClick={onClose} className="rounded-lg bg-paper px-3 py-3 text-sm font-bold text-ink hover:bg-gold-light">
              {p.label}
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xs font-bold text-ink-soft">予算から</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {BUDGETS.map(b => (
            <Link key={b.href} href={b.href} onClick={onClose} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink hover:border-gold">
              {b.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )

  if (variant === 'dropdown') {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-white text-ink shadow-xl">
          {body}
        </div>
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="検索">
      <form
        className="flex items-center gap-3 border-b border-line px-4 py-3"
        onSubmit={e => {
          e.preventDefault()
          search(query)
        }}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="樹種・商品名・記事を検索"
          enterKeyHint="search"
          className="h-11 flex-1 rounded-lg border border-navy px-3 text-[15px] text-ink outline-none"
        />
        <button type="button" onClick={onClose} className="text-sm text-navy">閉じる</button>
      </form>
      <div className="flex-1 overflow-y-auto">{body}</div>
    </div>
  )
}
