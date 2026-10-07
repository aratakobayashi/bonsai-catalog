import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FLAG_OPTIONS,
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
  filters.flags.forEach(flag => {
    chips.push({
      label: FLAG_OPTIONS.find(o => o.value === flag)?.label ?? flag,
      href: remove({ flags: filters.flags.filter(f => f !== flag) }),
    })
  })
  return chips
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = parseFilters(searchParams)
  const all = await getCatalogProducts()
  const filtered = filterProducts(all, filters)
  const { items, page, totalPages, total } = paginate(filtered, filters.page)
  const chips = activeChips(filters)
  const lastSynced = all.map(p => p.lastSyncedAt).filter(Boolean).sort().pop()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">盆栽・鉢・道具を探す</h1>
          <p className="text-gray-700 text-sm md:text-base">
            楽天市場とAmazonの商品 {all.length.toLocaleString()}件を、樹種・価格・サイズ・送料などでまとめて比較できます。
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
              <div className="bg-white rounded-xl p-8 text-center text-gray-700">
                <p className="mb-3">条件に合う商品が見つかりませんでした。</p>
                <Link href="/products" className="text-blue-700 underline">条件をクリアする</Link>
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
