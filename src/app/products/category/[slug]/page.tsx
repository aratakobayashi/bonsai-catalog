import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  buildCatalogUrl,
  filterProducts,
  getCatalogProducts,
  parseFilters,
  type CatalogFilters,
} from '@/lib/catalog'
import { SHOP_CATEGORIES, getShopCategory, type ShopCategory } from '@/lib/shop-categories'
import { SITE_URL } from '@/lib/site'
import { formatPrice } from '@/lib/utils'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'

interface CategoryPageProps {
  params: { slug: string }
}

export const revalidate = 1800
export const dynamicParams = false

export function generateStaticParams() {
  return SHOP_CATEGORIES.map(category => ({ slug: category.slug }))
}

const PART_TYPE_BY_SLUG: Record<string, string> = {
  hachi: 'pot',
  tsuchi: 'soil',
  dougu: 'tool',
  harigane: 'wire',
  hiryo: 'fertilizer',
}

function categoryFilters(category: ShopCategory): CatalogFilters {
  const base = parseFilters({})
  return category.group === 'part'
    ? { ...base, type: PART_TYPE_BY_SLUG[category.slug] }
    : { ...base, species: category.slug, type: category.slug === 'kokedama' ? 'kokedama' : 'tree' }
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = getShopCategory(params.slug)
  if (!category) return {}
  return {
    title: `${category.name}の通販・価格比較｜楽天市場・Amazonの人気商品 - 盆栽コレクション`,
    description: `${category.name}を楽天市場とAmazonの商品から比較。価格帯・送料無料・レビュー件数で選べます。${category.intro}`.slice(0, 160),
    alternates: { canonical: `/products/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = getShopCategory(params.slug)
  if (!category) notFound()

  const filters = categoryFilters(category)
  const products = filterProducts(await getCatalogProducts(), filters)
  const shown = products.slice(0, 48)
  const prices = products.map(p => p.price).sort((a, b) => a - b)
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : null
  const pageUrl = `${SITE_URL}/products/category/${category.slug}`
  const related = SHOP_CATEGORIES.filter(other => other.slug !== category.slug)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name}の商品一覧`,
    itemListElement: shown.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.id}`,
      name: product.name,
    })),
  }

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

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">ホーム</Link>
            <span className="mx-2">›</span>
            <Link href="/products" className="hover:text-gray-700">盆栽・鉢・道具を探す</Link>
            <span className="mx-2">›</span>
            <span>{category.name}</span>
          </nav>

          <header className="mb-6 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{category.name}の通販・価格比較</h1>
            <p className="text-gray-700 leading-relaxed">{category.intro}</p>
            {products.length > 0 && (
              <p className="text-sm text-gray-700 mt-3">
                楽天市場・Amazonの{category.name}の商品 {products.length.toLocaleString()}件を掲載中。
                価格は {formatPrice(prices[0])}〜{formatPrice(prices[prices.length - 1])}
                {median !== null && `（中央値 ${formatPrice(median)}）`}です。
              </p>
            )}
            <PrDisclosure className="mt-4" />
          </header>

          <div className="flex flex-wrap gap-2 mb-6 text-sm">
            <Link href={buildCatalogUrl(filters, { sort: 'price_asc' })} className="bg-white border rounded-full px-3 py-1 hover:border-gray-500">安い順で見る</Link>
            <Link href={buildCatalogUrl(filters, { sort: 'reviews' })} className="bg-white border rounded-full px-3 py-1 hover:border-gray-500">レビューが多い順</Link>
            <Link href={buildCatalogUrl(filters, { flags: ['free_shipping'] })} className="bg-white border rounded-full px-3 py-1 hover:border-gray-500">送料無料のみ</Link>
            <Link href={buildCatalogUrl(filters, { max: 5000 })} className="bg-white border rounded-full px-3 py-1 hover:border-gray-500">5,000円以下</Link>
          </div>

          {shown.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {shown.map((product, index) => (
                <CatalogProductCard key={product.id} product={product} priority={index < 2} />
              ))}
            </div>
          ) : (
            <p className="bg-white rounded-xl p-6 text-gray-700">現在、掲載中の商品はありません。</p>
          )}

          {products.length > shown.length && (
            <div className="text-center mt-6">
              <Link href={buildCatalogUrl(filters)} className="inline-block bg-gray-900 text-white rounded-lg px-6 py-3 text-sm">
                {category.name}の商品をすべて見る（{products.length.toLocaleString()}件）
              </Link>
            </div>
          )}

          <section className="mt-10">
            <h2 className="font-bold text-gray-900 mb-3">ほかのカテゴリ</h2>
            <div className="flex flex-wrap gap-2">
              {related.map(other => (
                <Link key={other.slug} href={`/products/category/${other.slug}`} className="text-sm bg-white border rounded-full px-3 py-1 hover:border-gray-500">
                  {other.name}
                </Link>
              ))}
            </div>
          </section>

          <p className="text-xs text-gray-500 mt-6">
            価格・送料・在庫は取得時点の情報です。最新の情報は各ショップの商品ページでご確認ください。楽天市場の商品情報は{' '}
            <a href="https://developers.rakuten.com/" target="_blank" rel="noopener noreferrer" className="underline">Supported by Rakuten Developers</a>。
          </p>
        </div>
      </div>
    </>
  )
}
