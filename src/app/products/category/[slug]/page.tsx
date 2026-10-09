import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  filterProducts,
  getCatalogProducts,
  hasActiveFilters,
  paginate,
  parseFilters,
  type CatalogFilters,
} from '@/lib/catalog'
import { SHOP_CATEGORIES, getShopCategory, type ShopCategory } from '@/lib/shop-categories'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser'
import { currentSeason } from '@/components/catalog/CatalogProductCard'
import { ChipLink } from '@/components/ui/design'
import { selectionsForCategory } from '@/lib/selections'
import { buildSpeciesTabs, conditionLabels, speciesTraitOf } from '@/lib/catalog-menus'
import { getCareGuide } from '@/lib/care-guides'
import { ENJOY_OPTIONS, LEVEL_OPTIONS, PLACE_OPTIONS, SEASON_OPTIONS, type Season, type SpeciesTrait } from '@/lib/species-traits'

interface CategoryPageProps {
  params: { slug: string }
  searchParams: Record<string, string | string[] | undefined>
}

const PART_TYPE_BY_SLUG: Record<string, string> = {
  hachi: 'pot',
  tsuchi: 'soil',
  dougu: 'tool',
  harigane: 'wire',
  hiryo: 'fertilizer',
}

const TREE_GROUP_BY_SLUG: Record<string, string> = {
  goyomatsu: '松柏類', kuromatsu: '松柏類', akamatsu: '松柏類', shimpaku: '松柏類',
  momiji: '雑木類', keyaki: '雑木類', sansho: '雑木類',
  sakura: '花もの', ume: '花もの', satsuki: '花もの',
  nanten: '実もの', himeringo: '実もの', mimono: '実もの',
}

const SEASON_MONTHS: Record<Season, number[]> = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2] }

// 樹種の性質の表（育てやすさ・置き場所・見頃・水やり）と、12か月の見頃の帯
function SpeciesTraits({ trait, group }: { trait: SpeciesTrait; group: string | null }) {
  const label = (options: { value: string; label: string }[], value: string) => options.find(o => o.value === value)?.label
  const seasons = trait.seasons.map(v => label(SEASON_OPTIONS, v)).join('・')
  const enjoy = trait.enjoy.map(v => label(ENJOY_OPTIONS, v)).filter(Boolean).join('・')
  // 水やりは分類ごとの育て方の目安（商品ページと同じ文章）から
  const water = group ? getCareGuide('tree', group)?.items.find(i => i.label === '水やり')?.text : undefined
  const facts = [
    { k: '育てやすさ', v: label(LEVEL_OPTIONS, trait.level) },
    { k: '置き場所', v: label(PLACE_OPTIONS, trait.place) },
    { k: '見頃', v: seasons ? `${seasons}${enjoy ? `（${enjoy}）` : ''}` : enjoy || undefined },
    { k: '水やり', v: water },
  ].filter((f): f is { k: string; v: string } => Boolean(f.v))
  const months = trait.seasons.flatMap(v => SEASON_MONTHS[v])
  const nowMonth = new Date(Date.now() + 9 * 3600 * 1000).getUTCMonth() + 1
  const inSeason = trait.seasons.includes(currentSeason())

  return (
    <div className="text-[12.5px]">
      <dl className="flex flex-col gap-[7px]">
        {facts.map(f => (
          <div key={f.k} className="flex gap-3">
            <dt className="w-[72px] shrink-0 text-ink-muted">{f.k}</dt>
            <dd className="leading-relaxed text-ink">
              {f.v}
              {f.k === '見頃' && inSeason && <span className="ml-2 text-[11px] text-gold-dark">今が見頃</span>}
            </dd>
          </div>
        ))}
      </dl>
      {months.length > 0 && (
        <div className="mt-3">
          <div className="grid h-2.5 grid-cols-12 items-end gap-[3px]" role="img" aria-label={`見頃の目安：${[...months].sort((a, b) => a - b).join('・')}月`}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <div key={m} className={`${m === nowMonth ? 'h-2.5' : 'h-1'} ${months.includes(m) ? 'bg-gold' : 'bg-line'}`} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-ink-muted" aria-hidden="true">
            <span>1月</span><span>6月</span><span>12月</span>
          </div>
        </div>
      )}
      <p className="mt-2 text-[10.5px] text-ink-muted">樹種の一般的な目安です</p>
    </div>
  )
}

// カテゴリの条件（樹種・種類）は固定し、並び順・ページ・予算などは URL の条件を使う
function categoryFilters(category: ShopCategory, searchParams: CategoryPageProps['searchParams']): CatalogFilters {
  const base = parseFilters(searchParams)
  return category.group === 'part'
    ? { ...base, species: undefined, type: PART_TYPE_BY_SLUG[category.slug] }
    : { ...base, species: category.slug, type: category.slug === 'kokedama' ? 'kokedama' : 'tree' }
}

export function generateMetadata({ params, searchParams }: CategoryPageProps): Metadata {
  const category = getShopCategory(params.slug)
  if (!category) return {}
  const extra = hasActiveFilters(categoryFilters(category, searchParams)) && Object.keys(searchParams).length > 0
  return {
    title: `${category.name}の通販・価格比較｜楽天市場・Amazonの人気商品 - 盆栽コレクション`,
    description: `${category.name}を楽天市場とAmazonの商品から比較。価格帯・送料無料・レビュー件数で選べます。${category.intro}`.slice(0, 160),
    alternates: { canonical: `/products/category/${category.slug}` },
    // 並び替え・ページ送りなどの URL は検索結果に出さない
    ...(extra && { robots: { index: false, follow: true } }),
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = getShopCategory(params.slug)
  if (!category) notFound()

  const basePath = `/products/category/${category.slug}`
  const filters = categoryFilters(category, searchParams)
  const all = await getCatalogProducts()
  const products = filterProducts(all, filters)
  const { items, page, totalPages, total } = paginate(products, filters.page)
  const prices = products.map(p => p.price).sort((a, b) => a - b)
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : null
  const pageUrl = `${SITE_URL}${basePath}`
  const related = SHOP_CATEGORIES.filter(other => other.slug !== category.slug)
  const group = TREE_GROUP_BY_SLUG[category.slug] ?? (category.group === 'part' ? '鉢・土・道具' : null)
  const title = category.group === 'part' || category.slug === 'kokedama' || category.slug.endsWith('mono') || category.slug === 'mini' ? category.name : `${category.name}の盆栽`
  const selectedId = typeof searchParams.p === 'string' ? searchParams.p : undefined
  const features = selectionsForCategory(category.slug)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name}の商品一覧`,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.id}`,
      name: product.name,
    })),
  }

  const trait = category.group === 'tree' ? speciesTraitOf(category.slug) : null
  const intro = (
    <div className={trait ? 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end lg:gap-8' : ''}>
      <div className="min-w-0">
        {group && <div className="text-[10.5px] tracking-[0.08em] text-ink-muted lg:text-[11.5px]">{group}</div>}
        <h1 className="mt-0.5 font-mincho text-[25px] font-bold leading-snug tracking-[0.06em] text-ink lg:mt-1 lg:text-[34px]">
          {category.name}
          {title !== category.name && <span className="ml-1 text-base tracking-[0.04em] lg:text-lg">{title.slice(category.name.length)}</span>}
        </h1>
        <p className="mt-1.5 max-w-[440px] text-[12.5px] leading-[1.85] text-ink-soft lg:mt-2 lg:text-[13.5px] lg:leading-[1.9]">{category.intro}</p>
        {prices.length > 0 && (
          <p className="mt-2 text-[11.5px] text-ink-muted">
            価格は {formatPrice(prices[0])}〜{formatPrice(prices[prices.length - 1])}
            {median !== null && `（中央値 ${formatPrice(median)}）`}
          </p>
        )}
        <Link href={`/guides?search=${encodeURIComponent(category.name)}`} className="mt-2.5 inline-block border-b border-ink pb-0.5 text-[12.5px] text-ink hover:text-ink">
          {category.group === 'part' ? `${category.name}の選び方を読む` : `${category.name}の育て方を読む`}
        </Link>
        {features.length > 0 && (
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1.5 text-xs">
            <span className="text-[11px] text-ink-muted">特集</span>
            {features.map(f => (
              <Link key={f.slug} href={`/selection/${f.slug}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">{f.shortTitle}</Link>
            ))}
          </div>
        )}
      </div>
      {trait && <SpeciesTraits trait={trait} group={TREE_GROUP_BY_SLUG[category.slug] ?? null} />}
    </div>
  )
  const speciesTabs = buildSpeciesTabs(all, filters, category.slug)

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽・鉢・道具を探す', url: `${SITE_URL}/products`, position: 2 },
          { name: category.name, url: pageUrl, position: 3 },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <CatalogBrowser
        filters={filters}
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        selectedId={selectedId}
        basePath={basePath}
        speciesTabs={speciesTabs}
        fixedCategory
        menuBasePath="/products"
        intro={intro}
        activeCount={conditionLabels(filters, true).length}
        emptyState={<p className="font-mincho text-base font-bold text-ink-soft">現在、掲載中の商品はありません。</p>}
        footer={
          <section>
            <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink">ほかのカテゴリ</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {related.map(other => (
                <ChipLink key={other.slug} href={`/products/category/${other.slug}`}>{other.name}</ChipLink>
              ))}
            </div>
          </section>
        }
      />
    </>
  )
}
