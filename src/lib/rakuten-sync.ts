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

// カテゴリごとに「おすすめ順」の上位3ページ（90件）と「新着順」の1ページを取得して、人気商品と新商品の両方を拾う
const REQUESTS_PER_CATEGORY: { sort: RakutenSort; page: number }[] = [
  { sort: 'standard', page: 1 },
  { sort: 'standard', page: 2 },
  { sort: 'standard', page: 3 },
  { sort: '-updateTimestamp', page: 1 },
]
// 楽天APIの上限（1秒1回程度）を超えないよう間隔をあける
const REQUEST_INTERVAL_MS = 1100
// この日数のあいだ同期で見つからなかった商品は販売終了などとみなして非表示にする
const DEACTIVATE_AFTER_DAYS = 10
// 1回の実行で使う時間の上限（Vercel の関数の上限60秒より短くし、残りは次回に回す）
const TIME_BUDGET_MS = 40_000

export interface SyncSummary {
  ok: boolean
  processedCategories: string[]
  remainingCategories: number
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
    // products の説明文には btree 索引（1件あたり約2,700バイトまで）があるため、600字（日本語で約1,800バイト）に切る
    description: item.caption.slice(0, 600),
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

// 前回の同期が古いカテゴリから順に処理する
async function categoriesByStaleness(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>): Promise<ShopCategory[]> {
  const { data } = await supabase
    .from('products')
    .select('sync_category, last_synced_at')
    .eq('source', 'rakuten')
    .not('sync_category', 'is', null)
    .order('last_synced_at', { ascending: false })
    .limit(5000)
  const latest = new Map<string, string>()
  ;(data || []).forEach((row: { sync_category: string; last_synced_at: string }) => {
    if (!latest.has(row.sync_category)) latest.set(row.sync_category, row.last_synced_at)
  })
  return [...SHOP_CATEGORIES].sort((a, b) => (latest.get(a.slug) || '').localeCompare(latest.get(b.slug) || ''))
}

export async function syncRakutenProducts(): Promise<SyncSummary> {
  const started = Date.now()
  const startedAt = new Date(started).toISOString()
  const errors: string[] = []
  const supabase = getSupabaseAdmin()
  const empty = { processedCategories: [], remainingCategories: SHOP_CATEGORIES.length, fetched: 0, upserted: 0, deactivated: 0, failedRequests: 0 }
  if (!supabase) {
    return { ok: false, ...empty, errors: ['SUPABASE_SERVICE_ROLE_KEY が設定されていません'], startedAt, finishedAt: startedAt }
  }

  const categories = await categoriesByStaleness(supabase)
  const processed: string[] = []
  const seen = new Set<string>()
  let fetched = 0
  let upserted = 0
  let failedRequests = 0
  let requestCount = 0

  for (const category of categories) {
    // 次のカテゴリを処理しきれない可能性があれば、残りは次回に回す
    if (Date.now() - started > TIME_BUDGET_MS) break

    const rows: ReturnType<typeof toRow>[] = []
    let skipStandard = false
    for (const { sort, page } of REQUESTS_PER_CATEGORY) {
      if (skipStandard && sort === 'standard') continue
      if (requestCount > 0) await sleep(REQUEST_INTERVAL_MS)
      requestCount++
      const { items, error } = await searchRakutenItems({
        keyword: category.keyword,
        genreId: category.group === 'tree' ? BONSAI_GENRE_ID : undefined,
        sort,
        page,
        hits: 30,
        fresh: true,
      })
      if (error) {
        failedRequests++
        errors.push(`${category.slug}/${sort}/p${page}: ${error}`)
        continue
      }
      const now = new Date().toISOString()
      // おすすめ順の途中で商品が尽きたら、それ以降のページは取得しない
      const exhausted = sort === 'standard' && items.length < 30
      items.forEach(item => {
        // 同じ商品が複数カテゴリに出た場合は、先に処理したカテゴリを優先
        if (!seen.has(item.code)) {
          seen.add(item.code)
          rows.push(toRow(item, category, now))
        }
      })
      if (exhausted) skipStandard = true
    }

    // カテゴリごとに保存する（途中で止まっても、そこまでの結果は残る）
    if (rows.length > 0) {
      fetched += rows.length
      const { error } = await supabase.from('products').upsert(rows, { onConflict: 'source,external_id' })
      if (error) {
        errors.push(`upsert(${category.slug}): ${error.message}`)
      } else {
        upserted += rows.length
      }
    }
    processed.push(category.slug)
  }

  // 取得に失敗した回は、非表示処理を行わない（誤って商品を消さないため）
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
    processedCategories: processed,
    remainingCategories: categories.length - processed.length,
    fetched,
    upserted,
    deactivated,
    failedRequests,
    errors: errors.slice(0, 10),
    startedAt,
    finishedAt: new Date().toISOString(),
  }
}
