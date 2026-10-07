// 楽天市場の商品を products テーブルに同期する（3日ごとの定期実行と、管理画面からの手動実行）
// 価格・レビューを更新し、新しく見つかった商品を追加する。しばらく見つからない商品は非表示にする
import { BONSAI_GENRE_ID, searchRakutenItems, type RakutenItem, type RakutenSort } from '@/lib/rakuten'
import { SHOP_CATEGORIES, type ShopCategory } from '@/lib/shop-categories'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  detectBonsaiCategory,
  detectClaims,
  detectHeightCm,
  detectProductType,
  detectSizeCategory,
  detectTags,
} from '@/lib/product-classify'

// カテゴリごとに「おすすめ順」と「新着順」を取得して、人気商品と新商品の両方を拾う
const SORTS: RakutenSort[] = ['standard', '-updateTimestamp']
// 楽天APIの上限（1秒1回程度）を超えないよう間隔をあける
const REQUEST_INTERVAL_MS = 1100
// この日数のあいだ同期で見つからなかった商品は販売終了などとみなして非表示にする
const DEACTIVATE_AFTER_DAYS = 10

export interface SyncSummary {
  ok: boolean
  fetched: number
  upserted: number
  deactivated: number
  failedRequests: number
  errors: string[]
  startedAt: string
  finishedAt: string
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function toRow(item: RakutenItem, category: ShopCategory, now: string) {
  const text = `${item.name} ${item.caption}`
  const productType = detectProductType(item.name, category)
  const heightCm = detectHeightCm(text)
  const claims = detectClaims(item.name)

  return {
    source: 'rakuten',
    external_id: item.code,
    name: item.name.slice(0, 255),
    description: item.caption,
    price: item.price,
    category: detectBonsaiCategory(item.name, productType),
    tags: detectTags(item.name),
    size_category: detectSizeCategory(item.name, heightCm),
    height_cm: heightCm,
    image_url: item.imageUrls[0] ?? item.imageUrl,
    rakuten_url: item.url,
    amazon_url: null,
    shop_name: item.shopName,
    product_type: productType,
    review_count: item.reviewCount,
    review_average: item.reviewAverage,
    free_shipping: item.freeShipping,
    affiliate_rate: item.affiliateRate,
    is_active: true,
    last_synced_at: now,
    sync_category: category.slug,
    // 既存カラムの既定値（true など）で根拠のない表示が出ないよう、商品名の表記から明示的に設定する
    indoor_suitable: claims.indoor,
    gift_suitable: claims.gift,
    beginner_friendly: claims.beginner,
    difficulty_level: null,
  }
}

export async function syncRakutenProducts(): Promise<SyncSummary> {
  const startedAt = new Date().toISOString()
  const errors: string[] = []
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return {
      ok: false, fetched: 0, upserted: 0, deactivated: 0, failedRequests: 0,
      errors: ['SUPABASE_SERVICE_ROLE_KEY が設定されていません'], startedAt, finishedAt: startedAt,
    }
  }

  const rows = new Map<string, ReturnType<typeof toRow>>()
  let failedRequests = 0
  let first = true

  for (const category of SHOP_CATEGORIES) {
    for (const sort of SORTS) {
      if (!first) await sleep(REQUEST_INTERVAL_MS)
      first = false
      const { items, error } = await searchRakutenItems({
        keyword: category.keyword,
        genreId: category.group === 'tree' ? BONSAI_GENRE_ID : undefined,
        sort,
        hits: 30,
        fresh: true,
      })
      if (error) {
        failedRequests++
        errors.push(`${category.slug}/${sort}: ${error}`)
        continue
      }
      const now = new Date().toISOString()
      // 先に取得したカテゴリを優先（同じ商品が複数カテゴリに出た場合）
      items.forEach(item => {
        if (!rows.has(item.code)) rows.set(item.code, toRow(item, category, now))
      })
    }
  }

  let upserted = 0
  const allRows = Array.from(rows.values())
  for (let i = 0; i < allRows.length; i += 100) {
    const chunk = allRows.slice(i, i + 100)
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'source,external_id' })
    if (error) {
      errors.push(`upsert: ${error.message}`)
    } else {
      upserted += chunk.length
    }
  }

  // 取得自体が失敗した回は、非表示処理を行わない（誤って全商品を消さないため）
  let deactivated = 0
  if (failedRequests === 0 && upserted > 0) {
    const threshold = new Date(Date.now() - DEACTIVATE_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('source', 'rakuten')
      .eq('is_active', true)
      .lt('last_synced_at', threshold)
      .select('id')
    if (error) errors.push(`deactivate: ${error.message}`)
    deactivated = data?.length ?? 0
  }

  return {
    ok: errors.length === 0,
    fetched: rows.size,
    upserted,
    deactivated,
    failedRequests,
    errors: errors.slice(0, 10),
    startedAt,
    finishedAt: new Date().toISOString(),
  }
}
