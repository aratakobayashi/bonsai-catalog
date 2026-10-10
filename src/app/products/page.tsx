import type { Metadata } from 'next'
import { SHOP_NAMES_AND } from '@/lib/affiliate'
import Link from 'next/link'
import {
  filterProducts,
  getCatalogProducts,
  hasActiveFilters,
  optionCounts,
  paginate,
  parseFilters,
  type CatalogFilters,
  type CatalogProduct,
} from '@/lib/catalog'
import { CatalogBrowser, buildCatalogTabs } from '@/components/catalog/CatalogBrowser'
import { CatalogEmptyState } from '@/components/catalog/CatalogFilters'
import { CatalogLoadError } from '@/components/catalog/CatalogLoadError'
import { SELECTIONS } from '@/lib/selections'
import { SITE_TOOLS } from '@/components/layout/site-tools'
import { CareIcon } from '@/components/catalog/CareIcon'
import { CatalogSearchTracker } from '@/components/analytics/CatalogSearchTracker'

interface ProductsPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

const TITLE = `盆栽・鉢・道具を探す｜${SHOP_NAMES_AND}の盆栽を価格・樹種・サイズで比較 - 盆栽コレクション`
const DESCRIPTION = `${SHOP_NAMES_AND}の盆栽・苔玉・盆栽鉢・土・道具を、樹種・価格・サイズ・送料込・レビュー件数でまとめて絞り込み、比較できます。`

// 絞り込み・ページ送りのURLは検索結果に出さず、一覧トップに正規化する
export function generateMetadata({ searchParams }: ProductsPageProps): Metadata {
  const filtered = hasActiveFilters(parseFilters(searchParams))
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/products' },
    ...(filtered && { robots: { index: false, follow: true } }),
  }
}

function activeFilterKeys(filters: CatalogFilters): string[] {
  const keys: string[] = []
  if (filters.q) keys.push('q')
  if (filters.type) keys.push(`type:${filters.type}`)
  if (filters.species) keys.push(`species:${filters.species}`)
  if (filters.size) keys.push(`size:${filters.size}`)
  if (filters.shop) keys.push(`shop:${filters.shop}`)
  if (filters.min || filters.max) keys.push('price')
  if (filters.place) keys.push(`place:${filters.place}`)
  if (filters.enjoy) keys.push(`enjoy:${filters.enjoy}`)
  if (filters.season) keys.push(`season:${filters.season}`)
  if (filters.level) keys.push(`level:${filters.level}`)
  if (filters.use) keys.push(`use:${filters.use}`)
  filters.flags.forEach(flag => keys.push(`flag:${flag}`))
  return keys
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = parseFilters(searchParams)
  // 一時的な取得の失敗で例外を投げると、エラーのページが ISR に残るため、案内のページを出す
  let all: CatalogProduct[]
  try {
    all = await getCatalogProducts()
  } catch (error) {
    console.error('一覧の商品データの取得に失敗しました:', error instanceof Error ? error.message : error)
    return <CatalogLoadError />
  }
  const filtered = filterProducts(all, filters)
  const { items, page, totalPages, total } = paginate(filtered, filters.page)
  const selectedId = typeof searchParams.p === 'string' ? searchParams.p : undefined
  const activeCount = activeFilterKeys(filters).filter(k => !k.startsWith('q')).length
  const speciesTabs = buildCatalogTabs(all, filters, undefined, filters.species ? undefined : total)

  const emptyState = total === 0 ? <CatalogEmptyState products={all} filters={filters} /> : null

  return (
    <>
      <CatalogSearchTracker
        searchTerm={filters.q}
        filterKeys={activeFilterKeys(filters).join(',')}
        resultCount={total}
      />
      <h1 className="sr-only">盆栽・鉢・道具を探す（{all.length.toLocaleString()}件）</h1>
      <CatalogBrowser
        filters={filters}
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        selectedId={selectedId}
        speciesTabs={speciesTabs}
        counts={optionCounts(all)}
        emptyState={emptyState}
        activeCount={activeCount}
        intro={filters.q ? (
          <p className="font-mincho text-lg font-bold tracking-[0.04em] text-ink lg:text-xl">「{filters.q}」の検索結果</p>
        ) : activeCount === 0 ? (
          <div>
            <span className="text-[11.5px] tracking-[0.08em] text-ink-muted">質問に答えて選ぶ</span>
            <div className="mt-2 mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SITE_TOOLS.filter(t => t.group === 'choose').map(t => (
                <Link key={t.href} href={t.href} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-bold text-ink hover:border-ink hover:text-ink">
                  <CareIcon name={t.icon} className="h-3.5 w-3.5 text-gold-dark" />{t.label}
                </Link>
              ))}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11.5px] tracking-[0.08em] text-ink-muted">目的から探す</span>
              <Link href="/selection" className="border-b border-ink pb-0.5 text-xs text-ink">特集をすべて見る</Link>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SELECTIONS.map(s => (
                <Link key={s.slug} href={`/selection/${s.slug}`} className="shrink-0 border border-line bg-white px-3 py-1.5 text-xs text-ink hover:border-ink hover:text-ink">{s.shortTitle}</Link>
              ))}
            </div>
          </div>
        ) : undefined}
      />
    </>
  )
}
