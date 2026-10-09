import Link from 'next/link'
import type { ReactNode } from 'react'
import { PAGE_SIZE, buildCatalogUrl, type CatalogFilters } from '@/lib/catalog'
import { buildFilterMenus, conditionLabels, type SpeciesTab } from '@/lib/catalog-menus'
import type { CatalogProduct } from '@/lib/catalog-model'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CatalogProductCard } from './CatalogProductCard'
import { CatalogFiltersForm, CatalogPagination } from './CatalogFilters'
import { CompareBar } from './CompareBar'
import { FilterBar, ListSelectArea, SortSelect } from './FilterBar'
import { ProductImage, ProductInfo } from './ProductDetailPanel'

function withSelected(url: string, id: string) {
  return `${url}${url.includes('?') ? '&' : '?'}p=${id}`
}

interface CatalogBrowserProps {
  filters: CatalogFilters
  items: CatalogProduct[]
  total: number
  page: number
  totalPages: number
  selectedId?: string
  basePath?: string
  // 樹種のタブ（buildSpeciesTabs の結果）
  speciesTabs: { all: SpeciesTab; tabs: SpeciesTab[] }
  // カテゴリページ（樹種・種類が固定）のとき true
  fixedCategory?: boolean
  // 一覧の上に出す説明（カテゴリページの樹種の説明など）
  intro?: ReactNode
  emptyState?: ReactNode
  activeCount: number
  // 詳しい条件のフォームの送信先（カテゴリページでは全商品の一覧で探す）
  menuBasePath?: string
  footer?: ReactNode
}

// 商品一覧の画面（PCは左に商品のグリッド・右に詳細、スマホは2列のカード）
export function CatalogBrowser({ filters, items, total, page, totalPages, selectedId, basePath = '/products', speciesTabs, fixedCategory = false, intro, emptyState, activeCount, menuBasePath, footer }: CatalogBrowserProps) {
  // カテゴリページの条件・並び順はカテゴリのURLのまま切り替える（樹種・種類はページ側で固定するのでURLに入れない）
  const urlFilters: CatalogFilters = fixedCategory ? { ...filters, species: undefined, type: undefined } : filters
  const { menus, sort } = buildFilterMenus(urlFilters, fixedCategory ? basePath : menuBasePath ?? basePath)
  // 樹種はタブで選ぶので、条件のパネルからは除く（カテゴリページでは種類も固定）
  const panelMenus = menus.flatMap(menu => {
    if (menu.key !== 'species') return [menu]
    if (fixedCategory) return []
    return [{ ...menu, groups: menu.groups.filter(g => g.title === '種類') }]
  })
  const conditions = conditionLabels(filters, fixedCategory)
  const listUrl = buildCatalogUrl(urlFilters, { page }, basePath)
  const selected = items.find(p => p.id === selectedId) ?? items[0]

  return (
    <>
      <FilterBar
        allTab={speciesTabs.all}
        tabs={speciesTabs.tabs}
        menus={panelMenus}
        sort={sort}
        conditions={conditions}
        activeCount={activeCount}
        total={total}
        clearHref={basePath}
      >
        <CatalogFiltersForm filters={filters} basePath={menuBasePath ?? basePath} />
      </FilterBar>

      {/* PC：左の一覧と右の詳細を、それぞれ独立してスクロールできるようにする（高さは画面からヘッダー56px・樹種のタブ56px＋線1pxを除いた分） */}
      <div className="mx-auto max-w-[1280px] lg:grid lg:h-[calc(100vh-113px)] lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* 条件やページが変わったときだけ一覧の先頭に戻し、商品を選んだだけのときは位置を保つ */}
        <section key={listUrl} className="flex min-w-0 flex-col lg:min-h-0 lg:overflow-y-auto" aria-label="商品の一覧">
          <div className="flex-1 px-4 pb-10 pt-5 lg:pb-12 lg:pl-12 lg:pr-10 lg:pt-8">
            {intro && <div className="mb-5 border-b border-line pb-5 lg:mb-8 lg:pb-7">{intro}</div>}

            <div className="mb-4 flex items-baseline gap-2.5 text-[11px] text-ink-muted lg:mb-6 lg:gap-3 lg:text-xs">
              <span className="shrink-0"><span className="text-[13px] text-ink lg:text-[15px]">{total.toLocaleString()}</span> 件</span>
              {totalPages > 1 && <span className="hidden shrink-0 lg:inline">{page} / {totalPages}ページ</span>}
              {conditions.length > 0 && <span className="min-w-0 flex-1 truncate lg:hidden">{conditions.join('・')}</span>}
              <div className="ml-auto shrink-0 lg:hidden"><SortSelect sort={sort} /></div>
              <PrDisclosure compact className="ml-auto hidden text-right lg:block" />
            </div>
            <PrDisclosure compact className="-mt-2 mb-4 lg:hidden" />

            {items.length === 0 ? (
              <div className="py-6">{emptyState}</div>
            ) : (
              <ListSelectArea className="grid grid-cols-2 gap-x-3.5 gap-y-8 lg:gap-x-6 lg:gap-y-12 xl:grid-cols-3">
                {items.map((product, index) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    priority={index < 2}
                    selected={product.id === selected?.id}
                    selectHref={withSelected(listUrl, product.id)}
                    sizes="(max-width: 1024px) 50vw, 260px"
                  />
                ))}
              </ListSelectArea>
            )}

            {page < totalPages && (
              <Link
                href={buildCatalogUrl(urlFilters, { page: page + 1 }, basePath)}
                className="mt-10 flex h-12 items-center justify-center border border-ink text-sm tracking-[0.06em] text-ink hover:bg-white hover:text-ink"
              >
                次の{Math.min(PAGE_SIZE, total - page * PAGE_SIZE)}件を見る
              </Link>
            )}
            <CatalogPagination filters={urlFilters} page={page} totalPages={totalPages} basePath={basePath} />
            <p className="mt-8 text-[11px] leading-relaxed text-ink-muted">
              価格・送料・在庫は取得時点の情報です。最新の情報は各ショップの商品ページでご確認ください。楽天市場の商品情報は{' '}
              <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
            </p>
          </div>
          <CompareBar />
        </section>

        {/* 選んだ商品が変わったら、詳細は先頭から表示する */}
        <section key={selected?.id ?? 'none'} className="hidden border-l border-line bg-white lg:block lg:overflow-y-auto" aria-label="選択中の商品">
          {selected ? (
            <>
              <ProductImage product={selected} sizes="420px" size={500} priority={false} className="aspect-[7/5]" />
              <div className="px-8 pb-8 pt-5">
                <ProductInfo product={selected} />
                <Link href={`/products/${selected.id}`} className="mt-6 inline-block border-b border-ink pb-0.5 text-[13px] text-ink hover:text-ink">
                  この商品のページを開く
                </Link>
              </div>
            </>
          ) : null}
        </section>
      </div>
      {footer && <div className="mx-auto max-w-[1280px] border-t border-line px-4 py-8 lg:px-12">{footer}</div>}
    </>
  )
}
