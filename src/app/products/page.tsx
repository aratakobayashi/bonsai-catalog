import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ENJOY_OPTIONS,
  FLAG_OPTIONS,
  LEVEL_OPTIONS,
  PLACE_OPTIONS,
  SEASON_OPTIONS,
  USE_OPTIONS,
  relaxSuggestions,
  type FilterKey,
  SIZE_OPTIONS,
  SPECIES_OPTIONS,
  TYPE_OPTIONS,
  buildCatalogUrl,
  filterProducts,
  getCatalogProducts,
  hasActiveFilters,
  paginate,
  parseFilters,
  type CatalogFilters,
} from '@/lib/catalog'
import { formatPrice } from '@/lib/utils'
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser'
import { CatalogSearchTracker } from '@/components/analytics/CatalogSearchTracker'

interface ProductsPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

const TITLE = '盆栽・鉢・道具を探す｜楽天市場とAmazonの盆栽を価格・樹種・サイズで比較 - 盆栽コレクション'
const DESCRIPTION = '楽天市場とAmazonの盆栽・苔玉・盆栽鉢・土・道具を、樹種・価格・サイズ・送料無料・レビュー件数でまとめて絞り込み、比較できます。'

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

const labelOf = (options: readonly { value: string; label: string }[], value: string | undefined) =>
  options.find(o => o.value === value)?.label ?? ''

// 0件のときの案内文（「○○」を外すと N件）に使う、条件の名前
function filterKeyLabel(filters: CatalogFilters, key: FilterKey): string {
  switch (key) {
    case 'q': return `キーワード「${filters.q}」`
    case 'type': return `種類「${labelOf(TYPE_OPTIONS, filters.type)}」`
    case 'species': return `樹種「${labelOf(SPECIES_OPTIONS, filters.species)}」`
    case 'size': return `サイズ「${labelOf(SIZE_OPTIONS, filters.size)}」`
    case 'shop': return 'ショップの指定'
    case 'price': return '価格の指定'
    case 'place': return `「${labelOf(PLACE_OPTIONS, filters.place)}」`
    case 'enjoy': return `「${labelOf(ENJOY_OPTIONS, filters.enjoy)}」`
    case 'season': return `見ごろ「${labelOf(SEASON_OPTIONS, filters.season)}」`
    case 'level': return `「${labelOf(LEVEL_OPTIONS, filters.level)}」`
    case 'use': return `用途「${labelOf(USE_OPTIONS, filters.use)}」`
    case 'flags': return 'こだわり条件'
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
  const all = await getCatalogProducts()
  const filtered = filterProducts(all, filters)
  const { items, page, totalPages, total } = paginate(filtered, filters.page)
  const suggestions = total === 0 ? relaxSuggestions(all, filters) : []
  const selectedId = typeof searchParams.p === 'string' ? searchParams.p : undefined
  const activeCount = activeFilterKeys(filters).filter(k => !k.startsWith('q')).length

  const emptyState = (
    <div className="rounded-xl border border-line bg-white p-5 text-ink-soft">
      <p className="mb-3 font-bold text-ink">条件に合う商品が見つかりませんでした。</p>
      {suggestions.length > 0 && (
        <>
          <p className="mb-2 text-sm">条件を1つ外すと、次の商品が見つかります。</p>
          <ul className="mb-4 space-y-2 text-sm">
            {suggestions.map(suggestion => (
              <li key={suggestion.key}>
                <Link href={buildCatalogUrl(suggestion.filters)} className="font-bold text-navy underline">
                  {filterKeyLabel(filters, suggestion.key)}を外す（{suggestion.count.toLocaleString()}件）
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link href="/products" className="text-sm underline">条件をすべてクリアする</Link>
      <p className="mt-3 text-sm">
        <Link href="/shindan" className="text-navy underline">何を選べばよいか迷ったら、かんたん盆栽診断（4つの質問）</Link>
      </p>
    </div>
  )

  return (
    <>
      <CatalogSearchTracker
        searchTerm={filters.q}
        filterKeys={activeFilterKeys(filters).join(',')}
        resultCount={total}
      />
      <h1 className="sr-only">盆栽・鉢・道具を探す（楽天市場・Amazonの商品{all.length.toLocaleString()}件）</h1>
      <CatalogBrowser
        filters={filters}
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        selectedId={selectedId}
        emptyState={emptyState}
        activeCount={activeCount}
        intro={filters.q ? <p className="text-sm text-ink">「<span className="font-bold">{filters.q}</span>」の検索結果</p> : undefined}
      />
    </>
  )
}
