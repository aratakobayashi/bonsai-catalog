import { NextResponse } from 'next/server'
import reviewData from '@/data/product-image-review.json'
import { searchRakutenItems } from '@/lib/rakuten'
import { supabaseServer } from '@/lib/supabase-server'

// 月1回の画像の選び直し用（docs/growth/image-review.md）。まだ確認していない楽天商品について、
// ショップが登録した画像の候補（最大3枚）を返す。楽天 API は1秒に1回までのため、1回の呼び出しで8件ずつ（?offset=）。
// 結果は1日キャッシュする（何度呼ばれても API の利用は1日あたり限られる）
export const revalidate = 86400
const BATCH = 8
const reviewed = new Set((reviewData as { reviewed: string[] }).reviewed)

export async function GET(request: Request) {
  const offset = Math.max(0, Math.min(5000, Number(new URL(request.url).searchParams.get('offset')) || 0))
  const { data, error } = await supabaseServer
    .from('products')
    .select('id, external_id, image_url')
    .eq('source', 'rakuten')
    .or('is_active.is.null,is_active.eq.true')
    .order('id', { ascending: true })
    .limit(3000)
  if (error) return NextResponse.json({ error: error.message }, { status: 502 })

  const pending = ((data || []) as { id: string; external_id: string | null; image_url: string | null }[]).filter(row => !reviewed.has(row.id))
  const items: { id: string; current: string | null; images: string[] }[] = []
  for (const [index, row] of pending.slice(offset, offset + BATCH).entries()) {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, 1050))
    if (!row.external_id) {
      items.push({ id: row.id, current: row.image_url, images: [] })
      continue
    }
    const result = await searchRakutenItems({ itemCode: row.external_id, hits: 1 })
    items.push({ id: row.id, current: row.image_url, images: result.items[0]?.imageUrls ?? [] })
  }
  return NextResponse.json({ pending: pending.length, offset, items })
}
