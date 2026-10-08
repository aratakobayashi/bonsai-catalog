import Link from 'next/link'
import type { ReactNode } from 'react'
import { buildCatalogUrl, type CatalogFilters } from '@/lib/catalog'
import { buildFilterMenus } from '@/lib/catalog-menus'
import { formatPrice } from '@/lib/utils'
import type { CatalogProduct } from '@/lib/catalog-model'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CatalogProductCard, ProductBadges } from './CatalogProductCard'
import { CatalogFiltersForm, CatalogPagination } from './CatalogFilters'
import { FilterBar, SortSelect } from './FilterBar'
import { ProductDetailPanel } from './ProductDetailPanel'
import { ProductThumb } from './ProductThumb'

function withSelected(url: string, id: string) {
  return `${url}${url.includes('?') ? '&' : '?'}p=${id}`
}

// PCの一覧の1行（押すと右側の詳細が切り替わる）
function ProductRow({ product, href, selected }: { product: CatalogProduct; href: string; selected: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? 'true' : undefined}
      className={`flex gap-4 border-b border-line px-5 py-4 ${selected ? 'border-l-[3px] border-l-gold bg-[#fbf7ef] pl-[17px]' : 'hover:bg-paper'}`}
    >
      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg bg-[#f1eee8]">
        <ProductThumb src={product.imageUrl} alt="" sizes="84px" size={200} />
      </div>
      <div className="min-w-0 flex-1">
        <ProductBadges product={product} />
        <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-ink">{product.name}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-bold text-ink">{formatPrice(product.price)}</span>
          {product.reviewCount > 0 && (
            <span className="text-xs text-ink-muted">★{product.reviewAverage.toFixed(1)}（{product.reviewCount.toLocaleString()}件）</span>
          )}
        </div>
      </div>
    </Link>
  )
}

interface CatalogBrowserProps {
  filters: CatalogFilters
  items: CatalogProduct[]
  total: number
  page: number
  totalPages: number
  selectedId?: string
  basePath?: string
  // 一覧の上に出す説明（カテゴリページの樹種の説明など）
  intro?: ReactNode
  emptyState?: ReactNode
  activeCount: number
  // 絞り込みの選択肢のリンク先（カテゴリページでは全商品の一覧へ移動する）
  menuBasePath?: string
  footer?: ReactNode
}

// 商品一覧の画面（PCは左に一覧・右に詳細、スマホは2列のカード）
export function CatalogBrowser({ filters, items, total, page, totalPages, selectedId, basePath = '/products', intro, emptyState, activeCount, menuBasePath, footer }: CatalogBrowserProps) {
  const { menus, sort } = buildFilterMenus(filters, menuBasePath ?? basePath)
  const listUrl = buildCatalogUrl(filters, { page }, basePath)
  const selected = items.find(p => p.id === selectedId) ?? items[0]

  return (
    <>
      <FilterBar menus={menus} sort={sort} activeCount={activeCount}>
        <CatalogFiltersForm filters={filters} basePath={menuBasePath ?? basePath} />
      </FilterBar>

      <div className="mx-auto max-w-[1280px] lg:grid lg:grid-cols-[440px_minmax(0,1fr)] lg:border-x lg:border-line">
        <aside className="lg:border-r lg:border-line lg:bg-white">
          {intro && <div className="border-b border-line bg-[#fbf8f2] px-4 py-5 lg:px-5">{intro}</div>}
          <div className="px-4 pb-3 pt-4 lg:px-5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-navy">{total.toLocaleString()}</span>
              <span className="text-[13px] text-ink-soft">件<span className="hidden lg:inline">（楽天市場・Amazon）</span></span>
              <div className="ml-auto lg:hidden"><SortSelect sort={sort} /></div>
            </div>
            <PrDisclosure className="mt-3 hidden lg:block" />
            <PrDisclosure compact className="mt-2 bg-transparent px-0 py-0 lg:hidden" />
          </div>

          {items.length === 0 ? (
            <div className="px-4 pb-8 lg:px-5">{emptyState}</div>
          ) : (
            <>
              <div className="hidden lg:block">
                {items.map(product => (
                  <ProductRow key={product.id} product={product} href={withSelected(listUrl, product.id)} selected={product.id === selected?.id} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 lg:hidden">
                {items.map((product, index) => (
                  <CatalogProductCard key={product.id} product={product} priority={index < 2} />
                ))}
              </div>
            </>
          )}
          <div className="px-4 pb-8 lg:px-5">
            <CatalogPagination filters={filters} page={page} totalPages={totalPages} basePath={basePath} />
            <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
              価格・送料・在庫は取得時点の情報です。最新の情報は各ショップの商品ページでご確認ください。楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
            </p>
          </div>
        </aside>

        <section className="hidden bg-paper px-9 py-8 lg:block" aria-label="選択中の商品">
          {selected ? (
            <div className="sticky top-[140px]">
              <ProductDetailPanel product={selected} />
              <Link href={`/products/${selected.id}`} className="mt-6 inline-block text-sm font-bold text-navy underline">
                この商品のページを開く →
              </Link>
            </div>
          ) : null}
        </section>
      </div>
      {footer && <div className="mx-auto max-w-[1280px] border-t border-line px-4 py-8 lg:px-10">{footer}</div>}
    </>
  )
}
