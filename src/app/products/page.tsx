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
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { formatPrice } from '@/lib/utils'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { CatalogFiltersForm, CatalogPagination } from '@/components/catalog/CatalogFilters'
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

function activeChips(filters: CatalogFilters) {
  const chips: { label: string; href: string }[] = []
  const remove = (overrides: Partial<CatalogFilters>) => buildCatalogUrl(filters, overrides)
  if (filters.q) chips.push({ label: `「${filters.q}」`, href: remove({ q: undefined }) })
  if (filters.type) chips.push({ label: TYPE_OPTIONS.find(o => o.value === filters.type)?.label ?? '', href: remove({ type: undefined }) })
  if (filters.species) chips.push({ label: SPECIES_OPTIONS.find(o => o.value === filters.species)?.label ?? '', href: remove({ species: undefined }) })
  if (filters.size) chips.push({ label: SIZE_OPTIONS.find(o => o.value === filters.size)?.label ?? '', href: remove({ size: undefined }) })
  if (filters.shop) chips.push({ label: filters.shop === 'rakuten' ? '楽天市場' : 'Amazon', href: remove({ shop: undefined }) })
  if (filters.min || filters.max) {
    chips.push({
      label: `${filters.min ? formatPrice(filters.min) : ''}〜${filters.max ? formatPrice(filters.max) : ''}`,
      href: remove({ min: undefined, max: undefined }),
    })
  }
  if (filters.place) chips.push({ label: labelOf(PLACE_OPTIONS, filters.place), href: remove({ place: undefined }) })
  if (filters.enjoy) chips.push({ label: labelOf(ENJOY_OPTIONS, filters.enjoy), href: remove({ enjoy: undefined }) })
  if (filters.season) chips.push({ label: `見ごろ：${labelOf(SEASON_OPTIONS, filters.season)}`, href: remove({ season: undefined }) })
  if (filters.level) chips.push({ label: labelOf(LEVEL_OPTIONS, filters.level), href: remove({ level: undefined }) })
  if (filters.use) chips.push({ label: labelOf(USE_OPTIONS, filters.use), href: remove({ use: undefined }) })
  filters.flags.forEach(flag => {
    chips.push({
      label: FLAG_OPTIONS.find(o => o.value === flag)?.label ?? flag,
      href: remove({ flags: filters.flags.filter(f => f !== flag) }),
    })
  })
  return chips
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
  const chips = activeChips(filters)
  const lastSynced = all.map(p => p.lastSyncedAt).filter(Boolean).sort().pop()
  const suggestions = total === 0 ? relaxSuggestions(all, filters) : []

  return (
    <div className="bg-gray-50 min-h-screen">
      <CatalogSearchTracker
        searchTerm={filters.q}
        filterKeys={chips.length ? activeFilterKeys(filters).join(',') : ''}
        resultCount={total}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">盆栽・鉢・道具を探す</h1>
          <p className="text-gray-700 text-sm md:text-base">
            楽天市場とAmazonの商品 {all.length.toLocaleString()}件を、樹種・価格・サイズ・送料などでまとめて比較できます。
          </p>
          <p className="text-sm mt-2">
            <Link href="/shindan" className="text-blue-700 underline">何を選べばよいか迷ったら、かんたん盆栽診断（4つの質問）</Link>
          </p>
          <PrDisclosure className="mt-3" />
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          {SHOP_CATEGORIES.map(category => (
            <Link
              key={category.slug}
              href={`/products/category/${category.slug}`}
              className="text-sm bg-white border rounded-full px-3 py-1 hover:border-gray-500"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
          <aside className="lg:sticky lg:top-4">
            <details className="lg:hidden bg-white rounded-xl shadow-sm mb-2">
              <summary className="px-4 py-3 font-medium text-gray-900 cursor-pointer">絞り込み・並び替え</summary>
              <div className="px-1 pb-1">
                <CatalogFiltersForm filters={filters} />
              </div>
            </details>
            <div className="hidden lg:block">
              <CatalogFiltersForm filters={filters} />
            </div>
          </aside>

          <section>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <p className="text-sm text-gray-700 mr-2">
                <span className="font-semibold text-gray-900">{total.toLocaleString()}件</span>
                {total > 0 && `（${page} / ${totalPages}ページ）`}
              </p>
              {chips.map(chip => (
                <Link key={chip.label} href={chip.href} className="text-xs bg-white border rounded-full px-3 py-1 hover:border-gray-500">
                  {chip.label} ✕
                </Link>
              ))}
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((product, index) => (
                  <CatalogProductCard key={product.id} product={product} priority={index < 2} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 md:p-8 text-gray-700">
                <p className="font-medium text-gray-900 mb-3">条件に合う商品が見つかりませんでした。</p>
                {suggestions.length > 0 && (
                  <>
                    <p className="text-sm mb-2">条件を1つ外すと、次の商品が見つかります。</p>
                    <ul className="space-y-2 mb-4">
                      {suggestions.map(suggestion => (
                        <li key={suggestion.key}>
                          <Link href={buildCatalogUrl(suggestion.filters)} className="text-blue-700 underline">
                            {filterKeyLabel(filters, suggestion.key)}を外す（{suggestion.count.toLocaleString()}件）
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <Link href="/products" className="text-sm text-gray-600 underline">条件をすべてクリアする</Link>
              </div>
            )}

            <CatalogPagination filters={filters} page={page} totalPages={totalPages} />

            <p className="text-xs text-gray-500 mt-6">
              価格・送料・在庫は{lastSynced ? `${new Date(lastSynced).toLocaleDateString('ja-JP')}時点の` : '取得時点の'}情報です。最新の情報は各ショップの商品ページでご確認ください。
              楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">
                Supported by Rakuten Developers
              </a>
              。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
