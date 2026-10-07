import { NextResponse } from 'next/server'
import { isRakutenConfigured, searchRakutenItems } from '@/lib/rakuten'

// 楽天API の接続確認用（キーの値は返さない。結果は6時間キャッシュされる検索を使う）
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isRakutenConfigured()) {
    return NextResponse.json({ configured: false, ok: false, affiliate: Boolean(process.env.RAKUTEN_AFFILIATE_ID) })
  }
  const { items, error } = await searchRakutenItems({ keyword: '盆栽', hits: 1 })
  return NextResponse.json({
    configured: true,
    affiliate: Boolean(process.env.RAKUTEN_AFFILIATE_ID),
    ok: !error && items.length > 0,
    error: error ?? null,
    affiliateLink: items[0] ? /hb\.afl\.rakuten\.co\.jp/.test(items[0].url) : null,
  })
}
