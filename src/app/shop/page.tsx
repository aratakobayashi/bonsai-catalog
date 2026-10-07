import type { Metadata } from 'next'
import Link from 'next/link'
import { searchRakutenItems } from '@/lib/rakuten'
import { SHOP_CATEGORIES, type ShopCategoryGroup } from '@/lib/shop-categories'
import { PrDisclosure } from '@/components/ui/PrDisclosure'
import { RakutenCredit, RakutenItemGrid } from '@/components/shop/RakutenItemGrid'

// ページは1時間ごとに再生成（商品データは src/lib/rakuten.ts で6時間キャッシュ）
export const revalidate = 3600

export const metadata: Metadata = {
  title: '盆栽・鉢・道具を楽天市場から探す｜樹種別・用途別の通販比較 - 盆栽コレクション',
  description: '五葉松・黒松・真柏・もみじ・桜などの盆栽と、盆栽鉢・土・はさみ・針金・肥料を、楽天市場の商品から樹種別・用途別に探せます。',
  alternates: { canonical: '/shop' },
}

const GROUPS: { group: ShopCategoryGroup; title: string }[] = [
  { group: 'tree', title: '樹種から探す' },
  { group: 'part', title: '鉢・土・道具を探す' },
]

export default async function ShopIndexPage() {
  const { items } = await searchRakutenItems({ keyword: '盆栽', sort: '-reviewCount', hits: 12 })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-6 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">盆栽・鉢・道具を楽天市場から探す</h1>
          <p className="text-gray-700 leading-relaxed">
            楽天市場に出品されている盆栽と、鉢・土・道具を、樹種や用途ごとにまとめました。価格や送料、レビュー件数を見比べて、気になる商品は各ショップのページで確認できます。
          </p>
          <PrDisclosure className="mt-4" />
        </header>

        <form action="/search" className="flex gap-2 mb-8 max-w-xl">
          <input
            type="search"
            name="q"
            placeholder="例：五葉松 ミニ、盆栽鉢 小さい"
            aria-label="キーワード"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          />
          <button type="submit" className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm">検索</button>
        </form>

        {GROUPS.map(({ group, title }) => (
          <section key={group} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SHOP_CATEGORIES.filter(category => category.group === group).map(category => (
                <Link
                  key={category.slug}
                  href={`/shop/${category.slug}`}
                  className="bg-white rounded-xl border p-4 hover:shadow-md hover:border-gray-400 transition"
                >
                  <span className="font-medium text-gray-900">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {items.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">レビューの多い盆栽</h2>
            <RakutenItemGrid items={items} />
          </section>
        )}

        <RakutenCredit />
      </div>
    </div>
  )
}
