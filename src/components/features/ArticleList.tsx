import Link from 'next/link'
import { GuideArticleCard } from '@/components/article/GuideArticleCard'
import type { ArticleListResponse, ArticleFilters } from '@/types'

// 一覧の URL を組み立てる（overrides に undefined を渡すとその条件を外す。ページ番号は指定がなければ外す）
export function guidesHref(current: ArticleFilters, overrides: Partial<Record<'category' | 'search' | 'sortBy' | 'tags' | 'page', string | undefined>> = {}) {
  const base: Record<string, string | undefined> = {
    category: current.category,
    tags: current.tags?.join(','),
    search: current.search,
    sortBy: current.sortBy,
    page: undefined,
  }
  const merged = { ...base, ...overrides }
  const params = new URLSearchParams()
  Object.entries(merged).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const qs = params.toString()
  return qs ? `/guides?${qs}` : '/guides'
}

interface ArticleListProps {
  articlesData: ArticleListResponse
  currentFilters: ArticleFilters
}

export function ArticleList({ articlesData, currentFilters }: ArticleListProps) {
  const { articles, currentPage, totalPages } = articlesData

  if (articles.length === 0) {
    return (
      <div className="border-y border-line px-6 py-14 text-center lg:mt-2">
        <p className="font-mincho text-lg font-bold tracking-[0.04em] text-ink">記事が見つかりませんでした</p>
        <p className="mt-2 text-sm text-ink-soft">検索条件を変更するか、絞り込みを解除してお試しください。</p>
        <Link href="/guides" className="mt-6 inline-block border-b border-ink pb-0.5 text-sm text-ink">
          すべての記事を見る
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
        {articles.map((article, i) => (
          <GuideArticleCard key={article.id} article={article} priority={i < 3} />
        ))}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} currentFilters={currentFilters} />}
    </div>
  )
}

// ページ送り（先頭・前後・末尾を出し、間は … で省略）
function Pagination({ currentPage, totalPages, currentFilters }: { currentPage: number; totalPages: number; currentFilters: ArticleFilters }) {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  if (currentPage <= 3) [2, 3].forEach(p => pages.add(p))
  if (currentPage >= totalPages - 2) [totalPages - 1, totalPages - 2].forEach(p => pages.add(p))
  const sorted = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const items: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push('gap')
    items.push(p)
  })

  const href = (p: number) => guidesHref(currentFilters, { page: p > 1 ? String(p) : undefined })
  const item = 'flex h-9 min-w-[28px] items-center justify-center px-1 text-sm'

  return (
    <nav aria-label="ページ送り" className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:mt-12 lg:gap-x-6">
      {currentPage > 1 && (
        <Link href={href(currentPage - 1)} className={`${item} text-ink-muted hover:text-ink`} aria-label="前のページ">
          ‹
        </Link>
      )}
      {items.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className={`${item} text-ink-muted`}>…</span>
        ) : p === currentPage ? (
          <span key={p} className={item} aria-current="page">
            <span className="border-b border-ink text-ink">{p}</span>
          </span>
        ) : (
          <Link key={p} href={href(p)} className={`${item} text-ink-muted hover:text-ink`}>
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={href(currentPage + 1)} className={`${item} text-ink-muted hover:text-ink`} aria-label="次のページ">
          ›
        </Link>
      )}
    </nav>
  )
}
