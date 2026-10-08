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
      <div className="rounded-xl border border-line bg-white px-6 py-12 text-center">
        <p className="font-mincho text-lg font-bold text-navy">記事が見つかりませんでした</p>
        <p className="mt-2 text-sm text-ink-soft">検索条件を変更するか、絞り込みを解除してお試しください。</p>
        <Link href="/guides" className="mt-5 inline-block rounded-lg border border-line px-4 py-2 text-sm text-ink hover:border-gold">
          すべての記事を見る
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white lg:grid lg:grid-cols-3 lg:gap-5 lg:divide-y-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
        {articles.map(article => (
          <GuideArticleCard key={article.id} article={article} />
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
  const box = 'flex h-[38px] min-w-[38px] items-center justify-center rounded-lg px-2 text-[13.5px]'

  return (
    <nav aria-label="ページ送り" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      {currentPage > 1 && (
        <Link href={href(currentPage - 1)} className={`${box} border border-line bg-white text-ink hover:border-gold`} aria-label="前のページ">
          ‹
        </Link>
      )}
      {items.map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className={`${box} border border-line bg-white text-ink-muted`}>…</span>
        ) : item === currentPage ? (
          <span key={item} className={`${box} bg-navy font-bold text-white`} aria-current="page">{item}</span>
        ) : (
          <Link key={item} href={href(item)} className={`${box} border border-line bg-white text-ink hover:border-gold`}>
            {item}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={href(currentPage + 1)} className={`${box} border border-line bg-white text-ink hover:border-gold`} aria-label="次のページ">
          ›
        </Link>
      )}
    </nav>
  )
}
