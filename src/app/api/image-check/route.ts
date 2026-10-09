import { NextResponse } from 'next/server'
import { searchRakutenItems } from '@/lib/rakuten'
import { supabaseServer } from '@/lib/supabase-server'

// 【一時的な作業用】掲載中の楽天商品の画像候補（最大3枚）を集め、「盆栽が一番よく見える1枚」を選ぶために使う。
// 楽天の API は1秒に1回までのため、1回の呼び出しで8件ずつ（?offset=）。結果は1日キャッシュする。作業が終わったら削除する
export const revalidate = 86400
const BATCH = 8

export async function GET(request: Request) {
  const offset = Math.max(0, Math.min(5000, Number(new URL(request.url).searchParams.get('offset')) || 0))
  const { data, error, count } = await supabaseServer
    .from('products')
    .select('id, external_id, image_url', { count: 'exact' })
    .eq('source', 'rakuten')
    .or('is_active.is.null,is_active.eq.true')
    .order('id', { ascending: true })
    .range(offset, offset + BATCH - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 502 })

  const items: { id: string; current: string | null; images: string[] }[] = []
  for (const [index, row] of ((data || []) as { id: string; external_id: string | null; image_url: string | null }[]).entries()) {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, 1050))
    if (!row.external_id) {
      items.push({ id: row.id, current: row.image_url, images: [] })
      continue
    }
    const result = await searchRakutenItems({ itemCode: row.external_id, hits: 1 })
    items.push({ id: row.id, current: row.image_url, images: result.items[0]?.imageUrls ?? [] })
  }
  return NextResponse.json({ total: count ?? 0, offset, items })
}
