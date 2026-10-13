// 商品データの取得（サーバー・ビルド時専用）。絞り込みなどの計算は catalog.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from 'next/cache'
import { supabaseServer } from '@/lib/supabase-server'
import { normalizeProduct, type CatalogProduct } from '@/lib/catalog-model'
import { isHiddenProductSource } from '@/lib/affiliate'
import { PRODUCTS_CACHE_TAG } from '@/lib/catalog'

const LIST_COLUMNS = [
  'id', 'name', 'price', 'image_url', 'source', 'amazon_url', 'rakuten_url', 'shop_name', 'product_type',
  'category', 'size_category', 'height_cm', 'review_count', 'review_average', 'free_shipping', 'is_active',
  'created_at', 'last_synced_at', 'sync_category', 'tags', 'indoor_suitable', 'gift_suitable',
  'beginner_friendly', 'difficulty_level',
].join(', ')

/* eslint-disable @typescript-eslint/no-explicit-any */
// Supabase は1回に最大1,000行までしか返さず、Next.js のデータキャッシュは1件2MBまでなので、
// 商品は800行ずつに分けて取得・キャッシュする（1行は約1KB）
const CHUNK_SIZE = 800
const MAX_CHUNKS = 15

async function fetchChunkOnce(index: number): Promise<any[]> {
  const from = index * CHUNK_SIZE
  const primary = await supabaseServer
    .from('products')
    .select(LIST_COLUMNS)
    .or('is_active.is.null,is_active.eq.true')
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, from + CHUNK_SIZE - 1)
  let data: any[] | null = primary.data as any[] | null
  let error = primary.error

  // 拡張前のDB（列が足りない）では全列を取得して補う
  if (error) {
    // 2つ目以降の塊の失敗は「0件」として保存せず、やり直しに回す
    if (index > 0) throw new Error(`商品データの取得エラー: ${error.message}`)
    const fallback = await supabaseServer.from('products').select('*').order('created_at', { ascending: false }).limit(1000)
    data = (fallback.data || []).map((row: any) => ({ ...row, description: undefined }))
    error = fallback.error
  }
  if (error) {
    // 空の結果をキャッシュに残さないよう、失敗は例外にしてやり直す
    throw new Error(`商品データの取得エラー: ${error.message}`)
  }
  return data || []
}

// 通信が一時的に切れた場合に備えて2回までやり直す
async function fetchChunk(index: number): Promise<any[]> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchChunkOnce(index)
    } catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

// DB の行データを3時間キャッシュし（同期の直後には破棄される）、表示用の形への変換は毎回行う。
// 変換処理（商品名の整理など）を変えたときに、古いキャッシュの表示が残らないようにするため
const getCachedChunk = unstable_cache(fetchChunk, ['catalog-product-rows-v2'], {
  revalidate: 10800,
  tags: [PRODUCTS_CACHE_TAG],
})

async function getCachedProductRows(): Promise<any[]> {
  const rows: any[] = []
  const seen = new Set<string>()
  for (let index = 0; index < MAX_CHUNKS; index++) {
    const chunk = await getCachedChunk(index)
    // キャッシュの更新時刻がずれて同じ商品が2つの塊に入った場合に備えて重複を除く
    chunk.forEach(row => {
      if (!seen.has(row.id)) {
        seen.add(row.id)
        rows.push(row)
      }
    })
    if (chunk.length < CHUNK_SIZE) break
  }
  // Amazon の掲載を止めている間は Amazon の商品を除く（src/lib/affiliate.ts の AMAZON_ENABLED）
  return rows.filter(row => row.is_active !== false && !isHiddenProductSource(row.source))
}

// 整えた商品データを、同じサーバーの中で10分間使い回す（ページを作るたびに約2,000件を整え直すと、サーバーの計算時間がかさむため）
// 取得中の Promise も共有し、同時に来たリクエストで二重に取得しない。失敗したときは使い回さない
const MEMO_TTL_MS = 10 * 60 * 1000
let memo: { at: number; promise: Promise<CatalogProduct[]> } | null = null

export function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (memo && Date.now() - memo.at < MEMO_TTL_MS) return memo.promise
  const promise = loadCatalogProducts()
  memo = { at: Date.now(), promise }
  promise.catch(() => {
    if (memo?.promise === promise) memo = null
  })
  return promise
}

async function loadCatalogProducts(): Promise<CatalogProduct[]> {
  // 通信が一時的に失敗した場合に備えて、間をあけて3回まで取得する
  // （デプロイ直後はキャッシュが空で取得が集中し、失敗しやすい。失敗したまま「準備中」の表示がキャッシュに残るのを防ぐ）
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const rows = await getCachedProductRows()
      if (rows.length > 0) return rows.map(normalizeProduct)
      lastError = new Error('商品データが0件でした')
    } catch (error) {
      lastError = error
    }
    console.error(`商品データの取得に失敗しました（${attempt + 1}回目）:`, lastError instanceof Error ? lastError.message : lastError)
    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
  }
  throw lastError
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// 商品ページ用の、一覧には載せない項目（販売店の説明文・楽天の商品コード）。ビルド中に1回だけまとめて取る
export interface ProductExtra { description: string; externalId: string | null }
let extrasMemo: Promise<Map<string, ProductExtra>> | null = null
export function getProductExtras(): Promise<Map<string, ProductExtra>> {
  if (!extrasMemo) {
    extrasMemo = (async () => {
      const map = new Map<string, ProductExtra>()
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabaseServer.from('products').select('id, description, external_id').order('id', { ascending: true }).range(from, from + 999)
        if (error) throw new Error(`商品の説明文の取得エラー: ${error.message}`)
        for (const row of (data || []) as { id: string; description: unknown; external_id: unknown }[]) {
          map.set(row.id, { description: typeof row.description === 'string' ? row.description : '', externalId: typeof row.external_id === 'string' ? row.external_id : null })
        }
        if (!data || data.length < 1000) break
      }
      return map
    })()
    extrasMemo.catch(() => { extrasMemo = null })
  }
  return extrasMemo
}

