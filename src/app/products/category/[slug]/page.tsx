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
import { Breadcrumbs, ChipLink } from '@/components/ui/design'

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
  const products = filterProducts(await getCatalogProducts(), filters)
  const { items, page, totalPages, total } = paginate(products, filters.page)
  const prices = products.map(p => p.price).sort((a, b) => a - b)
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : null
  const pageUrl = `${SITE_URL}${basePath}`
  const related = SHOP_CATEGORIES.filter(other => other.slug !== category.slug)
  const group = TREE_GROUP_BY_SLUG[category.slug] ?? (category.group === 'part' ? '鉢・土・道具' : null)
  const title = category.group === 'part' || category.slug === 'kokedama' || category.slug.endsWith('mono') || category.slug === 'mini' ? category.name : `${category.name}の盆栽`
  const selectedId = typeof searchParams.p === 'string' ? searchParams.p : undefined

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

  const intro = (
    <>
      <Breadcrumbs items={[{ label: '探す', href: '/products' }, ...(group ? [{ label: group }] : []), { label: category.name }]} />
      <h1 className="mt-2 font-mincho text-2xl font-bold text-navy lg:text-[26px]">{title}</h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{category.intro}</p>
      {prices.length > 0 && (
        <p className="mt-2 text-xs text-ink-muted">
          価格は {formatPrice(prices[0])}〜{formatPrice(prices[prices.length - 1])}
          {median !== null && `（中央値 ${formatPrice(median)}）`}
        </p>
      )}
      <Link href={`/guides?search=${encodeURIComponent(category.name)}`} className="mt-2 inline-block text-[13px] font-bold text-navy underline">
        {category.group === 'part' ? `${category.name}の選び方を読む →` : `${category.name}の育て方を読む →`}
      </Link>
    </>
  )

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
        menuBasePath="/products"
        intro={intro}
        activeCount={0}
        emptyState={<p className="rounded-xl border border-line bg-white p-5 text-ink-soft">現在、掲載中の商品はありません。</p>}
        footer={
          <section>
            <h2 className="font-mincho text-lg font-bold text-navy">ほかのカテゴリ</h2>
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
