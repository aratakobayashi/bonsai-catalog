import { NextResponse } from 'next/server'
import { BONSAI_GENRE_ID, searchRakutenItems } from '@/lib/rakuten'

// 【一時的な検証用】商品画像の候補（最大3枚）に「盆栽だけの写真」がどれくらいあるかを確かめる。
// 楽天の検索1回分（レビューの多い盆栽30件）だけを返し、1日キャッシュする。検証が終わったら削除する
export const revalidate = 86400

export async function GET() {
  const { items, error } = await searchRakutenItems({ keyword: '盆栽', genreId: BONSAI_GENRE_ID, sort: '-reviewCount', hits: 30 })
  if (error) return NextResponse.json({ error }, { status: 502 })
  return NextResponse.json({
    items: items.map(item => ({ code: item.code, name: item.name.slice(0, 60), shop: item.shopName, images: item.imageUrls })),
  })
}
