import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  CATEGORY_PART_TYPES,
  KEYWORD_MAX_LENGTH,
  PAGE_SIZE,
  buildCatalogUrl,
  filterProducts,
  type CatalogFilters,
} from '@/lib/catalog'
import { activeChips, buildFilterMenus, buildSpeciesTabs, conditionLabels, quickMenus, type SpeciesTab } from '@/lib/catalog-menus'
import type { CatalogProduct } from '@/lib/catalog-model'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { CatalogProductCard } from './CatalogProductCard'
import { CompareBar } from './CompareBar'
import { FilterBar, QuickFilters, SortSelect, type KeywordFormTarget } from './FilterBar'

export interface CatalogTabs {
  all: SpeciesTab
  tabs: SpeciesTab[]
  // タブの列の名前（読み上げ用）
  label: string
}

const PART_TYPE_VALUES = Object.values(CATEGORY_PART_TYPES) as string[]
const isPartType = (type?: string) => type === 'parts' || (type !== undefined && PART_TYPE_VALUES.includes(type))

// 一覧の上のタブ。樹木・苔玉（または種類の指定なし）は樹種のタブ、鉢・土・道具を見ているときはそのカテゴリのタブにする
// activeSlug：カテゴリページの slug。knownAllCount：「すべて」の件数が一覧の件数と同じときに渡す
export function buildCatalogTabs(products: CatalogProduct[], filters: CatalogFilters, activeSlug?: string, knownAllCount?: number): CatalogTabs {
  const activePart = activeSlug ? CATEGORY_PART_TYPES[activeSlug] : undefined
  if (!activePart && !isPartType(filters.type)) {
    const species = buildSpeciesTabs(products, filters, activeSlug, knownAllCount)
    // 種子など、樹種で分けられない種類のときは樹種のタブを出さない
    return { ...species, tabs: filters.type && !['tree', 'kokedama'].includes(filters.type) ? [] : species.tabs, label: '樹種' }
  }
  const base: CatalogFilters = { ...filters, species: undefined, page: 1 }
  const linkFilters: CatalogFilters = { ...base, type: undefined }
  const count = (type: string) => filterProducts(products, { ...base, type }).length
  const parts: SpeciesTab = {
    key: 'parts',
    label: '鉢・土・道具',
    href: buildCatalogUrl(linkFilters, { type: 'parts' }, '/products'),
    count: count('parts'),
    active: !activeSlug && filters.type === 'parts',
    inSeason: false,
  }
  const categoryTabs: SpeciesTab[] = SHOP_CATEGORIES.filter(c => CATEGORY_PART_TYPES[c.slug]).map(c => {
    const type = CATEGORY_PART_TYPES[c.slug]
    return {
      key: c.slug,
      label: c.name.replace(/^盆栽(用)?の?/, '').replace(/（.*）/, '') || c.name,
      href: buildCatalogUrl(linkFilters, {}, `/products/category/${c.slug}`),
      count: count(type),
      active: activeSlug ? c.slug === activeSlug : filters.type === type,
      inSeason: false,
    }
  })
  return {
    all: {
      key: 'all',
      label: 'すべて',
      href: buildCatalogUrl(linkFilters, {}, '/products'),
      count: filterProducts(products, linkFilters).length,
      active: false,
      inSeason: false,
    },
    tabs: [parts, ...categoryTabs].filter(t => t.count > 0 || t.active),
    label: '鉢・土・道具',
  }
}

interface CatalogBrowserProps {
  filters: CatalogFilters
  items: CatalogProduct[]
  total: number
  page: number
  totalPages: number
  selectedId?: string
  basePath?: string
  // 一覧の上のタブ（buildCatalogTabs の結果）
  speciesTabs: CatalogTabs
  // 種類・樹種ごとの件数（catalog.ts の optionCounts）。0件の選択肢を条件から外す
  counts?: { type: Record<string, number>; species: Record<string, number> }
  // カテゴリページ（樹種・種類が固定）のとき true
  fixedCategory?: boolean
  // 一覧の上に出す説明（カテゴリページの樹種の説明など）
  intro?: ReactNode
  // 全件の一覧の上に並べる目的ごとの棚（何も絞り込んでいないときだけ）
  shelves?: ReactNode
  // 売り場の切り替えを出す（/products だけ）。今の売り場
  store?: 'bonsai' | 'parts'
  // 「すべて解除」の行き先（既定は basePath）
  clearHref?: string
  emptyState?: ReactNode
  activeCount: number
  footer?: ReactNode
}

// 商品一覧の画面（墨色の見出しの帯 → 売り場の切り替え → 棚 → よく使う絞り込み → 商品のグリッド → もっと見る）
export function CatalogBrowser({ filters, items, total, page, totalPages, selectedId, basePath = '/products', speciesTabs, counts, fixedCategory = false, intro, shelves, store, clearHref, emptyState, activeCount, footer }: CatalogBrowserProps) {
  // カテゴリページの条件・並び順はカテゴリのURLのまま切り替える（樹種・種類はページ側で固定するのでURLに入れない）
  const urlFilters: CatalogFilters = fixedCategory ? { ...filters, species: undefined, type: undefined } : filters
  const { menus, sort } = buildFilterMenus(urlFilters, basePath, counts)
  // 樹種はタブで選ぶので、条件のパネルからは除く（カテゴリページでは種類も固定）
  const panelMenus = menus.flatMap(menu => {
    if (menu.key !== 'species') return [menu]
    if (fixedCategory) return []
    return [{ ...menu, groups: menu.groups.filter(g => g.title === '種類') }]
  })
  const conditions = conditionLabels(filters, fixedCategory)
  const listUrl = buildCatalogUrl(urlFilters, { page }, basePath)
  const partsView = isPartType(filters.type) || (fixedCategory && Boolean(CATEGORY_PART_TYPES[basePath.split('/').pop() ?? '']))
  const quick = quickMenus(urlFilters, basePath, partsView)
  const chips = activeChips(urlFilters, basePath, fixedCategory, quick.map(m => m.key))
  // 何かの条件で絞っているか（「すべて解除」を出すため。上のボタンの条件も含める）
  const anyActive = chips.length > 0 || quick.some(m => m.current)
  // キーワード・価格の入力欄：今のページ（カテゴリページはカテゴリの URL）に、ほかの条件を保ったまま送る
  const keepUrl = buildCatalogUrl({ ...urlFilters, q: undefined, min: undefined, max: undefined }, {}, basePath)
  const keywordForm: KeywordFormTarget = {
    action: basePath,
    params: Array.from(new URLSearchParams(keepUrl.split('?')[1] ?? '').entries()),
    q: filters.q,
    min: filters.min,
    max: filters.max,
    maxLength: KEYWORD_MAX_LENGTH,
  }

  return (
    <>
      <FilterBar
        allTab={speciesTabs.all}
        tabs={speciesTabs.tabs}
        tabsLabel={speciesTabs.label}
        menus={panelMenus}
        sort={sort}
        conditions={conditions}
        activeCount={activeCount}
        total={total}
        clearHref={basePath}
        keywordForm={keywordForm}
        currentUrl={listUrl}
      />

      {/* 見出し：画面の端まで墨色の帯（各ページの冒頭と同じ色使い） */}
      {intro && (
        <div className="tone-dark bg-sumi">
          <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-5 lg:px-12 lg:pb-9 lg:pt-8">{intro}</div>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-4 pb-12 pt-5 lg:px-12 lg:pb-16 lg:pt-8">
        {/* 売り場の切り替え（盆栽・苔玉／鉢・土・道具） */}
        {store && (
          <nav aria-label="売り場" className="mb-6 flex border-b border-line lg:mb-8">
            {[
              { key: 'bonsai', label: '盆栽・苔玉', href: '/products' },
              { key: 'parts', label: '鉢・土・道具', href: '/products?type=parts' },
            ].map(tab => (
              <Link
                key={tab.key}
                href={tab.href}
                aria-current={store === tab.key ? 'page' : undefined}
                className={`-mb-px inline-flex min-h-12 items-center border-b-2 px-4 font-mincho text-[15px] font-bold tracking-[0.05em] lg:px-6 lg:text-[17px] ${store === tab.key ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        )}

        {shelves}

        <section aria-label="商品の一覧" id="list" className="scroll-mt-32">
          {/* よく使う絞り込み（常に表示）と、選んでいる条件の札 */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <QuickFilters menus={quick} chips={chips} clearHref={clearHref ?? basePath} showClear={anyActive} />
            <div className="flex shrink-0 items-center gap-4 text-[12px] text-ink-muted">
              <span><span className="text-[15px] text-ink">{total.toLocaleString()}</span> 件</span>
              <SortSelect sort={sort} />
            </div>
          </div>
          <PrDisclosure compact className="mb-5 mt-3 lg:mb-7" />

          {items.length === 0 ? (
            <div className="py-6">{emptyState}</div>
          ) : (
            <div data-list="catalog" className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12 xl:grid-cols-5">
              {items.map((product, index) => (
                <CatalogProductCard key={product.id} product={product} priority={index < 2} sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 230px" />
              ))}
            </div>
          )}

          {/* もっと見る：続きを下に足す（スクロールの位置は保つ） */}
          {page < totalPages && (
            <Link
              href={buildCatalogUrl(urlFilters, { page: page + 1 }, basePath)}
              scroll={false}
              className="mx-auto mt-10 flex h-12 max-w-[420px] items-center justify-center border border-ink text-sm tracking-[0.06em] text-ink hover:bg-ink hover:text-white"
            >
              もっと見る（残り{(total - items.length).toLocaleString()}件）
            </Link>
          )}
          <p className="mt-8 text-[11px] leading-relaxed text-ink-muted">
            価格・送料・在庫は取得時点の情報です。最新の情報は各ショップの商品ページでご確認ください。楽天市場の商品情報は{' '}
            <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
          </p>
        </section>
        <CompareBar />
      </div>
      {footer && <div className="mx-auto max-w-[1280px] border-t border-line px-4 py-8 lg:px-12">{footer}</div>}
    </>
  )
}
