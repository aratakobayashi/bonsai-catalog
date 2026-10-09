'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { normalizeText } from '@/lib/search-normalize'
import { formatPrice } from '@/lib/utils'

const RECENT_KEY = 'bonsai-recent-searches'
const PURPOSES = [
  { label: 'はじめての一鉢', href: '/selection/beginner-mini-bonsai' },
  { label: '贈り物に', href: '/selection/bonsai-gift' },
  { label: '正月に飾る', href: '/selection/new-year-bonsai' },
  { label: '鉢・土・道具', href: '/selection/starter-tools' },
]

interface Species {
  slug: string
  name: string
  count: number
  season: string
}

interface Suggestions {
  q: string
  total: number
  species: Species[]
  products: { id: string; name: string; price: number }[]
  articles: { slug: string; title: string }[]
}

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

function saveRecent(term: string) {
  const q = term.trim()
  if (q) writeRecent([q, ...readRecent().filter(r => r !== q)])
}

// 入力した文字に当たる部分を金色にする（ひらがな・カタカナ・全角半角の違いは無視する）
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = normalizeText(query.trim())
  if (!needle) return <>{text}</>
  const chars = Array.from(text)
  const normalized = chars.map(c => normalizeText(c))
  const joined = normalized.join('')
  const at = joined.indexOf(needle)
  if (at < 0) return <>{text}</>
  let pos = 0
  let start = -1
  let end = chars.length
  for (let i = 0; i < chars.length; i++) {
    if (start < 0 && pos >= at) start = i
    pos += normalized[i].length
    if (start >= 0 && pos >= at + needle.length) {
      end = i + 1
      break
    }
  }
  if (start < 0) return <>{text}</>
  return (
    <>
      {chars.slice(0, start).join('')}
      <span className="text-gold-dark">{chars.slice(start, end).join('')}</span>
      {chars.slice(end).join('')}
    </>
  )
}

// 候補の取得（入力が止まって150ms後に問い合わせ、古い問い合わせは取り消す）
function useSuggestions(query: string, enabled: boolean) {
  const [data, setData] = useState<Suggestions | null>(null)
  const cache = useRef(new Map<string, Suggestions>())
  const q = query.trim()

  useEffect(() => {
    if (!enabled || !q) return
    const cached = cache.current.get(q)
    if (cached) {
      setData(cached)
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/search-suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then(res => (res.ok ? res.json() : null))
        .then((json: Suggestions | null) => {
          if (!json) return
          cache.current.set(q, json)
          setData(json)
        })
        .catch(() => {
          // 取り消し・通信エラー時は候補を出さない（「商品を探す」は使える）
        })
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [q, enabled])

  // 次の候補が届くまでは前の候補を出したままにする（件数は入力と一致するときだけ出す）
  return { suggestions: q ? data : null, fresh: Boolean(data && data.q === q.slice(0, 50)) }
}

// 入力前の「樹種から」（商品がある樹種だけ）
function useFeaturedSpecies(enabled: boolean) {
  const [species, setSpecies] = useState<Species[]>([])
  useEffect(() => {
    if (!enabled || species.length) return
    const controller = new AbortController()
    fetch('/api/search-suggest', { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then(json => json?.species && setSpecies(json.species))
      .catch(() => {})
    return () => controller.abort()
  }, [enabled, species.length])
  return species
}

function GroupLabel({ children }: { children: ReactNode }) {
  return <h2 className="mb-1 text-[11px] tracking-[0.08em] text-ink-muted">{children}</h2>
}

const rowClass = 'flex items-baseline gap-3 border-b border-paper-deep py-[9px] outline-none hover:text-gold-dark focus-visible:bg-paper-deep max-lg:py-[11px]'

// 検索画面（スマホは全画面、PCはヘッダーの検索欄の下に表示）
export function SearchOverlay({ open, onClose, variant, query: externalQuery }: { open: boolean; onClose: () => void; variant: 'sheet' | 'dropdown'; query?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [ownQuery, setOwnQuery] = useState('')
  const [recent, setRecent] = useState<string[]>([])
  const query = variant === 'dropdown' ? externalQuery ?? '' : ownQuery
  const q = query.trim()
  const { suggestions, fresh } = useSuggestions(query, open)
  const featured = useFeaturedSpecies(open && !q)

  useEffect(() => {
    if (!open) return
    setRecent(readRecent())
    if (variant === 'sheet') inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, variant])

  // PC：検索欄（親のフォーム）の外を押したら閉じる。フォームの送信（Enter）も履歴に残す
  useEffect(() => {
    if (!open || variant !== 'dropdown') return
    const form = panelRef.current?.closest('form')
    const onDown = (e: MouseEvent) => {
      if (form && !form.contains(e.target as Node)) onClose()
    }
    const onSubmit = () => saveRecent((form?.querySelector('input[type="search"]') as HTMLInputElement | null)?.value ?? '')
    document.addEventListener('mousedown', onDown)
    form?.addEventListener('submit', onSubmit)
    return () => {
      document.removeEventListener('mousedown', onDown)
      form?.removeEventListener('submit', onSubmit)
    }
  }, [open, variant, onClose])

  // スマホ：検索画面の表示中は後ろのページをスクロールさせない
  useEffect(() => {
    if (!open || variant !== 'sheet') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, variant])

  // ページを移動したら閉じる
  const firstPath = useRef(pathname)
  useEffect(() => {
    if (pathname !== firstPath.current) {
      firstPath.current = pathname
      onClose()
    }
  }, [pathname, onClose])

  const search = (term: string) => {
    const t = term.trim()
    if (!t) return
    saveRecent(t)
    onClose()
    router.push(`/products?q=${encodeURIComponent(t)}`)
  }

  // 候補を選んだときも、入力した言葉を履歴に残す
  const follow = () => {
    saveRecent(q)
    onClose()
  }

  const removeRecent = (term: string) => {
    const next = recent.filter(r => r !== term)
    setRecent(next)
    writeRecent(next)
  }

  if (!open) return null

  const typed = (
    <div>
      {suggestions && suggestions.species.length > 0 && (
        <section className="pb-1 pt-3 max-lg:pt-3.5">
          <GroupLabel>樹種</GroupLabel>
          <ul>
            {suggestions.species.map(s => (
              <li key={s.slug}>
                <Link href={`/products/category/${s.slug}`} onClick={follow} className={rowClass}>
                  <span className="flex-1 font-mincho text-base font-bold leading-normal tracking-[0.04em] max-lg:text-[17px]">
                    <Highlight text={s.name} query={q} />
                  </span>
                  <span className="shrink-0 text-[11.5px] text-ink-muted">
                    {s.count.toLocaleString()}件{s.season && `・${s.season}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {suggestions && suggestions.products.length > 0 && (
        <section className="pb-1 pt-3 max-lg:pt-3.5">
          <GroupLabel>商品</GroupLabel>
          <ul>
            {suggestions.products.map(p => (
              <li key={p.id}>
                <Link href={`/products/${p.id}`} onClick={follow} className={rowClass}>
                  <span className="line-clamp-2 flex-1 text-[13.5px] leading-normal max-lg:text-sm">
                    <Highlight text={p.name} query={q} />
                  </span>
                  <span className="shrink-0 text-[11.5px] text-ink-muted">{formatPrice(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {suggestions && suggestions.articles.length > 0 && (
        <section className="pb-1 pt-3 max-lg:pt-3.5">
          <GroupLabel>育て方</GroupLabel>
          <ul>
            {suggestions.articles.map(a => (
              <li key={a.slug}>
                <Link href={`/guides/${a.slug}`} onClick={follow} className={rowClass}>
                  <span className="flex-1 text-[13.5px] leading-normal max-lg:text-sm">
                    <Highlight text={a.title} query={q} />
                  </span>
                  <span className="shrink-0 text-[11.5px] text-ink-muted">記事</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-3.5 max-lg:mt-[18px]">
        <button
          type="button"
          onClick={() => search(q)}
          className={
            variant === 'dropdown'
              ? 'border-b border-ink pb-px text-[13px] text-ink hover:text-gold-dark'
              : 'flex h-[50px] w-full items-center justify-center bg-sumi px-4 text-sm tracking-[0.08em] text-paper'
          }
        >
          「{q}」で商品を探す{suggestions && fresh && `（${suggestions.total.toLocaleString()}件）`}
        </button>
      </div>
    </div>
  )

  const empty = (
    <div className="space-y-7">
      {recent.length > 0 && (
        <section>
          <GroupLabel>最近の検索</GroupLabel>
          <ul className="mt-2 border-t border-line">
            {recent.map(term => (
              <li key={term} className="flex items-center border-b border-paper-deep">
                <button type="button" onClick={() => search(term)} className="flex-1 py-[13px] text-left text-sm text-ink hover:text-gold-dark">
                  {term}
                </button>
                <button type="button" onClick={() => removeRecent(term)} aria-label={`${term}を履歴から削除`} className="-mr-2 px-2 py-2 text-ink-muted hover:text-ink">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {featured.length > 0 && (
        <section>
          <GroupLabel>樹種から</GroupLabel>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {featured.map(s => (
              <li key={s.slug}>
                <Link href={`/products/category/${s.slug}`} onClick={onClose} className="font-mincho text-[17px] font-bold tracking-[0.04em] text-ink hover:text-gold-dark">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <GroupLabel>目的から</GroupLabel>
        <ul className="mt-2 border-t border-line">
          {PURPOSES.map(p => (
            <li key={p.href}>
              <Link href={p.href} onClick={onClose} className="flex items-center justify-between border-b border-paper-deep py-[13px] text-sm text-ink hover:text-gold-dark">
                {p.label}
                <span className="text-xs text-ink-muted" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )

  const body = q ? typed : empty

  if (variant === 'dropdown') {
    return (
      <>
        {/* ヘッダーより下のページを薄く覆う（押すと閉じる） */}
        <div className="fixed inset-x-0 bottom-0 top-14 bg-paper/75" onClick={onClose} aria-hidden="true" />
        <div
          ref={panelRef}
          role="region"
          aria-label="検索候補"
          className="absolute left-0 top-full z-10 mt-[11px] max-h-[calc(100vh-88px)] w-[510px] overflow-y-auto border border-line bg-white px-6 pb-[18px] pt-2 text-ink shadow-[0_18px_40px_rgba(34,32,28,0.1)]"
        >
          <div className={q ? '' : 'py-3'}>{body}</div>
        </div>
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-paper text-ink" role="dialog" aria-modal="true" aria-label="検索">
      <form
        role="search"
        className="flex h-14 shrink-0 items-center gap-3 bg-navy pl-5 pr-4 text-white"
        onSubmit={e => {
          e.preventDefault()
          search(ownQuery)
        }}
      >
        <input
          ref={inputRef}
          type="search"
          value={ownQuery}
          onChange={e => setOwnQuery(e.target.value)}
          placeholder="樹種・商品名・記事を検索"
          aria-label="サイト内を検索"
          enterKeyHint="search"
          className="h-9 min-w-0 flex-1 rounded-none border-b border-white/50 bg-transparent text-[15px] text-white outline-none placeholder:text-white/60 focus:border-white"
        />
        <button type="button" onClick={onClose} className="shrink-0 text-[13px] text-white">閉じる</button>
      </form>
      <div className={`flex-1 overflow-y-auto px-5 ${q ? 'py-1.5' : 'py-5'}`}>{body}</div>
    </div>
  )
}
