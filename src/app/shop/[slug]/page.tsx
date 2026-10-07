import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BONSAI_GENRE_ID, searchRakutenItems } from '@/lib/rakuten'
import { SHOP_CATEGORIES, getShopCategory } from '@/lib/shop-categories'
import { SITE_URL } from '@/lib/site'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { RakutenCredit, RakutenItemGrid } from '@/components/shop/RakutenItemGrid'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'

interface ShopCategoryPageProps {
  params: { slug: string }
}

// ビルド時にまとめて API を呼ぶと上限にかかるため、初回アクセス時に生成する。
// 商品データ自体は6時間キャッシュ（src/lib/rakuten.ts）。一時的な取得失敗が長く残らないよう、ページは10分ごとに再生成
export const revalidate = 600

export function generateStaticParams() {
  return []
}

export function generateMetadata({ params }: ShopCategoryPageProps): Metadata {
  const category = getShopCategory(params.slug)
  if (!category) return {}
  return {
    title: `${category.name}の通販・価格比較｜楽天市場の人気商品 - 盆栽コレクション`,
    description: category.description,
    alternates: { canonical: `/shop/${category.slug}` },
  }
}

export default async function ShopCategoryPage({ params }: ShopCategoryPageProps) {
  const category = getShopCategory(params.slug)
  if (!category) notFound()

  const { items, total } = await searchRakutenItems({
    keyword: category.keyword,
    genreId: category.group === 'tree' ? BONSAI_GENRE_ID : undefined,
    hits: 30,
  })
  const related = SHOP_CATEGORIES.filter(other => other.group === category.group && other.slug !== category.slug)
  const others = SHOP_CATEGORIES.filter(other => other.group !== category.group)

  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '楽天市場で探す', url: `${SITE_URL}/shop`, position: 2 },
          { name: category.name, url: `${SITE_URL}/shop/${category.slug}`, position: 3 },
        ]}
      />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">ホーム</Link>
            <span className="mx-2">›</span>
            <Link href="/shop" className="hover:text-gray-700">楽天市場で探す</Link>
            <span className="mx-2">›</span>
            <span>{category.name}</span>
          </nav>

          <header className="mb-6 max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{category.name}を探す</h1>
            <p className="text-gray-700 leading-relaxed">{category.intro}</p>
            <PrDisclosure className="mt-4" />
          </header>

          <form action="/search" className="flex gap-2 mb-6 max-w-xl">
            <input
              type="search"
              name="q"
              defaultValue={category.keyword}
              aria-label="キーワード"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button type="submit" className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm">
              価格・並び順で絞り込む
            </button>
          </form>

          {items.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                楽天市場の「{category.keyword}」{total.toLocaleString()}件から、おすすめ順に{items.length}件を表示しています。
              </p>
              <RakutenItemGrid items={items} />
            </>
          ) : (
            <p className="text-gray-600 bg-white rounded-xl p-6">商品情報を取得できませんでした。時間をおいて再度お試しください。</p>
          )}

          <RakutenCredit />

          <section className="mt-10 grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-bold text-gray-900 mb-3">{category.group === 'tree' ? 'ほかの樹種' : 'ほかの鉢・道具'}</h2>
              <div className="flex flex-wrap gap-2">
                {related.map(other => (
                  <Link key={other.slug} href={`/shop/${other.slug}`} className="text-sm bg-white border rounded-full px-3 py-1 hover:border-gray-500">
                    {other.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 mb-3">{category.group === 'tree' ? 'あわせて揃えたい鉢・道具' : '樹種から探す'}</h2>
              <div className="flex flex-wrap gap-2">
                {others.map(other => (
                  <Link key={other.slug} href={`/shop/${other.slug}`} className="text-sm bg-white border rounded-full px-3 py-1 hover:border-gray-500">
                    {other.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
