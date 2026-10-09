import { NextResponse } from 'next/server'
import { getCatalogProducts } from '@/lib/catalog'
import type { CompactProduct } from '@/components/catalog/CompareBar'

// 「気になる」に保存できる上限（src/lib/favorites.ts の FAVORITES_MAX と同じ）
const MAX_IDS = 30

// 「気になる」の一覧・比較に使う（カード・比較表の表示名・樹種・送料・販売店の表記も返す）、指定した id の商品情報（商品データはサーバー側のキャッシュから返す）
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('ids') ?? ''
  const ids = Array.from(new Set(raw.split(',').map(v => v.trim()).filter(v => /^[\w-]{1,64}$/.test(v)))).slice(0, MAX_IDS)
  if (!ids.length) return NextResponse.json({ products: [] })

  const wanted = new Set(ids)
  const all = await getCatalogProducts()
  const found = new Map(all.filter(p => wanted.has(p.id)).map(p => [p.id, p]))
  const products: CompactProduct[] = ids.flatMap(id => {
    const p = found.get(id)
    if (!p) return []
    return [{
      id: p.id, name: p.name, displayName: p.displayName, speciesKey: p.speciesKey, placeClaim: p.placeClaim, levelClaim: p.levelClaim, price: p.price, imageUrl: p.imageUrl, source: p.source, buyUrl: p.buyUrl, shopName: p.shopName,
      productType: p.productType, category: p.category, sizeCategory: p.sizeCategory, heightCm: p.heightCm,
      reviewCount: p.reviewCount, reviewAverage: p.reviewAverage, freeShipping: p.freeShipping, lastSyncedAt: p.lastSyncedAt,
      speciesLabel: p.speciesLabel, place: p.place, enjoy: p.enjoy, seasons: p.seasons, level: p.level,
    }]
  })

  return NextResponse.json(
    // checked：商品データを読み込めたうえで探したか（false のときは、見つからない id を「掲載終了」と決めつけない）
    { products, checked: all.length > 0 },
    // 商品データは同期のたびに変わるため、CDN では1時間だけ使い回す
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', 'X-Robots-Tag': 'noindex' } },
  )
}
