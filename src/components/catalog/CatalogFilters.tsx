import Link from 'next/link'
import {
  ENJOY_OPTIONS,
  LEVEL_OPTIONS,
  PLACE_OPTIONS,
  SEASON_OPTIONS,
  USE_OPTIONS,
  SIZE_OPTIONS,
  SPECIES_OPTIONS,
  TYPE_OPTIONS,
  buildCatalogUrl,
  categoryCounts,
  relaxSuggestions,
  type CatalogFilters,
  type CatalogProduct,
  type FilterKey,
} from '@/lib/catalog'
import { conditionLabels } from '@/lib/catalog-menus'
import { SHOP_CATEGORIES } from '@/lib/shop-categories'

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

// 商品の多い樹種（0件のときの案内に出す。件数は実際の掲載数）
const SPECIES_LINK_EXCLUDE = ['mini', 'mimono', 'kokedama']
function topSpecies(products: CatalogProduct[], exclude?: string, limit = 6) {
  const counts = categoryCounts(products)
  return SHOP_CATEGORIES
    .filter(c => c.group === 'tree' && !SPECIES_LINK_EXCLUDE.includes(c.slug) && c.slug !== exclude && (counts[c.slug] ?? 0) > 0)
    .sort((a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0))
    .slice(0, limit)
    .map(c => ({ slug: c.slug, name: c.name, count: counts[c.slug] ?? 0 }))
}

// 一覧が0件のときの案内（/products とカテゴリページで共通）
// category：カテゴリページのとき（樹種・種類はページ側で固定。URL には入れない）
export function CatalogEmptyState({
  products,
  filters,
  basePath = '/products',
  category,
}: {
  products: CatalogProduct[]
  filters: CatalogFilters
  basePath?: string
  category?: { slug: string; name: string }
}) {
  const fixed = Boolean(category)
  const conditions = conditionLabels(filters, fixed)
  const hasConditions = conditions.length > 0
  const keywordOnly = Boolean(filters.q) && !hasConditions
  const species = topSpecies(products, category?.slug)

  // 条件を何も指定していないのに0件（掲載中の商品がないカテゴリ）
  if (!filters.q && !hasConditions) {
    return (
      <div className="text-ink-soft">
        <p className="mb-4 font-mincho text-base font-bold text-ink">現在、掲載中の商品はありません。</p>
        <SpeciesLinks species={species} />
        <p className="mt-4 text-sm"><Link href="/products" className="border-b border-ink pb-0.5 text-ink">すべての商品を見る</Link></p>
      </div>
    )
  }

  // キーワードだけのときは「キーワードを外す」と同じになるので、外す案は出さない
  const suggestions = keywordOnly ? [] : relaxSuggestions(products, filters)
  // カテゴリページで、固定している樹種・種類を外す案は全商品の一覧へ
  const suggestionHref = (key: FilterKey, relaxed: CatalogFilters) =>
    fixed && (key === 'species' || key === 'type')
      ? buildCatalogUrl(relaxed, {}, '/products')
      : buildCatalogUrl(fixed ? { ...relaxed, species: undefined, type: undefined } : relaxed, {}, basePath)
  const where = category ? `${category.name}の中に、` : ''

  return (
    <div className="text-ink-soft">
      {keywordOnly ? (
        <>
          <p className="mb-2 font-mincho text-base font-bold text-ink">{where}「{filters.q}」に一致する商品は見つかりませんでした。</p>
          <p className="mb-4 text-sm leading-relaxed">言葉を短くする、ひらがな・カタカナに言い換える、樹種の名前で探すと見つかることがあります。</p>
        </>
      ) : (
        <p className="mb-4 font-mincho text-base font-bold text-ink">
          {where}{filters.q ? `「${filters.q}」と条件に合う商品はありません。` : '条件に合う商品はありません。'}「条件」から一つ外してみてください。
        </p>
      )}
      {suggestions.length > 0 && (
        <>
          <p className="mb-2 text-sm">条件を1つ外すと、次の商品が見つかります。</p>
          <ul className="mb-5 space-y-2.5 text-sm">
            {suggestions.map(suggestion => (
              <li key={suggestion.key}>
                <Link href={suggestionHref(suggestion.key, suggestion.filters)} className="border-b border-ink pb-0.5 text-ink">
                  {filterKeyLabel(filters, suggestion.key)}を外す（{suggestion.count.toLocaleString()}件）
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link href={basePath} className="text-sm text-ink-muted underline">
        {keywordOnly ? 'キーワードをクリアする' : '条件をすべてクリアする'}
      </Link>
      <SpeciesLinks species={species} />
      <p className="mt-5 text-sm">
        <Link href="/shindan" className="border-b border-ink pb-0.5 text-ink">何を選べばよいか迷ったら、かんたん盆栽診断（4つの質問）</Link>
      </p>
    </div>
  )
}

function SpeciesLinks({ species }: { species: { slug: string; name: string; count: number }[] }) {
  if (species.length === 0) return null
  return (
    <div className="mt-6">
      <p className="mb-2 text-[11.5px] tracking-[0.06em] text-ink-muted">商品の多い樹種から探す</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {species.map(s => (
          <li key={s.slug}>
            <Link href={`/products/category/${s.slug}`} className="inline-flex min-h-11 items-center gap-1.5 font-mincho text-[15px] font-bold text-ink hover:text-gold-dark lg:min-h-0">
              {s.name}
              <span className="font-sans text-[11px] font-normal text-ink-muted">{s.count.toLocaleString()}件</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CatalogPagination({
  filters,
  page,
  totalPages,
  basePath = '/products',
}: {
  filters: CatalogFilters
  page: number
  totalPages: number
  basePath?: string
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  )
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="ページ送り">
      {page > 1 && (
        <Link href={buildCatalogUrl(filters, { page: page - 1 }, basePath)} className="border border-line bg-white px-3 py-2 text-sm text-ink hover:border-ink">
          前へ
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-ink-muted">…</span>}
          <Link
            href={buildCatalogUrl(filters, { page: p }, basePath)}
            aria-current={p === page ? 'page' : undefined}
            className={`min-w-[40px] border px-3 py-2 text-center text-sm ${p === page ? 'border-sumi bg-sumi text-white hover:text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={buildCatalogUrl(filters, { page: page + 1 }, basePath)} className="border border-line bg-white px-3 py-2 text-sm text-ink hover:border-ink">
          次へ
        </Link>
      )}
    </nav>
  )
}
