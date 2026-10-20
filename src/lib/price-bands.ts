// 樹種×予算の一覧ページ（/products/category/[slug]/[band]）の予算の帯
// 一覧の「?min=&max=」は検索エンジンに載らないため、商品が十分にある組み合わせだけ固定のページを作る
import type { CatalogProduct } from '@/lib/catalog-model'
import { categoryFilters, filterProducts, parseFilters } from '@/lib/catalog'
import { SHOP_CATEGORIES, type ShopCategory } from '@/lib/shop-categories'

export interface PriceBand {
  slug: string
  label: string
  min?: number
  max?: number
  // この価格帯で選べるものの目安（一般的な傾向）
  note: string
}

export const PRICE_BANDS: PriceBand[] = [
  { slug: 'under-3000', label: '3,000円以下', max: 3000, note: 'ミニ盆栽や若い樹が中心の価格帯です。樹が小さく、鉢も簡素なものが多いので、まず育ててみたい人や、手軽な贈り物に向きます。' },
  { slug: '3000-5000', label: '3,000〜5,000円', min: 3000, max: 5000, note: 'ミニ〜小品の盆栽が多い価格帯です。鉢付き・苔付きで、すぐ飾れる形のものが選べます。はじめての一鉢や、ちょっとした贈り物の中心になる価格です。' },
  { slug: '5000-10000', label: '5,000〜10,000円', min: 5000, max: 10000, note: '小品〜中品で、幹の太さや樹形に見どころが出てくる価格帯です。焼き物の鉢や化粧箱付きのものもあり、改まった贈り物にも選ばれます。' },
  { slug: 'over-10000', label: '10,000円以上', min: 10000, note: '樹齢を重ねた樹や、中品以上の大きさのものが多い価格帯です。写真で幹の流れ・根張り・枝の配置をよく見て、販売店の説明も確かめて選びます。' },
]

// 固定のページを作る最低件数（少ないと一覧として役に立たないため）
export const BAND_MIN_ITEMS = 8

// 樹種のカテゴリだけ（鉢・土・道具は除く）
export const bandCategories = (): ShopCategory[] => SHOP_CATEGORIES.filter(c => c.group === 'tree')

export function bandProducts(all: CatalogProduct[], categorySlug: string, band: PriceBand): CatalogProduct[] {
  const params: Record<string, string> = {}
  if (band.min !== undefined) params.min = String(band.min)
  if (band.max !== undefined) params.max = String(band.max)
  return filterProducts(all, categoryFilters(categorySlug, parseFilters(params)))
}

export const getPriceBand = (slug: string) => PRICE_BANDS.find(b => b.slug === slug)

// 作る組み合わせ（商品が BAND_MIN_ITEMS 件以上あるものだけ）
export function bandPages(all: CatalogProduct[]): { slug: string; band: string }[] {
  return bandCategories().flatMap(category =>
    PRICE_BANDS.filter(band => bandProducts(all, category.slug, band).length >= BAND_MIN_ITEMS).map(band => ({ slug: category.slug, band: band.slug })),
  )
}
