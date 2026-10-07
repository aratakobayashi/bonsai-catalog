import { NextResponse } from 'next/server'
import { isRakutenConfigured, searchRakutenItems } from '@/lib/rakuten'
import { supabaseServer } from '@/lib/supabase-server'

// 楽天API の接続確認用（キーの値は返さない。キャッシュを使わずに1件だけ取得する）
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isRakutenConfigured()) {
    return NextResponse.json({ configured: false, ok: false, affiliate: Boolean(process.env.RAKUTEN_AFFILIATE_ID) })
  }
  const { items, error } = await searchRakutenItems({ keyword: '盆栽', hits: 1, fresh: true })

  // 同期の状況（DB拡張前は列がないため null）
  const { data: latest } = await supabaseServer
    .from('products')
    .select('last_synced_at')
    .eq('source', 'rakuten')
    .order('last_synced_at', { ascending: false })
    .limit(1)
  const { count } = await supabaseServer
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('source', 'rakuten')
    .eq('is_active', true)

  return NextResponse.json({
    lastSyncedAt: (latest as { last_synced_at: string }[] | null)?.[0]?.last_synced_at ?? null,
    activeRakutenProducts: count ?? null,
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    configured: true,
    affiliate: Boolean(process.env.RAKUTEN_AFFILIATE_ID),
    ok: !error && items.length > 0,
    error: error ?? null,
    affiliateLink: items[0] ? /hb\.afl\.rakuten\.co\.jp/.test(items[0].url) : null,
  })
}
